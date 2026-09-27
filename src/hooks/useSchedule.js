import { useEffect, useState } from 'react'

// Only ids that still exist in the term's catalog are valid — guards against
// loading a saved schedule that references a course that's no longer offered.
function sanitizer(term) {
  const valid = new Set(term.courses.map((c) => c.id))
  return (ids) => (Array.isArray(ids) ? ids.filter((id) => valid.has(id)) : [])
}

// Owns the set of selected course ids for one term and persists it to
// localStorage under that term's key. Mount it keyed by term so switching
// terms starts from that term's stored selection.
export function useSchedule(term) {
  const sanitize = sanitizer(term)
  const [selectedIds, setSelectedIds] = useState(() => {
    try {
      return sanitize(JSON.parse(localStorage.getItem(term.selectedKey)))
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(term.selectedKey, JSON.stringify(selectedIds))
  }, [term.selectedKey, selectedIds])

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
