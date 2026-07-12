import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import DashboardCard from '../components/dashboard/DashboardCard';
import QuickAction from '../components/dashboard/QuickAction';
import ActivityTable from '../components/dashboard/ActivityTable';
import NotificationCard from '../components/dashboard/NotificationCard';
import StatusBadge from '../components/dashboard/StatusBadge';
import Button from '../components/common/Button';
import api from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

function Dashboard() {
  const { user } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const updateSidebar = () => {
      setSidebarVisible(window.innerWidth >= 1024);
    };

    updateSidebar();
    window.addEventListener('resize', updateSidebar);
    return () => window.removeEventListener('resize', updateSidebar);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('accounts/dashboard-stats/');
      setStats(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Could not load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleApproveReject = async (id, type, action) => {
    if (type !== 'Transfer') {
      alert("Only Transfer Requests can be processed from the dashboard currently.");
      return;
    }

    try {
      if (action === 'approve') {
        await api.post(`allocations/transfers/${id}/approve/`);
      } else {
        const remarks = prompt("Enter rejection remarks:");
        if (remarks === null) return;
        await api.post(`allocations/transfers/${id}/reject/`, { remarks });
      }
      fetchDashboardStats();
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to process ${action} action.`);
    }
  };

  const kpiCards = [
    {
      icon: '📦',
      title: 'Assets Available',
      value: stats?.kpi?.assets_available ?? '0',
      subtitle: 'Ready for allocation',
      colorClass: 'dashboard-card--success',
    },
    {
      icon: '📍',
      title: 'Assets Allocated',
      value: stats?.kpi?.assets_allocated ?? '0',
      subtitle: 'Currently in use',
      colorClass: 'dashboard-card--primary',
    },
    {
      icon: '🛠️',
      title: 'Maintenance Today',
      value: stats?.kpi?.maintenance_today ?? '0',
      subtitle: 'Active work orders',
      colorClass: 'dashboard-card--warning',
    },
    {
      icon: '🗓️',
      title: 'Active Bookings',
      value: stats?.kpi?.active_bookings ?? '0',
      subtitle: 'Confirmed reservations',
      colorClass: 'dashboard-card--purple',
    },
    {
      icon: '🔄',
      title: 'Pending Transfers',
      value: stats?.kpi?.pending_transfers ?? '0',
      subtitle: 'Awaiting approval',
      colorClass: 'dashboard-card--danger',
    },
    {
      icon: '↩️',
      title: 'Upcoming Returns',
      value: stats?.kpi?.upcoming_returns_count ?? '0',
      subtitle: 'Due within 5 days',
      colorClass: 'dashboard-card--teal',
    },
  ];

  const quickActions = [
    {
      icon: '➕',
      title: 'Register Asset',
      description: 'Capture new equipment or inventory in the system.',
      buttonText: 'Begin registration',
      path: '/assets',
    },
    {
      icon: '📅',
      title: 'Book Resource',
      description: 'Secure rooms, hardware, or vehicles for teams.',
      buttonText: 'Start booking',
      path: '/booking',
    },
    {
      icon: '🛠️',
      title: 'Raise Maintenance Request',
      description: 'Log an equipment repair or inspection work order.',
      buttonText: 'Create request',
      path: '/maintenance',
    },
    {
      icon: '📌',
      title: 'Allocate Asset',
      description: 'Assign inventory to teams, projects, or employees.',
      buttonText: 'Allocate now',
      path: '/allocation',
    },
    {
      icon: '📊',
      title: 'Generate Report',
      description: 'Export utilization, booking, and audit summaries.',
      buttonText: 'Generate report',
      path: '/reports',
    },
  ];

  return (
    <div className="dashboard-page">
      <Sidebar visible={sidebarVisible} onToggle={() => setSidebarVisible((prev) => !prev)} />
      <div className="dashboard-content" style={{ marginLeft: sidebarVisible && window.innerWidth >= 1024 ? '280px' : '0' }}>
        <Header onMenuClick={() => setSidebarVisible((prev) => !prev)} />

        <main className="dashboard-main">
          {error && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 20px', borderRadius: '10px', border: '1px solid #f5c6cb' }}>
              {error}
            </div>
          )}

          <section className="dashboard-welcome-card">
            <div>
              <p className="dashboard-welcome__greeting">Welcome back,</p>
              <h1 className="dashboard-welcome__name">{user?.full_name || 'User'}</h1>
              <p className="dashboard-welcome__role">{user?.role || 'Employee'}</p>
              <p className="dashboard-welcome__description">
                Manage assets, bookings, maintenance, and organization structures in real-time.
              </p>
            </div>
            <div className="dashboard-welcome__meta">
              <div>
                <span>Total active assets</span>
                <strong>{(stats?.kpi?.assets_available ?? 0) + (stats?.kpi?.assets_allocated ?? 0)}</strong>
              </div>
              <div>
                <span>Open tickets</span>
                <strong>{stats?.kpi?.maintenance_today ?? 0}</strong>
              </div>
              <div>
                <span>Pending Transfers</span>
                <strong>{stats?.kpi?.pending_transfers ?? 0}</strong>
              </div>
            </div>
          </section>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>Loading Dashboard Statistics...</h3>
            </div>
          ) : (
            <>
              {/* KPI Cards Grid */}
              <section className="dashboard-grid dashboard-grid--kpi">
                {kpiCards.map((item) => (
                  <DashboardCard key={item.title} {...item} />
                ))}
              </section>

              {/* Quick Actions Section */}
              <h2 style={{ fontSize: '1.25rem', marginTop: '10px', marginBottom: '0', color: '#0f172a' }}>Quick Actions</h2>
              <section className="dashboard-grid dashboard-grid--actions">
                {quickActions.map((item) => (
                  <QuickAction key={item.title} {...item} />
                ))}
              </section>

              {/* Tables Section */}
              <section className="dashboard-grid dashboard-grid--tables">
                {/* Recent Activity Logs */}
                <div className="table-card table-card--wide">
                  <ActivityTable rows={stats?.activity_rows ?? []} />
                </div>

                {/* Pending Approvals */}
                <div className="table-card table-card--wide" style={{ overflowX: 'auto' }}>
                  <div className="table-card__header">
                    <h3>Pending Approvals</h3>
                    <p>Actions needed for pending asset operations.</p>
                  </div>
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Request</th>
                        <th>Requested By</th>
                        <th>Priority</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.pending_approvals ?? []).length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
                            No pending approvals.
                          </td>
                        </tr>
                      ) : (
                        stats.pending_approvals.map((item) => (
                          <tr key={`${item.type}-${item.id}`}>
                            <td>
                              <span className={`status-pill ${item.type === 'Transfer' ? 'status-pill--info' : 'status-pill--warning'}`}>
                                {item.type}
                              </span>
                            </td>
                            <td>{item.request}</td>
                            <td>{item.requestedBy}</td>
                            <td>
                              <span style={{
                                fontWeight: 'bold',
                                color: item.priority === 'High' ? '#e74c3c' : item.priority === 'Medium' ? '#f39c12' : '#27ae60'
                              }}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="table-actions">
                              <Button variant="success" onClick={() => handleApproveReject(item.id, item.type, 'approve')}>
                                Approve
                              </Button>
                              <Button variant="danger" onClick={() => handleApproveReject(item.id, item.type, 'reject')}>
                                Reject
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Bottom Section: Notifications & Upcoming Returns */}
              <section className="dashboard-grid dashboard-grid--bottom">
                {/* Real-time Notifications */}
                <div className="dashboard-card dashboard-card--notifications">
                  <div className="dashboard-card__header">
                    <h3>Notifications</h3>
                    <p>Alerts and reminders for the operations team.</p>
                  </div>
                  <div className="notification-stack">
                    {(stats?.notifications ?? []).length === 0 ? (
                      <p style={{ color: '#888', textAlign: 'center', paddingTop: '20px' }}>No new notifications.</p>
                    ) : (
                      stats.notifications.map((item) => (
                        <NotificationCard key={item.id} {...item} />
                      ))
                    )}
                  </div>
                </div>

                {/* Upcoming Returns */}
                <div className="dashboard-card dashboard-card--returns" style={{ overflowX: 'auto' }}>
                  <div className="dashboard-card__header">
                    <h3>Upcoming Returns</h3>
                    <p>Asset end dates scheduled this week.</p>
                  </div>
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Assignee</th>
                        <th>Return Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.upcoming_returns ?? []).length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
                            No returns scheduled.
                          </td>
                        </tr>
                      ) : (
                        stats.upcoming_returns.map((item) => (
                          <tr key={item.id}>
                            <td>{item.asset}</td>
                            <td>{item.employee}</td>
                            <td>{item.returnDate}</td>
                            <td>
                              <StatusBadge
                                label={item.status}
                                type={item.status === 'Overdue' ? 'danger' : 'primary'}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          <footer className="dashboard-footer">
            <div>AssetFlow ERP</div>
            <div>Version 1.0</div>
            <div>© 2026</div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
