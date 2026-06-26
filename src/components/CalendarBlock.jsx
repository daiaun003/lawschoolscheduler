import { fmtMeeting, fmtMeetingCompact } from '../utils/schedule'

// Approximate rendered heights (px) of each row, matching the CSS font sizes /
// line-heights. Used to budget the block's space. The title, professor and
// time always render (the professor must show for every course); the optional
// extras (room, extra title lines) are added only when they fit.
const PAD_BORDER = 13 // vertical padding + border + small gap buffer
const LH_TITLE = 14
const LH_TIME = 13
const LH_ROOM = 11
const LH_PROF = 12
const LH_WARN = 13

// One colored class block positioned within a day column.
export default function CalendarBlock({
  course,
  meeting,
  top,
  height,
  col = 0,
  cols = 1,
  conflict,
  onClick,
}) {
  const { color } = course
  const left = `calc(${(col / cols) * 100}% + 3px)`
  const width = `calc(${100 / cols}% - 6px)`
  // Last names keep the block readable in a narrow column.
  const profShort = course.professors.map((p) => p.split(',')[0]).join(', ')
  const room = course.classroom

  // The title and professor always render (the professor must show for every
  // course). The time, room and extra title lines are added only when they
  // fully fit, so nothing is shown half-clipped: a very short block shows just
  // the title + professor rather than a chopped-off time.
  let rem = height - PAD_BORDER
  if (conflict) rem -= LH_WARN
  rem -= LH_TITLE // title line 1
  if (profShort) rem -= LH_PROF // professor

  let titleLines = 1
  let showTime = false
  let showRoom = false
  if (rem >= LH_TIME) {
    showTime = true
    rem -= LH_TIME
  }
  if (showTime && room && rem >= LH_ROOM) {
    showRoom = true
    rem -= LH_ROOM
  }
  if (rem >= LH_TITLE) {
    titleLines = 2
    rem -= LH_TITLE
  }
  if (showTime && rem >= LH_TITLE) {
    titleLines = 3
    rem -= LH_TITLE
  }

  return (
    <div
      className={`cal-block${conflict ? ' conflict' : ''}`}
      style={{
        top,
        height,
        left,
        width,
        background: color.bg,
        borderColor: conflict ? '#d2453f' : color.border,
        color: color.text,
      }}
      title={`${course.title}${profShort ? '\n' + course.professors.join(', ') : ''}\n${fmtMeeting(meeting)}${room ? '\n' + room : ''}`}
    >
      <button
        type="button"
        className="cal-block-remove"
        onClick={() => onClick(course.id)}
        aria-label={`Remove ${course.title}`}
        title={`Remove ${course.title}`}
      >
        ×
      </button>
      <span className="cal-block-title" style={{ WebkitLineClamp: titleLines }}>
        {course.title}
      </span>
      {profShort && <span className="cal-block-prof">{profShort}</span>}
      {showTime && <span className="cal-block-time">{fmtMeetingCompact(meeting)}</span>}
      {showRoom && <span className="cal-block-room">{room}</span>}
      {conflict && <span className="cal-block-warn">conflict</span>}
    </div>
  )
}
