import { useEffect, useRef } from 'react'
import SavedSchedulesMenu from './SavedSchedulesMenu'

export default function Header({
  terms,
  termId,
  prevTermId,
  onTermChange,
  selectedCount,
  units,
  conflictCount,
  onClear,
  catalogOpen,
  onToggleCatalog,
  specialAvailable,
  specialOpen,
  onToggleSpecial,
  savedMenu,
}) {
  const justSwitched = prevTermId !== termId
  const activeRef = useRef(null)

  // Switching terms remounts the scheduler (header included), so after a
  // switch the new tab animates its underline in and gets focus back.
  useEffect(() => {
    if (justSwitched) activeRef.current?.focus()
  }, []) // on mount only — each switch mounts a fresh header

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="catalog-toggle"
          onClick={onToggleCatalog}
          title={catalogOpen ? 'Hide course list' : 'Show course list'}
          aria-pressed={!catalogOpen}
        >
          <span className="catalog-toggle-icon">{catalogOpen ? '⟨' : '☰'}</span>
          <span className="catalog-toggle-label">
            {catalogOpen ? 'Hide list' : 'Courses'}
          </span>
        </button>
        <div className="brand">
          <img src="/apalsa-logo.png" alt="APALSA" className="brand-mark-img" />
          <div>
            <h1>UVA Law Course Scheduler</h1>
            <div className="term-tabs" role="group" aria-label="Semester">
              {terms.map((t) => {
                const on = t.id === termId
                return (
                  <button
                    key={t.id}
                    ref={on ? activeRef : undefined}
                    type="button"
                    className={`term-tab${on ? ' on' : ''}${on && justSwitched ? ' entering' : ''}`}
                    aria-pressed={on}
                    onClick={() => !on && onTermChange(t.id)}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="header-stats">
        <div className="stat">
          <span className="stat-num">{selectedCount}</span>
          <span className="stat-label">courses</span>
        </div>
        <div className="stat">
          <span className="stat-num">{units}</span>
          <span className="stat-label">credits</span>
        </div>
        <div className={`stat${conflictCount ? ' stat-warn' : ''}`}>
          <span className="stat-num">{conflictCount}</span>
          <span className="stat-label">conflicts</span>
        </div>
        {savedMenu && <SavedSchedulesMenu {...savedMenu} />}
        {specialAvailable && (
          <button
            className="catalog-toggle"
            onClick={onToggleSpecial}
            title={specialOpen ? 'Hide special schedules' : 'Show special schedules'}
            aria-pressed={!specialOpen}
          >
            <span className="catalog-toggle-icon">📅</span>
            <span className="catalog-toggle-label">
              {specialOpen ? 'Hide special' : 'Special'}
            </span>
          </button>
        )}
        {selectedCount > 0 && (
          <button className="clear-btn" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
    </header>
  )
}
