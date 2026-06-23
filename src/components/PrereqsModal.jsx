import { useEffect } from 'react'

export default function PrereqsModal({ course, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!course) return null
  const { color, prereqs } = course
  const { required, recommended, jdPriority } = prereqs

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

        {jdPriority && (
          <div className="prereq-jd-row">
            <span className="prereq-jd">JD Priority</span>
          </div>
        )}

        {required.length > 0 && (
          <div className="prereq-section">
            <h3 className="modal-subhead">Required</h3>
            <ul className="prereq-list">
              {required.map((item, i) => (
                <li key={i} className="prereq-item prereq-required">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {recommended.length > 0 && (
          <div className="prereq-section">
            <h3 className="modal-subhead">Helpful, not required</h3>
            <ul className="prereq-list">
              {recommended.map((item, i) => (
                <li key={i} className="prereq-item prereq-recommended">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {!required.length && !recommended.length && !jdPriority && (
          <p className="muted" style={{ marginTop: 16 }}>No prerequisites for this course.</p>
        )}
      </div>
    </div>
  )
}
