import { useMemo, useState } from 'react'
import './App.css'
import { COURSES, examKind } from './data/courses'
import { useSchedule } from './hooks/useSchedule'
import { findConflicts, totalUnits } from './utils/schedule'
import Header from './components/Header'
import Filters from './components/Filters'
import CourseCard from './components/CourseCard'
import WeeklyCalendar from './components/WeeklyCalendar'

const INITIAL_FILTERS = {
  search: '',
  days: [],
  exam: 'all',
  onlyOpen: false,
  hideShort: false,
}

export default function App() {
  const { selectedIds, isSelected, toggle, clearAll } = useSchedule()
  const [filters, setFilters] = useState(INITIAL_FILTERS)

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

  return (
    <div className="app">
      <Header
        selectedCount={selectedCourses.length}
        units={units}
        conflictCount={conflicts.size ? conflicts.size : 0}
        onClear={clearAll}
      />

      <div className="layout">
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
              />
            ))}
            {filtered.length === 0 && (
              <p className="muted empty">No courses match your filters.</p>
            )}
          </div>
        </section>

        <section className="calendar-pane">
          <WeeklyCalendar
            courses={selectedCourses}
            conflicts={conflicts}
            onRemove={toggle}
          />
        </section>
      </div>
    </div>
  )
}
