import { DAYS, CREDIT_OPTIONS, CREDIT_MIN, CREDIT_MAX } from '../data/courses'

const EXAM_KINDS = ['Flex exam', 'Paper', 'Clinic', 'Exam', 'Other']

export default function Filters({ filters, setFilters, resultCount }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))

  const toggleDay = (day) =>
    set({
      days: filters.days.includes(day)
        ? filters.days.filter((d) => d !== day)
        : [...filters.days, day],
    })

  // Keep min <= max when either end of the credit range changes.
  const setCreditMin = (v) =>
    set({ creditMin: v, creditMax: Math.max(v, filters.creditMax) })
  const setCreditMax = (v) =>
    set({ creditMax: v, creditMin: Math.min(v, filters.creditMin) })

  const creditRangeActive =
    filters.creditMin !== CREDIT_MIN || filters.creditMax !== CREDIT_MAX

  const active =
    filters.search ||
    filters.days.length ||
    filters.exam !== 'all' ||
    creditRangeActive ||
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

      </div>

      <div className="credit-range">
        <span className="credit-range-label">
          Credits{' '}
          <strong>
            {filters.creditMin === filters.creditMax
              ? filters.creditMin
              : `${filters.creditMin}–${filters.creditMax}`}
          </strong>
        </span>
        <div className="credit-range-selects">
          <select
            value={filters.creditMin}
            onChange={(e) => setCreditMin(Number(e.target.value))}
            aria-label="Minimum credits"
          >
            {CREDIT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="credit-range-dash">to</span>
          <select
            value={filters.creditMax}
            onChange={(e) => setCreditMax(Number(e.target.value))}
            aria-label="Maximum credits"
          >
            {CREDIT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
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
                creditMin: CREDIT_MIN,
                creditMax: CREDIT_MAX,
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
