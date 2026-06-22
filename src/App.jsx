import { useMemo, useState, useCallback } from 'react'
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

function CalActions() {
  const [copied, setCopied] = useState(false)
  const share = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div className="cal-actions">
      <button className="cal-action-btn" onClick={share} title="Copy shareable link">
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        )}
      </button>
      <button className="cal-action-btn" onClick={() => window.print()} title="Export / print as PDF">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
    </div>
  )
}

export default function App() {
  const { selectedIds, isSelected, toggle, clearAll, setAll } = useSchedule()
  const savedSchedules = useSavedSchedules()
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
          <CalActions />
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
      <div className="print-footer">
        UVA Law Course Scheduler — Fall 2026 &nbsp;·&nbsp; law-school-scheduler.vercel.app
      </div>
    </div>
  )
}
