import { useEffect } from 'react'
import { examLabel } from '../data/courses'
import { meetingSummary, displayNotes } from '../utils/schedule'
import PrereqSections, { hasPrereqs } from './PrereqSections'

// Everything about one scheduled course, opened by clicking its calendar block.
export default function CourseDetailsModal({ course, onClose, onRemove, onShowSessions }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!course) return null
  const { color, prereqs } = course
  const notes = displayNotes(course)
  const credits = Number(course.units)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={course.title}
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
            <h2>
              {course.title}
              {course.section > 1 && <span className="sec"> §{course.section}</span>}
            </h2>
            {course.professors.length > 0 && (
              <p className="modal-prof">{course.professors.join(' · ')}</p>
            )}
          </div>
        </div>

        <div className="modal-meta">
          <span className="modal-pill">🕑 {meetingSummary(course)}</span>
          {course.classroom && <span className="modal-pill">📍 {course.classroom}</span>}
          {Number.isFinite(credits) && (
            <span className="modal-pill">
              {credits} credit{credits === 1 ? '' : 's'}
            </span>
          )}
          {course.examType && <span className="modal-pill">{examLabel(course.examType)}</span>}
          {course.noLaptops && <span className="modal-pill details-nolaptop">🚫 No laptops</span>}
        </div>

        {hasPrereqs(prereqs) && <PrereqSections prereqs={prereqs} />}

        {notes && (
          <>
            <h3 className="modal-subhead">Notes</h3>
            <p className="details-notes">{notes}</p>
          </>
        )}

        <div className="details-actions">
          {course.sessions.length > 0 && (
            <button
              type="button"
              className="details-secondary"
              onClick={() => {
                onClose()
                onShowSessions(course)
              }}
            >
              📅 View all {course.sessions.length} class dates
            </button>
          )}
          <button
            type="button"
            className="details-remove"
            onClick={() => {
              onRemove(course.id)
              onClose()
            }}
          >
            Remove from schedule
          </button>
        </div>
      </div>
    </div>
  )
}
