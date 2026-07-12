import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/Dashboard.css';
import '../../styles/Screens.css';

function MainLayout({ title, subtitle, actions, children }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    const updateSidebar = () => {
      setSidebarVisible(window.innerWidth >= 1024);
    };

    updateSidebar();
    window.addEventListener('resize', updateSidebar);

    return () => window.removeEventListener('resize', updateSidebar);
  }, []);

  return (
    <div className="screen-page">
      <Sidebar visible={sidebarVisible} onToggle={() => setSidebarVisible((prev) => !prev)} />
      <div className="dashboard-content">
        <Header pageTitle={title} onMenuClick={() => setSidebarVisible((prev) => !prev)} />
        <div className="screen-page__content">
          <div className="screen-heading">
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            {actions && <div className="filter-row">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
