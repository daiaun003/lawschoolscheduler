import { fmtMeeting } from '../utils/schedule'

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
      title={`${course.title}${profShort ? '\n' + course.professors.join(', ') : ''}\n${fmtMeeting(meeting)}${course.classroom ? '\n' + course.classroom : ''}`}
    >
      <span className="cal-block-title">{course.title}</span>
      {profShort && height > 50 && <span className="cal-block-prof">{profShort}</span>}
      {height > 34 && (
        <span className="cal-block-meta">
          {fmtMeeting(meeting)}
          {course.classroom ? ` · ${course.classroom}` : ''}
        </span>
      )}
      {conflict && <span className="cal-block-warn">conflict</span>}
    </button>
  )
}
