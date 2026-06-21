// Time + conflict helpers for the weekly schedule.

// 500 (minutes) -> "8:20 AM"
export function fmtTime(min) {
  let h = Math.floor(min / 60)
  const m = min % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}

// "0820-0950" raw -> "8:20 AM – 9:50 AM" for display.
export function fmtMeeting(m) {
  return `${fmtTime(m.start)} – ${fmtTime(m.end)}`
}

export function totalUnits(courses) {
  return courses.reduce((sum, c) => {
    const u = Number(c.units)
    return sum + (Number.isFinite(u) ? u : 0)
  }, 0)
}

// Two meetings overlap if same day and time ranges intersect.
function meetingsOverlap(a, b) {
  return a.day === b.day && a.start < b.end && b.start < a.end
}

// Lays out a single day's meetings into side-by-side columns so overlapping
// classes don't cover each other. Each item is annotated with { col, cols }
// where col is its column index and cols is the column count for its overlap
// cluster. items: [{ course, meeting }].
export function packDay(items) {
  const evs = items.map((it) => ({ ...it }))
  evs.sort((a, b) => a.meeting.start - b.meeting.start || a.meeting.end - b.meeting.end)

  // Greedy column assignment: reuse the first column that has freed up.
  const colEnds = []
  for (const ev of evs) {
    let placed = -1
    for (let c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= ev.meeting.start) {
        placed = c
        break
      }
    }
    if (placed === -1) {
      placed = colEnds.length
      colEnds.push(ev.meeting.end)
    } else {
      colEnds[placed] = ev.meeting.end
    }
    ev.col = placed
  }

  // Count columns per overlap cluster (contiguous run of overlapping events).
  let cluster = []
  let maxEnd = -1
  const assign = (cl) => {
    const cols = Math.max(...cl.map((e) => e.col)) + 1
    cl.forEach((e) => (e.cols = cols))
  }
  for (const ev of evs) {
    if (cluster.length && ev.meeting.start >= maxEnd) {
      assign(cluster)
      cluster = []
      maxEnd = -1
    }
    cluster.push(ev)
    maxEnd = Math.max(maxEnd, ev.meeting.end)
  }
  if (cluster.length) assign(cluster)

  return evs
}

// Returns a Set of course ids that conflict with at least one other selected
// course (overlapping meeting on the same weekday).
export function findConflicts(courses) {
  const conflicting = new Set()
  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const a = courses[i]
      const b = courses[j]
      const clash = a.meetings.some((ma) =>
        b.meetings.some((mb) => meetingsOverlap(ma, mb)),
      )
      if (clash) {
        conflicting.add(a.id)
        conflicting.add(b.id)
      }
    }
  }
  return conflicting
}
