export default function Header({ selectedCount, units, conflictCount, onClear }) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">✿</span>
        <div>
          <h1>UVA Law Course Scheduler</h1>
          <p className="tagline">Build your law school week.</p>
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
