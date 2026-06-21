import { DAYS } from '../data/courses'
import { fmtTime, packDay } from '../utils/schedule'
import CalendarBlock from './CalendarBlock'

const DAY_START = 7 * 60 // 7:00 AM
const DAY_END = 21 * 60 + 30 // 9:30 PM (a couple of evening classes run past 9)
const PX_PER_MIN = 0.9
const HEIGHT = (DAY_END - DAY_START) * PX_PER_MIN

export default function WeeklyCalendar({ courses, conflicts, onRemove }) {
  // Hour grid lines from 8 AM to 9 PM.
  const hours = []
  for (let h = DAY_START; h <= DAY_END; h += 60) hours.push(h)

  // Courses that can't be placed on the weekly grid (no fixed meeting time).
  const unplaced = courses.filter((c) => c.meetings.length === 0)

  return (
    <div className="calendar">
      <div className="cal-grid" style={{ height: HEIGHT + 28 }}>
        {/* time gutter */}
        <div className="cal-gutter">
          <div className="cal-colhead" />
          <div className="cal-gutter-body" style={{ height: HEIGHT }}>
            {hours.map((h) => (
              <div
                key={h}
                className="cal-hour-label"
                style={{ top: (h - DAY_START) * PX_PER_MIN }}
              >
                {fmtTime(h)}
              </div>
            ))}
          </div>
        </div>

        {/* day columns */}
        {DAYS.map((day) => (
          <div key={day} className="cal-col">
            <div className="cal-colhead">{day}</div>
            <div className="cal-col-body" style={{ height: HEIGHT }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="cal-hour-line"
                  style={{ top: (h - DAY_START) * PX_PER_MIN }}
                />
              ))}
              {packDay(
                courses.flatMap((course) =>
                  course.meetings
                    .filter((m) => m.day === day)
                    .map((m) => ({ course, meeting: m })),
                ),
              ).map(({ course, meeting: m, col, cols }, i) => {
                const top = (m.start - DAY_START) * PX_PER_MIN
                const height = Math.max((m.end - m.start) * PX_PER_MIN, 22)
                return (
                  <CalendarBlock
                    key={`${course.id}-${day}-${i}`}
                    course={course}
                    meeting={m}
                    top={top}
                    height={height}
                    col={col}
                    cols={cols}
                    conflict={conflicts.has(course.id)}
                    onClick={onRemove}
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
                <button className="linklike" onClick={() => onRemove(c.id)}>
                  {c.title}
                </button>
                <span className="muted">
                  {' '}
                  — {c.asyncCourse ? 'arranged / async' : c.daysRaw || 'TBA'}
                </span>
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
