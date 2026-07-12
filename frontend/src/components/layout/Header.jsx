import '../../styles/Header.css';

function Header({ pageTitle = 'Dashboard', onMenuClick }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="app-header">
      <div className="app-header__left">
        {onMenuClick && (
          <button className="app-header__menu" type="button" onClick={onMenuClick} aria-label="Toggle navigation">
            ☰
          </button>
        )}
        <div className="app-header__title">{pageTitle}</div>
      </div>

      <div className="app-header__right">
        <div className="app-header__search">
          <input type="text" placeholder="Search assets, requests, bookings..." aria-label="Search" />
        </div>
        <button className="app-header__icon" type="button" aria-label="Notifications">
          🔔
        </button>
        <div className="app-header__profile">
          <span className="app-header__avatar">J</span>
          <div>
            <div className="app-header__name">John Doe</div>
            <div className="app-header__role">Asset Manager</div>
          </div>
        </div>
        <div className="app-header__date">{today}</div>
      </div>
    </header>
  );
}

export default Header;
