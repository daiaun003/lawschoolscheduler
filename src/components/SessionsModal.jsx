import { useEffect } from 'react'
import { fmtMeeting } from '../utils/schedule'

const MONTH_NAME = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// Summarize the meeting time(s). If every session shares one time range, show
// it once; otherwise list the time per weekday (e.g. per-day-time courses).
function timeSummary(course) {
  const ms = course.meetings
  if (ms.length === 0) return course.timesRaw || 'Time TBA'
  const first = ms[0]
  const same = ms.every((m) => m.start === first.start && m.end === first.end)
  if (same) return fmtMeeting(first)
  return ms.map((m) => `${m.day} ${fmtMeeting(m)}`).join('  ·  ')
}

export default function SessionsModal({ course, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!course) return null
  const { color } = course

  // Group sessions by month for a tidy layout.
  const byMonth = []
  for (const s of course.sessions) {
    let group = byMonth.find((g) => g.m === s.m)
    if (!group) {
      group = { m: s.m, items: [] }
      byMonth.push(group)
    }
    group.items.push(s)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ borderTopColor: color.border }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="modal-head">
          <span
            className="swatch"
            style={{ background: color.bg, borderColor: color.border }}
          />
          <div>
            <h2>{course.title}</h2>
            {course.professors.length > 0 && (
              <p className="modal-prof">{course.professors.join(' · ')}</p>
            )}
          </div>
        </div>

        <div className="modal-meta">
          <span className="modal-pill">🕑 {timeSummary(course)}</span>
          {course.classroom && <span className="modal-pill">📍 {course.classroom}</span>}
          <span className="modal-pill">
            {course.sessions.length} session{course.sessions.length === 1 ? '' : 's'}
          </span>
        </div>

        <h3 className="modal-subhead">Class dates</h3>
        <div className="sessions">
          {byMonth.map((g) => (
            <div key={g.m} className="session-month">
              <div className="session-month-name">{MONTH_NAME[g.m]}</div>
              <div className="session-chips">
                {g.items.map((s) => (
                  <span key={s.iso} className="session-chip">
                    <strong>{s.wd}</strong> {s.m}/{s.d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="modal-foot">From the registrar: {course.daysRaw.replace(/\n/g, ' · ')}</p>
      </div>
    </div>
  )
}
