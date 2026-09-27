import { useEffect } from 'react'
import PrereqSections, { hasPrereqs } from './PrereqSections'

export default function PrereqsModal({ course, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!course) return null
  const { color, prereqs } = course

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

        <PrereqSections prereqs={prereqs} />

        {!hasPrereqs(prereqs) && (
          <p className="muted" style={{ marginTop: 16 }}>No prerequisites for this course.</p>
        )}
      </div>
    </div>
  )
}
