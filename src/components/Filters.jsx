import { DAYS, CREDIT_MIN, CREDIT_MAX } from '../data/courses'
import CreditRangeSlider from './CreditRangeSlider'

const EXAM_KINDS = ['Flex exam', 'Paper', 'Clinic', 'Exam', 'Other']

export default function Filters({ filters, setFilters, resultCount }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))

  const toggleDay = (day) =>
    set({
      days: filters.days.includes(day)
        ? filters.days.filter((d) => d !== day)
        : [...filters.days, day],
    })

  const creditRangeActive =
    filters.creditMin !== CREDIT_MIN || filters.creditMax !== CREDIT_MAX

  const active =
    filters.search ||
    filters.days.length ||
    filters.exam !== 'all' ||
    filters.laptop !== 'all' ||
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
        <select value={filters.laptop} onChange={(e) => set({ laptop: e.target.value })}>
          <option value="all">Laptop policy</option>
          <option value="yes">Laptops allowed</option>
          <option value="no">No laptops</option>
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
        <CreditRangeSlider
          min={filters.creditMin}
          max={filters.creditMax}
          onChange={(lo, hi) => set({ creditMin: lo, creditMax: hi })}
        />
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
                laptop: 'all',
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
