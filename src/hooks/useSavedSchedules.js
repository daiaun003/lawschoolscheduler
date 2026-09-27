import { useEffect, useState } from 'react'

export const MAX_SAVED = 3

let seq = 0
const uid = () => `${Date.now().toString(36)}${(seq++).toString(36)}`

function load(key) {
  try {
    const arr = JSON.parse(localStorage.getItem(key))
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

// Owns up to MAX_SAVED named schedule snapshots for one term, persisted to
// localStorage under that term's key (so Fall and Spring each get their own).
export function useSavedSchedules(term) {
  const [saved, setSaved] = useState(() => load(term.savedKey))

  useEffect(() => {
    localStorage.setItem(term.savedKey, JSON.stringify(saved))
  }, [term.savedKey, saved])

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
