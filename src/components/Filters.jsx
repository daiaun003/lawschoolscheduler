import { DAYS, CREDIT_OPTIONS } from '../data/courses'

const EXAM_KINDS = ['Flex exam', 'Paper', 'Clinic', 'Exam', 'Other']

export default function Filters({ filters, setFilters, resultCount }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))

  const toggleDay = (day) =>
    set({
      days: filters.days.includes(day)
        ? filters.days.filter((d) => d !== day)
        : [...filters.days, day],
    })

  const active =
    filters.search ||
    filters.days.length ||
    filters.exam !== 'all' ||
    filters.credits !== 'all' ||
    filters.onlyOpen ||
    filters.hideShort

  return (
    <div className="filters">
      <input
        className="search"
        type="search"
        placeholder="Search course or professor…"
        value={filters.search}
        onChange={(e) => set({ search: e.target.value })}
      />

      <div className="day-toggles">
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            className={`day-toggle${filters.days.includes(d) ? ' on' : ''}`}
            onClick={() => toggleDay(d)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="filter-row">
        <select value={filters.exam} onChange={(e) => set({ exam: e.target.value })}>
          <option value="all">All exam types</option>
          {EXAM_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <select value={filters.credits} onChange={(e) => set({ credits: e.target.value })}>
          <option value="all">All credits</option>
          {CREDIT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'credit' : 'credits'}
            </option>
          ))}
        </select>
      </div>

      <label className="check">
        <input
          type="checkbox"
          checked={filters.hideShort}
          onChange={(e) => set({ hideShort: e.target.checked })}
        />
        Hide short courses
      </label>

      <div className="filter-foot">
        <span className="muted">{resultCount} courses</span>
        {active && (
          <button
            className="linklike"
            onClick={() =>
              setFilters({
                search: '',
                days: [],
                exam: 'all',
                credits: 'all',
                onlyOpen: false,
                hideShort: false,
              })
            }
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
