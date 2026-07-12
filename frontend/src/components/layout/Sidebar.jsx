import { NavLink } from 'react-router-dom';
import '../../styles/Sidebar.css';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Organization Setup', path: '/organization', icon: '🏢' },
  { label: 'Assets', path: '/assets', icon: '🖥️' },
  { label: 'Asset Allocation', path: '/allocation', icon: '📦' },
  { label: 'Resource Booking', path: '/booking', icon: '🗓️' },
  { label: 'Maintenance', path: '/maintenance', icon: '🛠️' },
  { label: 'Asset Audit', path: '/audit', icon: '✅' },
  { label: 'Reports', path: '/reports', icon: '📈' },
  { label: 'Notifications', path: '/notifications', icon: '🔔' },
  { label: 'Logout', path: '/logout', icon: '🚪' },
];

function Sidebar({ visible = true, onToggle = () => {} }) {
  return (
    <aside className={`sidebar ${visible ? 'sidebar--visible' : ''}`}>
      <div className="sidebar__brand">
        <div className="sidebar__logo">AF</div>
        <div className="sidebar__title">AssetFlow</div>
      </div>

      <button className="sidebar__toggle" onClick={onToggle}>
        {visible ? '✕' : '☰'}
      </button>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
