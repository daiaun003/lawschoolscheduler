import { fmtMeeting } from '../utils/schedule'
import { examKind } from '../data/courses'

// Compact summary of a meeting list, e.g. "Mon, Wed · 3:40–5:40 PM".
function meetingSummary(course) {
  if (course.meetings.length === 0) {
    return course.asyncCourse ? 'Arranged / async' : course.daysRaw || 'TBA'
  }
  const days = [...new Set(course.meetings.map((m) => m.day))].join(', ')
  // If all meetings share one time range, show it once; else show raw.
  const first = course.meetings[0]
  const sameTime = course.meetings.every(
    (m) => m.start === first.start && m.end === first.end,
  )
  const time = sameTime ? fmtMeeting(first) : course.timesRaw
  return `${days} · ${time}`
}

export default function CourseCard({ course, selected, conflict, onToggle, onShowSessions, onShowPrereqs }) {
  const { color } = course
  // The "No laptops" tag now conveys the policy, so drop a notes line that only
  // restates it (avoids showing "No laptops" twice on the same card).
  const displayNotes = /^no\s+laptops?(\s+allowed)?\.?$/i.test((course.notes || '').trim())
    ? ''
    : course.notes
  return (
    <div
      className={`course-card${selected ? ' selected' : ''}${conflict ? ' conflict' : ''}`}
      style={selected ? { borderLeftColor: color.border } : undefined}
    >
      <span
        className="swatch"
        style={{ background: color.bg, borderColor: color.border }}
      />
      <div className="course-main">
        <div className="course-title-row">
          <h3>{course.title}</h3>
          {course.section > 1 && <span className="sec">§{course.section}</span>}
        </div>
        {course.professors.length > 0 && (
          <p className="course-prof">{course.professors.join(' · ')}</p>
        )}
        <p className="course-when">{meetingSummary(course)}</p>
        <div className="course-tags">
          {course.units != null && course.units !== '' && (
            <span className="tag">{course.units} units</span>
          )}
          {course.classroom && <span className="tag">{course.classroom}</span>}
          {course.examType && (
            <span className={`tag tag-exam tag-exam--${examKind(course.examType).toLowerCase().replace(/\s/g, '-')}`}>
              {course.examType.split(/[:.]/)[0]}
            </span>
          )}
          {course.noLaptops && (
            <span className="tag tag-nolaptop">🚫 No laptops</span>
          )}
          {course.sessions.length > 0 ? (
            <button
              type="button"
              className="tag tag-short tag-dates"
              onClick={() => onShowSessions(course)}
              title="View all class dates"
            >
              📅 Special schedule · {course.sessions.length} dates
            </button>
          ) : (
            course.shortCourse && <span className="tag tag-short">Short course</span>
          )}
          {(course.prereqs.required.length > 0 || course.prereqs.recommended.length > 0) && (
            <button
              type="button"
              className="tag tag-prereq tag-dates"
              onClick={() => onShowPrereqs(course)}
              title="View prerequisites"
            >
              📋 {course.prereqs.required.length > 0
                ? `${course.prereqs.required.length} prereq${course.prereqs.required.length === 1 ? '' : 's'}`
                : 'Recommended'}
            </button>
          )}
        </div>
        {displayNotes && <p className="course-notes">{displayNotes}</p>}
      </div>
      <button
        type="button"
        className={`add-btn${selected ? ' added' : ''}`}
        onClick={() => onToggle(course.id)}
        aria-label={selected ? 'Remove from schedule' : 'Add to schedule'}
      >
        {selected ? '✓' : '+'}
      </button>
    </div>
  )
}
