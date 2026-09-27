import { useEffect } from 'react'

// One-time "unofficial tool" notice. Shown on a first visit and reopenable
// from the footer.
export default function DisclaimerModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal disclaimer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 id="disclaimer-title">Before you start</h2>
        <p>
          This is an unofficial planning tool made by students with UVA Law APALSA. It
          isn&rsquo;t run by the Law School or the Registrar.
        </p>
        <p>
          Course times, rooms, credits and other details come from course-selection
          spreadsheets and may be incomplete, out of date, or contain errors.{' '}
          <strong>Always confirm on LawWeb before you register.</strong>
        </p>
        <p>
          Your schedules are saved only in this browser on this device. They aren&rsquo;t
          sent anywhere or shared.
        </p>

        <div className="details-actions">
          <button type="button" className="disclaimer-ok" onClick={onClose} autoFocus>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
