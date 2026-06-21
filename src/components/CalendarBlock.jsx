import { fmtMeeting } from '../utils/schedule'

// Approximate rendered heights (px) of each row, matching the CSS font sizes /
// line-heights. Used to budget the block's space so no row is ever clipped
// mid-text — we only show a row if it fully fits.
const PAD_BORDER = 13 // vertical padding + border + small gap buffer
const LH_TITLE = 15
const H_PROF = 13
const H_META = 14
const H_WARN = 13

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

  // Decide what fits, always keeping at least one title line. Priority after
  // the title: the time/room (meta), then the professor.
  let avail = height - PAD_BORDER
  if (conflict) avail -= H_WARN
  const showMeta = avail >= LH_TITLE + H_META
  const availAfterMeta = avail - (showMeta ? H_META : 0)
  const showProf = !!profShort && availAfterMeta >= LH_TITLE + H_PROF
  const availForTitle = avail - (showMeta ? H_META : 0) - (showProf ? H_PROF : 0)
  const titleLines = Math.max(1, Math.min(3, Math.floor(availForTitle / LH_TITLE)))

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
      <span className="cal-block-title" style={{ WebkitLineClamp: titleLines }}>
        {course.title}
      </span>
      {showProf && <span className="cal-block-prof">{profShort}</span>}
      {showMeta && (
        <span className="cal-block-meta">
          {fmtMeeting(meeting)}
          {course.classroom ? ` · ${course.classroom}` : ''}
        </span>
      )}
      {conflict && <span className="cal-block-warn">conflict</span>}
    </button>
  )
}
