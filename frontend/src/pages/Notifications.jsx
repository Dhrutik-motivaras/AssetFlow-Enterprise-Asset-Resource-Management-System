import MainLayout from '../components/layout/MainLayout';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

const logs = [
  { text: 'Laptop AF-0103 assigned to Priya Shah', time: '2m ago' },
  { text: 'Maintenance request AF-0055 approved', time: '18m ago' },
  { text: 'Booking confirmed: Room B2 2:00 to 3:00 PM', time: '1h ago' },
  { text: 'Transfer approved: AF-0033 to facilities dept', time: '3h ago' },
  { text: 'Overdue return: AF-0201 was due 3 days ago', time: '18h ago' },
  { text: 'Audit discrepancy flagged: AF-0088 damaged', time: '2d ago' },
];

const filters = ['All', 'Alerts', 'Approvals', 'Bookings'];

function Notifications() {
  return (
    <MainLayout
      title="Activity Logs & Notifications"
      subtitle="View system alerts, approvals and booking updates in real time."
      actions={
        <>
          {filters.map((filter) => (
            <span key={filter} className={`nav-pill ${filter === 'All' ? 'nav-pill--active' : ''}`}>
              {filter}
            </span>
          ))}
        </>
      }
    >
      <div className="screen-panel">
        <table className="dashboard-table">
          <tbody>
            {logs.map((log) => (
              <tr key={log.text}>
                <td>{log.text}</td>
                <td>{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default Notifications;
