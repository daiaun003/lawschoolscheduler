import { DAYS } from '../data/courses'
import { fmtTime, packDay } from '../utils/schedule'
import CalendarBlock from './CalendarBlock'

const EARLIEST_DEFAULT = 8 * 60 // 8:00 AM — no class in the catalogs starts earlier
const DAY_END = 21 * 60 + 30 // 9:30 PM (a couple of evening classes run past 9)
const PX_PER_MIN = 0.9
const WEEKEND = new Set(['Sat', 'Sun'])

export default function WeeklyCalendar({ courses, conflicts, onRemove, onOpen }) {
  // Weekends only get a column when a selected course actually meets then.
  const visibleDays = DAYS.filter(
    (d) => !WEEKEND.has(d) || courses.some((c) => c.meetings.some((m) => m.day === d)),
  )

  // Start at 8 AM, or earlier (on the hour) if a selected class starts before it.
  const earliest = Math.min(
    EARLIEST_DEFAULT,
    ...courses.flatMap((c) => c.meetings.map((m) => m.start)),
  )
  const dayStart = Math.floor(earliest / 60) * 60
  const height = (DAY_END - dayStart) * PX_PER_MIN

  // Hour grid lines from the first hour to 9 PM.
  const hours = []
  for (let h = dayStart; h <= DAY_END; h += 60) hours.push(h)

  // Courses that can't be placed on the weekly grid (no fixed meeting time).
  const unplaced = courses.filter((c) => c.meetings.length === 0)

  return (
    <div className="calendar">
      <div
        className="cal-grid"
        style={{
          height: height + 28,
          gridTemplateColumns: `54px repeat(${visibleDays.length}, 1fr)`,
          '--cal-days': visibleDays.length,
        }}
      >
        {/* time gutter */}
        <div className="cal-gutter">
          <div className="cal-colhead" />
          <div className="cal-gutter-body" style={{ height }}>
            {hours.map((h) => (
              <div
                key={h}
                className="cal-hour-label"
                style={{ top: (h - dayStart) * PX_PER_MIN }}
              >
                {fmtTime(h)}
              </div>
            ))}
          </div>
        </div>

        {/* day columns */}
        {visibleDays.map((day) => (
          <div key={day} className="cal-col">
            <div className="cal-colhead">{day}</div>
            <div className="cal-col-body" style={{ height }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="cal-hour-line"
                  style={{ top: (h - dayStart) * PX_PER_MIN }}
                />
              ))}
              {packDay(
                courses.flatMap((course) =>
                  course.meetings
                    .filter((m) => m.day === day)
                    .map((m) => ({ course, meeting: m })),
                ),
              ).map(({ course, meeting: m, col, cols }, i) => {
                const top = (m.start - dayStart) * PX_PER_MIN
                const blockHeight = Math.max((m.end - m.start) * PX_PER_MIN, 22)
                return (
                  <CalendarBlock
                    key={`${course.id}-${day}-${i}`}
                    course={course}
                    meeting={m}
                    top={top}
                    height={blockHeight}
                    col={col}
                    cols={cols}
                    conflict={conflicts.has(course.id)}
                    onClick={onRemove}
                    onOpen={onOpen}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {unplaced.length > 0 && (
        <div className="cal-unplaced">
          <h4>No fixed weekly time</h4>
          <ul>
            {unplaced.map((c) => (
              <li key={c.id}>
                <span
                  className="swatch"
                  style={{ background: c.color.bg, borderColor: c.color.border }}
                />
                <button
                  type="button"
                  className="cal-unplaced-title"
                  onClick={() => onOpen(c)}
                  title="View course details"
                >
                  {c.title}
                </button>
                <span className="muted">
                  {' '}
                  — {c.asyncCourse ? 'arranged / async' : c.daysRaw || 'TBA'}
                </span>
                <button
                  className="cal-unplaced-remove"
                  onClick={() => onRemove(c.id)}
                  aria-label={`Remove ${c.title}`}
                  title={`Remove ${c.title}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {courses.length === 0 && (
        <p className="cal-empty">
          Your week is empty. Add courses from the catalog on the left and
          they’ll appear here, each in its own color. ✿
        </p>
      )}
    </div>
  )
}
