import { useEffect, useRef, useState } from 'react'
import { COURSES } from '../data/courses'
import { totalUnits } from '../utils/schedule'

const byId = new Map(COURSES.map((c) => [c.id, c]))

function summarize(courseIds) {
  const courses = courseIds.map((id) => byId.get(id)).filter(Boolean)
  return { count: courses.length, credits: totalUnits(courses) }
}

const sameSet = (a, b) =>
  a.length === b.length && a.every((x) => b.includes(x))

// Header dropdown for saving / renaming / loading up to a few schedule snapshots.
export default function SavedSchedulesMenu({
  saved,
  max,
  currentIds,
  onSaveNew,
  onRename,
  onOverwrite,
  onRemove,
  onLoad,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const full = saved.length >= max
  const canSave = currentIds.length > 0 && !full

  return (
    <div className="saved-menu" ref={ref}>
      <button
        className="catalog-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="Saved schedules"
      >
        <span className="catalog-toggle-icon">🗂️</span>
        <span className="catalog-toggle-label">
          Saved{saved.length ? ` ${saved.length}/${max}` : ''}
        </span>
      </button>

      {open && (
        <div className="saved-dropdown" role="dialog" aria-label="Saved schedules">
          <div className="saved-dropdown-head">
            <strong>Saved schedules</strong>
            <span className="muted">
              {saved.length}/{max}
            </span>
            <button
              className="saved-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {saved.length === 0 && (
            <p className="saved-empty muted">
              No saved schedules yet. Build one, then save it below.
            </p>
          )}

          <ul className="saved-slots">
            {saved.map((slot) => {
              const { count, credits } = summarize(slot.courseIds)
              const isCurrent = sameSet(slot.courseIds, currentIds)
              return (
                <li key={slot.id} className={`saved-slot${isCurrent ? ' current' : ''}`}>
                  <input
                    className="saved-name"
                    value={slot.name}
                    maxLength={28}
                    onChange={(e) => onRename(slot.id, e.target.value)}
                    aria-label="Schedule name"
                  />
                  <div className="saved-meta">
                    {count} course{count === 1 ? '' : 's'} · {credits} cr
                    {isCurrent && <span className="saved-badge">loaded</span>}
                  </div>
                  <div className="saved-actions">
                    <button
                      className="saved-load"
                      onClick={() => {
                        onLoad(slot)
                        setOpen(false)
                      }}
                      disabled={isCurrent}
                    >
                      {isCurrent ? 'Loaded' : 'Load'}
                    </button>
                    <button
                      className="saved-update"
                      onClick={() => onOverwrite(slot.id, currentIds)}
                      title="Overwrite this slot with the current schedule"
                    >
                      Update
                    </button>
                    <button
                      className="saved-del"
                      onClick={() => onRemove(slot.id)}
                      title="Delete this saved schedule"
                      aria-label="Delete saved schedule"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <button className="saved-save-btn" onClick={() => onSaveNew(currentIds)} disabled={!canSave}>
            + Save current schedule
          </button>
          {full && (
            <p className="saved-hint muted">
              Max {max} saved — delete or update a slot to save another.
            </p>
          )}
          {currentIds.length === 0 && !full && (
            <p className="saved-hint muted">Add courses to save a schedule.</p>
          )}
        </div>
      )}
    </div>
  )
}
