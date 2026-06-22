import { useEffect, useState } from 'react'
import { COURSES } from '../data/courses'

const KEY = 'lawscheduler.selected.v1'

// Only ids that still exist in the catalog are valid — guards against loading a
// saved schedule that references a course that's no longer offered.
const VALID_IDS = new Set(COURSES.map((c) => c.id))
const sanitize = (ids) =>
  Array.isArray(ids) ? ids.filter((id) => VALID_IDS.has(id)) : []

function load() {
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY)))
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

  // Replace the whole selection (used when loading a saved schedule).
  const setAll = (ids) => setSelectedIds(sanitize(ids))

  return { selectedIds, isSelected, toggle, clearAll, setAll }
}
