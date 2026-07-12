import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import DashboardCard from '../components/dashboard/DashboardCard';
import QuickAction from '../components/dashboard/QuickAction';
import ActivityTable from '../components/dashboard/ActivityTable';
import NotificationCard from '../components/dashboard/NotificationCard';
import StatusBadge from '../components/dashboard/StatusBadge';
import Button from '../components/common/Button';
import '../styles/Dashboard.css';

const kpiCards = [
  {
    icon: '📦',
    title: 'Assets Available',
    value: '245',
    subtitle: 'Ready for allocation',
    colorClass: 'dashboard-card--success',
  },
  {
    icon: '📍',
    title: 'Assets Allocated',
    value: '176',
    subtitle: 'Currently in use',
    colorClass: 'dashboard-card--primary',
  },
  {
    icon: '🛠️',
    title: 'Maintenance Today',
    value: '8',
    subtitle: 'Active work orders',
    colorClass: 'dashboard-card--warning',
  },
  {
    icon: '🗓️',
    title: 'Active Bookings',
    value: '29',
    subtitle: 'Confirmed reservations',
    colorClass: 'dashboard-card--purple',
  },
  {
    icon: '🔄',
    title: 'Pending Transfers',
    value: '6',
    subtitle: 'Awaiting approval',
    colorClass: 'dashboard-card--danger',
  },
  {
    icon: '↩️',
    title: 'Upcoming Returns',
    value: '13',
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
  },
  {
    icon: '📅',
    title: 'Book Resource',
    description: 'Secure rooms, hardware, or vehicles for teams.',
    buttonText: 'Start booking',
  },
  {
    icon: '🛠️',
    title: 'Raise Maintenance Request',
    description: 'Log an equipment repair or inspection work order.',
    buttonText: 'Create request',
  },
  {
    icon: '📌',
    title: 'Allocate Asset',
    description: 'Assign inventory to teams, projects, or employees.',
    buttonText: 'Allocate now',
  },
  {
    icon: '📊',
    title: 'Generate Report',
    description: 'Export utilization, booking, and audit summaries.',
    buttonText: 'Generate report',
  },
];

const activityRows = [
  { time: '09:15', activity: 'Laptop AF-0001 allocated', user: 'John', status: 'Completed' },
  { time: '10:05', activity: 'Meeting Room booked', user: 'Priya', status: 'Confirmed' },
  { time: '11:10', activity: 'Maintenance Approved', user: 'Admin', status: 'Approved' },
  { time: '12:20', activity: 'Transfer Request created', user: 'Raj', status: 'Pending' },
  { time: '14:00', activity: 'Asset Returned', user: 'Amit', status: 'Completed' },
];

const pendingApprovals = [
  {
    request: 'Asset Transfer - AF-0123',
    requestedBy: 'Nina',
    priority: 'High',
    status: 'Pending',
  },
  {
    request: 'New Asset Registration',
    requestedBy: 'Kunal',
    priority: 'Medium',
    status: 'Pending',
  },
  {
    request: 'Maintenance Approval',
    requestedBy: 'Sara',
    priority: 'High',
    status: 'Review',
  },
  {
    request: 'Booking Extension',
    requestedBy: 'Rahul',
    priority: 'Low',
    status: 'Pending',
  },
  {
    request: 'Audit Schedule',
    requestedBy: 'Mira',
    priority: 'Medium',
    status: 'Review',
  },
];

const notifications = [
  {
    title: 'Asset overdue',
    message: 'AF-0042 is overdue by 2 days. Please follow up with the assignee.',
    time: '8 mins ago',
    badgeClass: 'danger',
  },
  {
    title: 'Maintenance scheduled',
    message: 'HVAC inspection planned for Building 4 at 16:00.',
    time: '25 mins ago',
    badgeClass: 'warning',
  },
  {
    title: 'Audit reminder',
    message: 'Quarterly audit due in 3 days for asset category B.',
    time: '1 hr ago',
    badgeClass: 'primary',
  },
  {
    title: 'Booking starts in 30 minutes',
    message: 'Conference Hall B booking begins shortly.',
    time: '2 hrs ago',
    badgeClass: 'info',
  },
  {
    title: 'New employee registered',
    message: 'Rohit has been added to the asset access list.',
    time: '4 hrs ago',
    badgeClass: 'success',
  },
];

const upcomingReturns = [
  { asset: 'Projector AF-022', employee: 'Neha', returnDate: '2026-07-18', status: 'Scheduled' },
  { asset: 'Laptop AF-034', employee: 'Karan', returnDate: '2026-07-19', status: 'Pending' },
  { asset: 'Tablet AF-018', employee: 'Priya', returnDate: '2026-07-20', status: 'Scheduled' },
  { asset: 'Printer AF-009', employee: 'Rahul', returnDate: '2026-07-21', status: 'Pending' },
];

function Dashboard() {
  return (
    <div className="dashboard-page">
      <Sidebar />
      <div className="dashboard-content">
        <Header />

        <main className="dashboard-main">
          <section className="dashboard-welcome-card">
            <div>
              <p className="dashboard-welcome__greeting">Welcome back,</p>
              <h1 className="dashboard-welcome__name">John Doe</h1>
              <p className="dashboard-welcome__role">Asset Manager</p>
              <p className="dashboard-welcome__description">
                Manage assets, bookings, maintenance and organization efficiently.
              </p>
            </div>
            <div className="dashboard-welcome__meta">
              <div>
                <span>Total active assets</span>
                <strong>421</strong>
              </div>
              <div>
                <span>Open tickets</span>
                <strong>32</strong>
              </div>
              <div>
                <span>Today’s updates</span>
                <strong>14</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-grid dashboard-grid--kpi">
            {kpiCards.map((item) => (
              <DashboardCard key={item.title} {...item} />
            ))}
          </section>

          <section className="dashboard-grid dashboard-grid--actions">
            {quickActions.map((item) => (
              <QuickAction key={item.title} {...item} />
            ))}
          </section>

          <section className="dashboard-grid dashboard-grid--tables">
            <div className="table-card table-card--wide">
              <ActivityTable rows={activityRows} />
            </div>

            <div className="table-card table-card--wide">
              <div className="table-card__header">
                <h3>Pending Approvals</h3>
                <p>Actions needed for pending asset operations.</p>
              </div>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Requested By</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((item) => (
                    <tr key={item.request}>
                      <td>{item.request}</td>
                      <td>{item.requestedBy}</td>
                      <td>{item.priority}</td>
                      <td>
                        <StatusBadge
                          label={item.status}
                          type={item.status === 'Approved' ? 'success' : item.status === 'Review' ? 'warning' : 'danger'}
                        />
                      </td>
                      <td className="table-actions">
                        <Button variant="success">Approve</Button>
                        <Button variant="danger">Reject</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dashboard-grid dashboard-grid--cards">
            <div className="dashboard-card dashboard-card--chart">
              <div className="dashboard-card__header">
                <h3>Asset Utilization</h3>
                <p>Utilization rate across categories and departments.</p>
              </div>
              <div className="chart-placeholder">Charts will be integrated later.</div>
            </div>

            <div className="dashboard-card dashboard-card--chart">
              <div className="dashboard-card__header">
                <h3>Booking Trends</h3>
                <p>Weekly booking volume and forecast.</p>
              </div>
              <div className="chart-placeholder">Charts will be integrated later.</div>
            </div>
          </section>

          <section className="dashboard-grid dashboard-grid--bottom">
            <div className="dashboard-card dashboard-card--notifications">
              <div className="dashboard-card__header">
                <h3>Notifications</h3>
                <p>Alerts and reminders for the operations team.</p>
              </div>
              <div className="notification-stack">
                {notifications.map((item) => (
                  <NotificationCard key={item.title} {...item} />
                ))}
              </div>
            </div>

            <div className="dashboard-card dashboard-card--returns">
              <div className="dashboard-card__header">
                <h3>Upcoming Returns</h3>
                <p>Asset end dates scheduled this week.</p>
              </div>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Employee</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingReturns.map((item) => (
                    <tr key={item.asset}>
                      <td>{item.asset}</td>
                      <td>{item.employee}</td>
                      <td>{item.returnDate}</td>
                      <td>
                        <StatusBadge label={item.status} type={item.status === 'Scheduled' ? 'primary' : 'warning'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

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
