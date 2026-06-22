import { CREDIT_MIN, CREDIT_MAX, CREDIT_OPTIONS } from '../data/courses'

// Dual-handle range slider for the credit filter. Two overlaid native range
// inputs (only their thumbs are interactive via pointer-events) with a colored
// fill between them. Values are clamped so min never crosses max.
export default function CreditRangeSlider({ min, max, onChange }) {
  const span = CREDIT_MAX - CREDIT_MIN || 1
  const pct = (v) => ((v - CREDIT_MIN) / span) * 100

  // Allow crossover: if the user drags past the other thumb, move that
  // thumb instead so either handle works in both directions when overlapping.
  const setMin = (v) => (v <= max ? onChange(v, max) : onChange(max, v))
  const setMax = (v) => (v >= min ? onChange(min, v) : onChange(v, min))

  // When both thumbs overlap, put min on top so the user can drag left or
  // right (crossover logic above handles the right-drag case).
  const minOnTop = min === max

  return (
    <div className="cr-slider">
      <div className="cr-track" />
      <div
        className="cr-fill"
        style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }}
      />
      <input
        type="range"
        className="cr-input"
        min={CREDIT_MIN}
        max={CREDIT_MAX}
        step={1}
        value={min}
        onChange={(e) => setMin(Number(e.target.value))}
        style={{ zIndex: minOnTop ? 4 : 3 }}
        aria-label="Minimum credits"
      />
      <input
        type="range"
        className="cr-input"
        min={CREDIT_MIN}
        max={CREDIT_MAX}
        step={1}
        value={max}
        onChange={(e) => setMax(Number(e.target.value))}
        style={{ zIndex: minOnTop ? 3 : 4 }}
        aria-label="Maximum credits"
      />
      <div className="cr-ticks">
        {CREDIT_OPTIONS.map((n) => (
          <span key={n} className="cr-tick">
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}
