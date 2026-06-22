import { useMemo, useState } from 'react'
import './App.css'
import { COURSES, examKind, CREDIT_MIN, CREDIT_MAX } from './data/courses'
import { useSchedule } from './hooks/useSchedule'
import { findConflicts, totalUnits } from './utils/schedule'
import Header from './components/Header'
import Filters from './components/Filters'
import CourseCard from './components/CourseCard'
import WeeklyCalendar from './components/WeeklyCalendar'
import SessionsModal from './components/SessionsModal'
import SpecialSchedulePanel from './components/SpecialSchedulePanel'

const INITIAL_FILTERS = {
  search: '',
  days: [],
  exam: 'all',
  creditMin: CREDIT_MIN,
  creditMax: CREDIT_MAX,
  onlyOpen: false,
  hideShort: false,
}

export default function App() {
  const { selectedIds, isSelected, toggle, clearAll } = useSchedule()
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [sessionsCourse, setSessionsCourse] = useState(null)
  const [catalogOpen, setCatalogOpen] = useState(true)
  const [specialOpen, setSpecialOpen] = useState(true)

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return COURSES.filter((c) => {
      if (q) {
        const hay = (c.title + ' ' + c.professors.join(' ')).toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filters.days.length) {
        const courseDays = new Set(c.meetings.map((m) => m.day))
        if (!filters.days.some((d) => courseDays.has(d))) return false
      }
      if (filters.exam !== 'all' && examKind(c.examType) !== filters.exam) return false
      if (filters.creditMin !== CREDIT_MIN || filters.creditMax !== CREDIT_MAX) {
        const u = Number(c.units)
        if (!Number.isFinite(u) || u < filters.creditMin || u > filters.creditMax) return false
      }
      if (filters.hideShort && c.shortCourse) return false
      return true
    }).sort((a, b) => a.title.localeCompare(b.title))
  }, [filters])

  const selectedCourses = useMemo(
    () => COURSES.filter((c) => selectedIds.includes(c.id)),
    [selectedIds],
  )

  const conflicts = useMemo(() => findConflicts(selectedCourses), [selectedCourses])
  const units = useMemo(() => totalUnits(selectedCourses), [selectedCourses])

  // Selected short courses that meet on specific (irregular) dates.
  const specialSelected = useMemo(
    () => selectedCourses.filter((c) => c.sessions.length > 0),
    [selectedCourses],
  )
  const showSpecial = specialSelected.length > 0 && specialOpen

  return (
    <div className="app">
      <Header
        selectedCount={selectedCourses.length}
        units={units}
        conflictCount={conflicts.size ? conflicts.size : 0}
        onClear={clearAll}
        catalogOpen={catalogOpen}
        onToggleCatalog={() => setCatalogOpen((o) => !o)}
        specialAvailable={specialSelected.length > 0}
        specialOpen={specialOpen}
        onToggleSpecial={() => setSpecialOpen((o) => !o)}
      />

      <div
        className={`layout${showSpecial ? ' has-special' : ''}${
          catalogOpen ? '' : ' no-catalog'
        }`}
      >
        {catalogOpen && (
          <section className="catalog-pane">
            <Filters filters={filters} setFilters={setFilters} resultCount={filtered.length} />
            <div className="course-list">
              {filtered.map((c) => (
                <CourseCard
                  key={c.id}
                  course={c}
                  selected={isSelected(c.id)}
                  conflict={conflicts.has(c.id)}
                  onToggle={toggle}
                  onShowSessions={setSessionsCourse}
                />
              ))}
              {filtered.length === 0 && (
                <p className="muted empty">No courses match your filters.</p>
              )}
            </div>
          </section>
        )}

        <section className="calendar-pane">
          <WeeklyCalendar
            courses={selectedCourses}
            conflicts={conflicts}
            onRemove={toggle}
          />
        </section>

        {showSpecial && (
          <SpecialSchedulePanel
            courses={specialSelected}
            onShowSessions={setSessionsCourse}
            onRemove={toggle}
            onHide={() => setSpecialOpen(false)}
          />
        )}
      </div>

      <SessionsModal course={sessionsCourse} onClose={() => setSessionsCourse(null)} />
    </div>
  )
}
