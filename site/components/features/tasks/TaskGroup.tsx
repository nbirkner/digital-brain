"use client"

import { TodoistTask } from "@/lib/todoist"
import { TaskGroup as TaskGroupType, DueBucket } from "./types"
import { TaskRow, TodoistProject } from "./TaskRow"

// ─── date helper (local, not exported — used only in GroupSection) ─────────────

function getDueBucket(task: TodoistTask, today: string): DueBucket {
  if (!task.due?.date) return "none"
  if (task.due.date < today) return "overdue"
  if (task.due.date === today) return "today"
  return "later"
}

// ─── GroupSection ─────────────────────────────────────────────────────────────

export interface GroupSectionProps {
  group: TaskGroupType
  collapsed: boolean
  onToggle: () => void
  dismissed: Set<string>
  onDismiss: (id: string) => void
  onComplete?: (task: TodoistTask) => void
  onOpenPanel: (task: TodoistTask) => void
  onDelete: (task: TodoistTask) => void
  today: string
  projects?: TodoistProject[]
  waitingProjectId?: string | null
  sharedProjectId?: string | null
  focusedTaskId?: string | null
  kbDatePickerTaskId?: string | null
  onKbDatePickerClose?: () => void
  onContextMenu?: (e: React.MouseEvent, task: TodoistTask) => void
  selectedTaskIds?: Set<string>
  onToggleSelect?: (id: string) => void
  selectionMode?: boolean
  onOptimisticOverride?: (id: string, update: Partial<TodoistTask>) => void
  showLabel?: boolean
}

export function GroupSection({ group, collapsed, onToggle, dismissed, onDismiss, onComplete, onOpenPanel, onDelete, today, projects = [], waitingProjectId, sharedProjectId, focusedTaskId, kbDatePickerTaskId, onKbDatePickerClose, onContextMenu, selectedTaskIds, onToggleSelect, selectionMode, onOptimisticOverride, showLabel = true }: GroupSectionProps) {
  const visible = group.tasks.filter((t) => !dismissed.has(t.id))
  if (visible.length === 0) return null

  const accent = group.accent ?? "default"
  const labelColorClass =
    accent === "red"
      ? "text-red-400"
      : accent === "amber"
      ? "text-amber-400"
      : "text-notion-muted/60"

  // For flat "none" grouping, render tasks without a header
  if (!group.label) {
    return (
      <div className="divide-y divide-notion-border/30">
        {group.tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            bucket={getDueBucket(task, today)}
            dismissed={dismissed.has(task.id)}
            onDismiss={onDismiss}
            onComplete={onComplete}
            onOpenPanel={onOpenPanel}
            onDelete={onDelete}
            projects={projects}
            waitingProjectId={waitingProjectId}
            sharedProjectId={sharedProjectId}
            isFocused={focusedTaskId === task.id}
            externalDatePickerOpen={kbDatePickerTaskId === task.id}
            onExternalDatePickerClose={onKbDatePickerClose}
            onContextMenu={onContextMenu}
            onOptimisticOverride={onOptimisticOverride}
            isSelected={selectedTaskIds?.has(task.id)}
            onToggleSelect={onToggleSelect}
            selectionMode={selectionMode}
            showLabel={showLabel}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-5">
      <div
        className="flex items-center gap-2 mb-2 px-1 cursor-pointer select-none"
        onClick={onToggle}
      >
        <svg
          className={`w-3 h-3 text-notion-muted/40 transition-transform flex-shrink-0 ${collapsed ? "" : "rotate-90"}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4.5 2.5l4 3.5-4 3.5" />
        </svg>
        <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${labelColorClass}`}>
          {group.label}
        </p>
        <span className="text-[10px] text-notion-muted/40 font-mono">{visible.length}</span>
      </div>
      {!collapsed && (
        <div className="divide-y divide-notion-border/30">
          {group.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              bucket={group.bucket ?? getDueBucket(task, today)}
              dismissed={dismissed.has(task.id)}
              onDismiss={onDismiss}
              onComplete={onComplete}
              onOpenPanel={onOpenPanel}
              onDelete={onDelete}
              projects={projects}
              waitingProjectId={waitingProjectId}
              sharedProjectId={sharedProjectId}
              isFocused={focusedTaskId === task.id}
              externalDatePickerOpen={kbDatePickerTaskId === task.id}
              onExternalDatePickerClose={onKbDatePickerClose}
              onContextMenu={onContextMenu}
              onOptimisticOverride={onOptimisticOverride}
              isSelected={selectedTaskIds?.has(task.id)}
              onToggleSelect={onToggleSelect}
              selectionMode={selectionMode}
              showLabel={showLabel}
            />
          ))}
        </div>
      )}
    </div>
  )
}
