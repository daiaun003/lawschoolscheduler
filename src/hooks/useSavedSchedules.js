import { useEffect, useState } from 'react'

const KEY = 'lawscheduler.saved.v1'
export const MAX_SAVED = 3

let seq = 0
const uid = () => `${Date.now().toString(36)}${(seq++).toString(36)}`

function load() {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY))
    if (!Array.isArray(arr)) return []
    // Keep only well-formed slots, capped at the max.
    return arr
      .filter((s) => s && typeof s.id === 'string' && Array.isArray(s.courseIds))
      .slice(0, MAX_SAVED)
      .map((s) => ({ id: s.id, name: String(s.name || 'Untitled'), courseIds: s.courseIds }))
  } catch {
    return []
  }
}

// Owns up to MAX_SAVED named schedule snapshots, persisted to localStorage.
export function useSavedSchedules() {
  const [saved, setSaved] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(saved))
  }, [saved])

  const saveNew = (courseIds, name) =>
    setSaved((s) =>
      s.length >= MAX_SAVED
        ? s
        : [
            ...s,
            {
              id: uid(),
              name: name || `Schedule ${s.length + 1}`,
              courseIds: [...courseIds],
            },
          ],
    )

  const rename = (id, name) =>
    setSaved((s) => s.map((x) => (x.id === id ? { ...x, name } : x)))

  const overwrite = (id, courseIds) =>
    setSaved((s) => s.map((x) => (x.id === id ? { ...x, courseIds: [...courseIds] } : x)))

  const remove = (id) => setSaved((s) => s.filter((x) => x.id !== id))

  return { saved, max: MAX_SAVED, saveNew, rename, overwrite, remove }
}
