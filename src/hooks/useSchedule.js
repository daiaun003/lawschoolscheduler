import { useEffect, useState } from 'react'
import { COURSES } from '../data/courses'

const KEY = 'lawscheduler.selected.v1'
const URL_PARAM = 's'

// Only ids that still exist in the catalog are valid — guards against loading a
// saved schedule that references a course that's no longer offered.
const VALID_IDS = new Set(COURSES.map((c) => c.id))
const sanitize = (ids) =>
  Array.isArray(ids) ? ids.filter((id) => VALID_IDS.has(id)) : []

function readUrlIds() {
  try {
    const param = new URLSearchParams(window.location.search).get(URL_PARAM)
    if (!param) return null
    const ids = param.split(',').map(Number).filter((n) => Number.isFinite(n) && n > 0)
    return sanitize(ids)
  } catch {
    return null
  }
}

function load() {
  const fromUrl = readUrlIds()
  if (fromUrl && fromUrl.length > 0) return fromUrl
  try {
    return sanitize(JSON.parse(localStorage.getItem(KEY)))
  } catch {
    return []
  }
}

// Owns the set of selected course ids and persists it to localStorage and the URL.
export function useSchedule() {
  const [selectedIds, setSelectedIds] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(selectedIds))
    const url = new URL(window.location.href)
    if (selectedIds.length > 0) {
      url.searchParams.set(URL_PARAM, selectedIds.join(','))
    } else {
      url.searchParams.delete(URL_PARAM)
    }
    window.history.replaceState(null, '', url)
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
