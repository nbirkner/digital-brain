"use client"

import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export interface DueDatePickerProps {
  currentDate: string | undefined
  onSave: (due_string: string) => void
  onClose: () => void
  style?: React.CSSProperties
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatDateISO(d: Date): string {
  return d.toLocaleDateString("en-CA") // YYYY-MM-DD
}

function parseNaturalDate(input: string): string | null {
  const text = input.toLowerCase().trim()
  const today = new Date()

  if (text === "today" || text === "tod") {
    return formatDateISO(today)
  }
  if (text === "tomorrow" || text === "tom") {
    const d = new Date(today); d.setDate(d.getDate() + 1)
    return formatDateISO(d)
  }
  if (text === "no date" || text === "none" || text === "clear") {
    return "" // empty = remove date
  }
  // "monday", "tuesday", etc -> next occurrence
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
  const shortDays = ["sun","mon","tue","wed","thu","fri","sat"]
  let dayIdx = days.indexOf(text)
  if (dayIdx === -1) dayIdx = shortDays.indexOf(text)
  if (dayIdx !== -1) {
    const d = new Date(today)
    const diff = (dayIdx - d.getDay() + 7) % 7 || 7
    d.setDate(d.getDate() + diff)
    return formatDateISO(d)
  }
  // "next week" -> Wednesday of next calendar week (mid-week, more useful than Monday)
  if (text === "next week") {
    const d = new Date(today)
    const daysToNextMon = ((1 - d.getDay() + 7) % 7) || 7
    d.setDate(d.getDate() + daysToNextMon + 2) // Monday + 2 = Wednesday
    return formatDateISO(d)
  }
  // "this weekend" or "weekend"
  if (text === "this weekend" || text === "weekend") {
    const d = new Date(today)
    const diff = (6 - d.getDay() + 7) % 7 || 7
    d.setDate(d.getDate() + diff)
    return formatDateISO(d)
  }
  // "next month" -> 1st of next month
  if (text === "next month") {
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return formatDateISO(d)
  }
  // "later" -> 3 months from today
  if (text === "later") {
    const d = new Date(today)
    d.setMonth(d.getMonth() + 3)
    return formatDateISO(d)
  }
  // "in N days"
  const inDays = text.match(/^in (\d+) days?$/)
  if (inDays) {
    const d = new Date(today); d.setDate(d.getDate() + parseInt(inDays[1]))
    return formatDateISO(d)
  }
  // "apr 15", "april 15", "jan 3" etc
  const monthDay = text.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})$/)
  if (monthDay) {
    const months: Record<string,number> = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11}
    const m = months[monthDay[1].slice(0,3)]
    const d = new Date(today.getFullYear(), m, parseInt(monthDay[2]))
    if (d < today) d.setFullYear(d.getFullYear() + 1)
    return formatDateISO(d)
  }
  return null // couldn't parse
}

function getQuickOptions() {
  const today = new Date()
  const dow = today.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

  // Helper: get a date N days from today as ISO string
  function daysFromNow(n: number): string {
    const d = new Date(today)
    d.setDate(d.getDate() + n)
    return formatDateISO(d)
  }

  // Saturday of this week or next, always at least 2 days away
  function thisWeekend(): string {
    const diff = (6 - dow + 7) % 7
    // If Saturday is 0 or 1 days away (today is Sat or Fri), go to next Saturday
    return daysFromNow(diff < 2 ? diff + 7 : diff)
  }

  // Wednesday of next calendar week (Mon-Sun weeks, so next Mon + 2)
  function nextWednesday(): string {
    const daysToNextMon = ((1 - dow + 7) % 7) || 7
    return daysFromNow(daysToNextMon + 2)
  }

  const opts: { label: string; due_string: string; colorClass: string }[] = [
    { label: "Today",    due_string: formatDateISO(today), colorClass: "text-amber-400 border-amber-400/30" },
    { label: "Tomorrow", due_string: daysFromNow(1),       colorClass: "text-blue-400 border-blue-400/30" },
  ]

  // Weekend option — skip if today is Sat (6) or Sun (0)
  if (dow === 5) {
    // Friday: "This weekend" = tomorrow (Sat)
    opts.push({ label: "This weekend", due_string: daysFromNow(1), colorClass: "text-purple-400 border-purple-400/30" })
  } else if (dow < 5) {
    // Mon–Thu: show upcoming Saturday
    opts.push({ label: "This weekend", due_string: thisWeekend(), colorClass: "text-purple-400 border-purple-400/30" })
  }
  // Sat or Sun: skip "This weekend" — already the weekend

  // Next week = Wednesday of next calendar week, labelled with the date
  const nextWed = nextWednesday()
  const nextWedDisplay = new Date(`${nextWed}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  opts.push({ label: `Next week (${nextWedDisplay})`, due_string: nextWed, colorClass: "text-green-400 border-green-400/30" })

  // Later = 2 weeks from now
  opts.push({ label: "Later", due_string: daysFromNow(14), colorClass: "text-notion-muted border-notion-border/30" })

  // No date
  opts.push({ label: "No date", due_string: "no date", colorClass: "text-notion-muted border-notion-border/30" })

  return opts
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

export function DueDatePicker({ currentDate, onSave, onClose, style }: DueDatePickerProps) {
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [highlightedIndex, setHighlightedIndex] = useState(-1) // -1 = text input focused
  const [inputValue, setInputValue] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const quickOptions = getQuickOptions()
  const quickPickCount = quickOptions.length

  // Find the best matching quick-pick index for a given input string
  function findMatchingIndex(value: string): number {
    if (!value.trim()) return -1
    const lower = value.toLowerCase().trim()
    // Prefix match first
    const prefixIdx = quickOptions.findIndex(o => o.label.toLowerCase().startsWith(lower))
    if (prefixIdx !== -1) return prefixIdx
    // Includes match fallback
    const includesIdx = quickOptions.findIndex(o => o.label.toLowerCase().includes(lower))
    return includesIdx // -1 if no match
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  // Auto-focus text input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSelectQuickPick(index: number) {
    const opt = quickOptions[index]
    onSave(opt.due_string)
    onClose()
  }

  function handleInputSubmit() {
    const parsed = parseNaturalDate(inputValue)
    if (parsed !== null) {
      if (parsed === "") {
        onSave("no date")
      } else {
        onSave(parsed)
      }
      onClose()
    }
  }

  function handleContainerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex(i => {
        const next = Math.min(i + 1, quickPickCount - 1)
        if (next >= 0) inputRef.current?.blur()
        return next
      })
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex(i => {
        const next = Math.max(i - 1, -1)
        if (next === -1) inputRef.current?.focus()
        return next
      })
      return
    }
    if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault()
      handleSelectQuickPick(highlightedIndex)
      return
    }
  }

  function handleDayClick(day: number) {
    const m = String(calMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    onSave(`${calYear}-${m}-${d}`)
    onClose()
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }

  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const dayHeaders = ["S","M","T","W","T","F","S"]
  const calDays = buildCalendarDays(calYear, calMonth)

  const todayY = today.getFullYear()
  const todayM = today.getMonth()
  const todayD = today.getDate()

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onKeyDown={handleContainerKeyDown}
      className="bg-notion-surface border border-notion-border rounded-xl shadow-2xl p-3 w-72 z-[200] outline-none"
      style={style}
    >
      {/* Natural language text input */}
      <input
        ref={inputRef}
        autoFocus
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value
          setInputValue(val)
          setHighlightedIndex(findMatchingIndex(val))
        }}
        placeholder="Type a date..."
        className="w-full px-3 py-2 text-sm bg-transparent border-b border-notion-border/30 text-notion-text placeholder:text-notion-muted/40 outline-none mb-2"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            e.stopPropagation()
            if (highlightedIndex >= 0) {
              handleSelectQuickPick(highlightedIndex)
            } else {
              handleInputSubmit()
            }
          }
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlightedIndex(i => Math.min(i + 1, quickPickCount - 1))
          }
          if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlightedIndex(i => Math.max(i - 1, -1))
          }
          if (e.key === "Escape") {
            e.preventDefault()
            onClose()
          }
        }}
        onFocus={() => setHighlightedIndex(findMatchingIndex(inputValue))}
      />

      {/* Quick options */}
      <div className="px-1 py-2 flex flex-wrap gap-1.5 mb-3">
        {quickOptions.map((opt, idx) => (
          <button
            key={opt.due_string}
            onClick={() => { onSave(opt.due_string); onClose() }}
            onMouseEnter={() => setHighlightedIndex(idx)}
            onMouseLeave={() => setHighlightedIndex(-1)}
            className={[
              "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
              highlightedIndex === idx
                ? "bg-notion-hover ring-1 ring-current ring-offset-1 ring-offset-notion-surface"
                : "bg-notion-surface hover:bg-notion-hover",
              opt.colorClass,
            ].join(" ")}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Mini calendar */}
      <div className="border-t border-notion-border pt-3">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            onClick={prevMonth}
            className="w-6 h-6 flex items-center justify-center rounded text-notion-muted hover:text-notion-text hover:bg-notion-hover transition-colors text-xs"
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="text-xs font-semibold text-notion-text">
            {monthNames[calMonth]} {calYear}
          </span>
          <button
            onClick={nextMonth}
            className="w-6 h-6 flex items-center justify-center rounded text-notion-muted hover:text-notion-text hover:bg-notion-hover transition-colors text-xs"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {dayHeaders.map((h, i) => (
            <div key={i} className="text-center text-[10px] text-notion-muted/60 font-medium py-0.5">
              {h}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {calDays.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />

            const isToday = calYear === todayY && calMonth === todayM && day === todayD

            const mStr = String(calMonth + 1).padStart(2, "0")
            const dStr = String(day).padStart(2, "0")
            const dateStr = `${calYear}-${mStr}-${dStr}`
            const isSelected = currentDate === dateStr

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={[
                  "h-7 w-7 mx-auto flex items-center justify-center rounded-full text-xs transition-colors cursor-pointer",
                  isSelected
                    ? "bg-notion-accent text-white font-semibold"
                    : isToday
                    ? "bg-notion-accent/20 text-notion-accent font-semibold hover:bg-notion-accent/30"
                    : "text-notion-text hover:bg-notion-hover cursor-pointer",
                ].join(" ")}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface DueDateFieldProps {
  task: { due?: { date: string } | null }
  onSave: (due_string: string) => void
}

export function DueDateField({ task, onSave }: DueDateFieldProps) {
  const [open, setOpen] = useState(false)
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  function handleOpen() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPickerPos({ top: rect.bottom + 4, left: rect.left })
    }
    setOpen(true)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className="text-sm text-notion-text hover:text-notion-accent transition-colors"
      >
        {task.due?.date
          ? formatDisplayDate(task.due.date)
          : <span className="text-notion-muted/40 text-xs">set date…</span>
        }
      </button>
      {open && pickerPos && typeof document !== "undefined" && createPortal(
        <DueDatePicker
          currentDate={task.due?.date}
          onSave={onSave}
          onClose={() => setOpen(false)}
          style={{ position: "fixed", top: pickerPos.top, left: pickerPos.left }}
        />,
        document.body
      )}
    </div>
  )
}
