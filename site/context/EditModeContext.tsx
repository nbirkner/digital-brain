"use client"

import { createContext, useContext, useState, useCallback } from "react"

interface EditModeContextValue {
  /** True when the floating page button has requested edit mode */
  editRequested: boolean
  /** Call this from the floating button to trigger edit mode */
  requestEdit: () => void
  /** ContentEditor calls this once it has acknowledged the request */
  clearEditRequest: () => void
}

const EditModeContext = createContext<EditModeContextValue>({
  editRequested: false,
  requestEdit: () => {},
  clearEditRequest: () => {},
})

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [editRequested, setEditRequested] = useState(false)

  const requestEdit = useCallback(() => setEditRequested(true), [])
  const clearEditRequest = useCallback(() => setEditRequested(false), [])

  return (
    <EditModeContext.Provider value={{ editRequested, requestEdit, clearEditRequest }}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  return useContext(EditModeContext)
}
