export default function Header({
  selectedCount,
  units,
  conflictCount,
  onClear,
  catalogOpen,
  onToggleCatalog,
  specialAvailable,
  specialOpen,
  onToggleSpecial,
}) {
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
        <div className="brand">
          <span className="brand-mark">✿</span>
          <div>
            <h1>UVA Law Course Scheduler</h1>
            <p className="tagline">Build your law school week.</p>
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
        {selectedCount > 0 && (
          <button className="clear-btn" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
    </header>
  )
}
