import { useMemo, useState } from 'react'
import './App.css'
import { COURSES, examKind, CREDIT_MIN, CREDIT_MAX } from './data/courses'
import { useSchedule } from './hooks/useSchedule'
import { useSavedSchedules } from './hooks/useSavedSchedules'
import { findConflicts, totalUnits } from './utils/schedule'
import Header from './components/Header'
import Filters from './components/Filters'
import CourseCard from './components/CourseCard'
import WeeklyCalendar from './components/WeeklyCalendar'
import SessionsModal from './components/SessionsModal'
import PrereqsModal from './components/PrereqsModal'
import SpecialSchedulePanel from './components/SpecialSchedulePanel'

const INITIAL_FILTERS = {
  search: '',
  days: [],
  exam: 'all',
  laptop: 'all',
  creditMin: CREDIT_MIN,
  creditMax: CREDIT_MAX,
  onlyOpen: false,
  hideShort: false,
}

export default function App() {
  const { selectedIds, isSelected, toggle, clearAll, setAll } = useSchedule()
  const savedSchedules = useSavedSchedules()
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [sessionsCourse, setSessionsCourse] = useState(null)
  const [prereqsCourse, setPrereqsCourse] = useState(null)
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
      if (filters.laptop !== 'all') {
        if (filters.laptop === 'no' && !c.noLaptops) return false
        if (filters.laptop === 'yes' && c.noLaptops) return false
      }
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
        savedMenu={{
          saved: savedSchedules.saved,
          max: savedSchedules.max,
          currentIds: selectedIds,
          onSaveNew: (ids) => savedSchedules.saveNew(ids),
          onRename: savedSchedules.rename,
          onOverwrite: savedSchedules.overwrite,
          onRemove: savedSchedules.remove,
          onLoad: (slot) => setAll(slot.courseIds),
        }}
      />

      <div
        className={`layout${showSpecial ? ' has-special' : ''}${
          catalogOpen ? '' : ' no-catalog'
        }`}
      >
        {catalogOpen && (
          <section className="catalog-pane">
            <a
              className="catalog-extlink"
              href="https://www.law.virginia.edu/courses"
              target="_blank"
              rel="noopener noreferrer"
            >
              Browse full course details on UVA Law ↗
            </a>
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
                  onShowPrereqs={setPrereqsCourse}
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
      <PrereqsModal course={prereqsCourse} onClose={() => setPrereqsCourse(null)} />

      <footer className="app-footer">
        <p className="footer-text">
          For any questions or bugs, please email Diann at{' '}
          <a href="mailto:wzu2ub@virginia.edu">wzu2ub@virginia.edu</a>
        </p>
        <p className="footer-credits">
          Vibecoded with passion with the help of the UVA Law APALSA Academic Affairs team (Alex & Elizabeth)
        </p>
      </footer>
    </div>
  )
}
