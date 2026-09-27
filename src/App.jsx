import { useCallback, useEffect, useMemo, useState } from 'react'
import { Analytics, track } from '@vercel/analytics/react'
import './App.css'
import { TERMS, DEFAULT_TERM_ID, examKind, CREDIT_MIN, CREDIT_MAX } from './data/courses'
import { useSchedule } from './hooks/useSchedule'
import { useSavedSchedules } from './hooks/useSavedSchedules'
import { findConflicts, totalUnits } from './utils/schedule'
import Header from './components/Header'
import Filters from './components/Filters'
import CourseCard from './components/CourseCard'
import WeeklyCalendar from './components/WeeklyCalendar'
import SessionsModal from './components/SessionsModal'
import PrereqsModal from './components/PrereqsModal'
import CourseDetailsModal from './components/CourseDetailsModal'
import DisclaimerModal from './components/DisclaimerModal'
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

const TERM_KEY = 'lawscheduler.term.v1'
const DISCLAIMER_KEY = 'lawscheduler.disclaimer.v1'

// Show the disclaimer until it's been dismissed once on this device. If storage
// can't be read (e.g. blocked), err on the side of showing it.
function disclaimerSeen() {
  try {
    return localStorage.getItem(DISCLAIMER_KEY) === '1'
  } catch {
    return false
  }
}

function loadTermId() {
  try {
    const id = localStorage.getItem(TERM_KEY)
    return TERMS.some((t) => t.id === id) ? id : DEFAULT_TERM_ID
  } catch {
    return DEFAULT_TERM_ID
  }
}

// Holds the active term (remembered across visits) and remounts the scheduler
// whenever it changes, so each term loads its own catalog, selection and saves.
export default function App() {
  const [termId, setTermId] = useState(loadTermId)
  // The term shown before the latest switch, so the header's semester switch
  // can animate from it (the header remounts on every switch).
  const [prevTermId, setPrevTermId] = useState(termId)
  const changeTerm = (id) => {
    setPrevTermId(termId)
    setTermId(id)
  }
  const [catalogOpen, setCatalogOpen] = useState(true)
  const [showDisclaimer, setShowDisclaimer] = useState(() => !disclaimerSeen())
  const term = TERMS.find((t) => t.id === termId)

  const closeDisclaimer = useCallback(() => {
    setShowDisclaimer(false)
    try {
      localStorage.setItem(DISCLAIMER_KEY, '1')
    } catch {
      // Storage unavailable — it'll just show again next visit.
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(TERM_KEY, termId)
    } catch {
      // Storage unavailable (e.g. private mode) — the term just isn't remembered.
    }
  }, [termId])

  return (
    <>
      <Scheduler
        key={term.id}
        term={term}
        prevTermId={prevTermId}
        onTermChange={changeTerm}
        catalogOpen={catalogOpen}
        setCatalogOpen={setCatalogOpen}
        onShowDisclaimer={() => setShowDisclaimer(true)}
      />
      <DisclaimerModal open={showDisclaimer} onClose={closeDisclaimer} />
      <Analytics />
    </>
  )
}

function Scheduler({
  term,
  prevTermId,
  onTermChange,
  catalogOpen,
  setCatalogOpen,
  onShowDisclaimer,
}) {
  const COURSES = term.courses
  const { selectedIds, isSelected, toggle, clearAll, setAll } = useSchedule(term)
  const savedSchedules = useSavedSchedules(term)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [sessionsCourse, setSessionsCourse] = useState(null)
  const [prereqsCourse, setPrereqsCourse] = useState(null)
  const [detailsCourse, setDetailsCourse] = useState(null)
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
  }, [COURSES, filters])

  const selectedCourses = useMemo(
    () => COURSES.filter((c) => selectedIds.includes(c.id)),
    [COURSES, selectedIds],
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
        terms={TERMS}
        termId={term.id}
        prevTermId={prevTermId}
        onTermChange={onTermChange}
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
          courses: COURSES,
          termLabel: term.short,
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
              onClick={() => track('uva_link_click')}
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
            onOpen={setDetailsCourse}
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
      <CourseDetailsModal
        course={detailsCourse}
        onClose={() => setDetailsCourse(null)}
        onRemove={toggle}
        onShowSessions={setSessionsCourse}
      />

      <footer className="app-footer">
        <p className="footer-text">
          For any questions or bugs, please email Diann at{' '}
          <a href="mailto:wzu2ub@virginia.edu">wzu2ub@virginia.edu</a>
        </p>
        <p className="footer-credits">
          Vibecoded with passion with the help of the UVA Law APALSA Academic Affairs team (Alex & Elizabeth)
          {' · '}
          <button type="button" className="footer-link" onClick={onShowDisclaimer}>
            Disclaimer
          </button>
        </p>
      </footer>
    </div>
  )
}
