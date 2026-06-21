const MONTH_ABBR = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Compact per-month summary, e.g. "Sep 21, 22, 23, 28, 29, 30".
function summarize(sessions) {
  const byMonth = []
  for (const s of sessions) {
    let g = byMonth.find((x) => x.m === s.m)
    if (!g) {
      g = { m: s.m, days: [] }
      byMonth.push(g)
    }
    g.days.push(s.d)
  }
  return byMonth.map((g) => `${MONTH_ABBR[g.m]} ${g.days.join(', ')}`)
}

// A slim panel that appears when the selected schedule includes short courses
// with special (irregular) meeting dates.
export default function SpecialSchedulePanel({ courses, onShowSessions, onRemove }) {
  return (
    <aside className="special-panel">
      <h2 className="special-panel-title">📅 Special schedules</h2>
      <p className="special-panel-sub">
        Selected courses that meet on specific dates.
      </p>
      <div className="special-list">
        {courses.map((c) => (
          <div key={c.id} className="special-card" style={{ borderLeftColor: c.color.border }}>
            <div className="special-card-head">
              <button className="special-card-title" onClick={() => onShowSessions(c)}>
                {c.title}
              </button>
              <button
                className="special-remove"
                onClick={() => onRemove(c.id)}
                aria-label="Remove from schedule"
                title="Remove from schedule"
              >
                ×
              </button>
            </div>
            {c.professors.length > 0 && (
              <p className="special-card-prof">{c.professors.join(' · ')}</p>
            )}
            <div className="special-dates">
              {summarize(c.sessions).map((line) => (
                <div key={line} className="special-date-line">
                  {line}
                </div>
              ))}
            </div>
            <button className="special-viewall" onClick={() => onShowSessions(c)}>
              View all {c.sessions.length} dates →
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}
