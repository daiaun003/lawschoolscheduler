import fallRaw from './courses-fall.json'
import springRaw from './courses-spring.json'
import { colorFor } from '../utils/palette'

// Attach a stable color to each course. Ids are unique within a term only.
const prepare = (raw) => raw.map((c) => ({ ...c, color: colorFor(c.id) }))

// Each term has its own catalog and its own localStorage keys, so selections
// and saved schedules are kept per term. Fall keeps the original (pre-terms)
// keys so schedules people built before Spring was added still load.
export const TERMS = [
  {
    id: 'fall',
    label: 'Fall 2026',
    short: 'Fall',
    courses: prepare(fallRaw),
    selectedKey: 'lawscheduler.selected.v1',
    savedKey: 'lawscheduler.saved.v1',
  },
  {
    id: 'spring',
    label: 'Spring 2027',
    short: 'Spring',
    courses: prepare(springRaw),
    selectedKey: 'lawscheduler.spring.selected.v1',
    savedKey: 'lawscheduler.spring.saved.v1',
  },
]

// The term shown to first-time visitors (the one being registered for next).
export const DEFAULT_TERM_ID = 'spring'

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Distinct credit values across every term (including 0-credit courses),
// sorted ascending — used for the credits range filter. Shared by all terms so
// the slider doesn't change shape when switching.
export const CREDIT_OPTIONS = [
  ...new Set(
    TERMS.flatMap((t) => t.courses)
      .map((c) => Number(c.units))
      .filter((n) => Number.isFinite(n) && n >= 0),
  ),
].sort((a, b) => a - b)

export const CREDIT_MIN = CREDIT_OPTIONS[0]
export const CREDIT_MAX = CREDIT_OPTIONS[CREDIT_OPTIONS.length - 1]

// Short display label for an exam type: "Flex Exam: 80% ..." -> "Flex Exam".
export const examLabel = (examType) => (examType || '').split(/[:.]/)[0]

// Distinct exam-type "kinds" for filtering. The raw examType field is free
// text (e.g. "Flex Exam: 80%..."), so we bucket by leading keyword.
export function examKind(examType) {
  const t = (examType || '').toLowerCase()
  if (!t) return 'Other'
  if (t.startsWith('flex')) return 'Flex exam'
  if (t.startsWith('paper')) return 'Paper'
  if (t.startsWith('clinic')) return 'Clinic'
  if (t.startsWith('no exam')) return 'Other'
  if (t.includes('exam')) return 'Exam'
  return 'Other'
}
