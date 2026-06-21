import { useEffect, useState } from 'react'

const KEY = 'lawscheduler.selected.v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

// Owns the set of selected course ids and persists it to localStorage.
export function useSchedule() {
  const [selectedIds, setSelectedIds] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(selectedIds))
  }, [selectedIds])

  const isSelected = (id) => selectedIds.includes(id)

  const toggle = (id) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    )

  const clearAll = () => setSelectedIds([])

  return { selectedIds, isSelected, toggle, clearAll }
}
