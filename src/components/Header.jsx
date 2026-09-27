import SavedSchedulesMenu from './SavedSchedulesMenu'

export default function Header({
  terms,
  termId,
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
            <p className="tagline">Build your law school week.</p>
          </div>
        </div>
        <div className="term-toggle" role="group" aria-label="Semester">
          {terms.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`term-option${t.id === termId ? ' on' : ''}`}
              aria-pressed={t.id === termId}
              onClick={() => onTermChange(t.id)}
            >
              {t.label}
            </button>
          ))}
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
