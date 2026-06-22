import { fmtMeeting, fmtMeetingCompact } from '../utils/schedule'

// Approximate rendered heights (px) of each row, matching the CSS font sizes /
// line-heights. Used to budget the block's space so rows are never clipped
// mid-text — we only show a row if it fully fits. Allocation happens in
// priority order (see below).
const PAD_BORDER = 13 // vertical padding + border + small gap buffer
const LH_TITLE = 15
const LH_TIME = 14
const LH_ROOM = 12
const LH_PROF = 13
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

  // Allocate the block's height in priority order. The time is allowed to wrap
  // to two lines (so it's never truncated in a narrow column), and the room
  // gets its own line — both are prioritised over extra title lines / the prof.
  let rem = height - PAD_BORDER
  if (conflict) rem -= LH_WARN
  const take = (cost) => {
    if (rem >= cost) {
      rem -= cost
      return true
    }
    return false
  }

  let titleLines = 0
  let timeLines = 0
  let showRoom = false
  let showProf = false

  if (take(LH_TITLE)) titleLines = 1 // 1. title (first line)
  if (take(LH_TIME)) timeLines = 1 // 2. time (first line)
  if (timeLines === 1 && take(LH_TIME)) timeLines = 2 // 3. time can wrap
  if (room && take(LH_ROOM)) showRoom = true // 4. room on its own line
  if (profShort && take(LH_PROF)) showProf = true // 5. professor
  if (titleLines === 1 && take(LH_TITLE)) titleLines = 2 // 6. title 2nd line
  if (titleLines === 2 && take(LH_TITLE)) titleLines = 3 // 7. title 3rd line

  // Guarantee at least the title and time show on any visible block.
  if (titleLines === 0) titleLines = 1
  if (timeLines === 0) timeLines = 1

  return (
    <button
      type="button"
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
      onClick={() => onClick(course.id)}
      title={`${course.title}${profShort ? '\n' + course.professors.join(', ') : ''}\n${fmtMeeting(meeting)}${room ? '\n' + room : ''}`}
    >
      <span className="cal-block-title" style={{ WebkitLineClamp: titleLines }}>
        {course.title}
      </span>
      {showProf && <span className="cal-block-prof">{profShort}</span>}
      <span className="cal-block-time" style={{ WebkitLineClamp: timeLines }}>
        {fmtMeetingCompact(meeting)}
      </span>
      {showRoom && <span className="cal-block-room">{room}</span>}
      {conflict && <span className="cal-block-warn">conflict</span>}
    </button>
  )
}
