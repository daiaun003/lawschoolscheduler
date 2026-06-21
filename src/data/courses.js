import raw from './courses.json'
import { colorFor } from '../utils/palette'

// Attach a stable color to each course and freeze the array for the app.
export const COURSES = raw.map((c) => ({
  ...c,
  color: colorFor(c.id),
}))

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Distinct exam-type "kinds" for filtering. The raw examType field is free
// text (e.g. "Flex Exam: 80%..."), so we bucket by leading keyword.
export function examKind(examType) {
  const t = (examType || '').toLowerCase()
  if (!t) return 'Other'
  if (t.startsWith('flex')) return 'Flex exam'
  if (t.startsWith('paper')) return 'Paper'
  if (t.startsWith('clinic')) return 'Clinic'
  if (t.includes('exam')) return 'Exam'
  return 'Other'
}
