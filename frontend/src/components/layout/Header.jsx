import { useAuth } from '../../context/AuthContext';
import '../../styles/Header.css';

function Header({ pageTitle = 'Dashboard', onMenuClick }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const avatarInitial = (user?.full_name || 'U').charAt(0).toUpperCase();

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
          <span className="app-header__avatar">{avatarInitial}</span>
          <div>
            <div className="app-header__name">{user?.full_name || 'User'}</div>
            <div className="app-header__role">{user?.role || 'Employee'}</div>
          </div>
        </div>
        <div className="app-header__date">{today}</div>
      </div>
    </header>
  );
}

export default Header;
