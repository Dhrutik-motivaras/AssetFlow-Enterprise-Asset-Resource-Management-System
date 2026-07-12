import MainLayout from '../components/layout/MainLayout';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

const reports = [
  { title: 'Room B2', value: '34 booking this month' },
  { title: 'Van AF-343', value: '21 trips this month' },
  { title: 'Projector AF-335', value: '18 uses' },
];

const maintenance = [
  { title: 'Camera AF-031', value: 'Unused 60+ days' },
  { title: 'Chair AF-010', value: 'Unused 45 days' },
];

const retirement = [
  { title: 'Forklift AF-007', value: '5 days until service due' },
  { title: 'Laptop AF-0200', value: '9 years old - nearing retirement' },
];

function Reports() {
  return (
    <MainLayout
      title="Reports & Analytics"
      subtitle="Monitor utilization, maintenance frequency and asset retirement trends."
    >
      <div className="screen-panel">
        <div className="dashboard-grid dashboard-grid--cards" style={{ marginBottom: '18px' }}>
          <div className="chart-placeholder" style={{ minHeight: '220px' }}>
            Asset utilization by department
          </div>
          <div className="chart-placeholder" style={{ minHeight: '220px' }}>
            Maintenance frequency and forecast
          </div>
        </div>
        <div className="screen-note" style={{ marginBottom: '18px' }}>
          Most used assets, idle asset warnings, and export-ready maintenance summaries.
        </div>
        <div className="dashboard-grid dashboard-grid--cards">
          <div className="overview-card">
            <h3 className="overview-card__title">Most used assets</h3>
            {reports.map((item) => (
              <p key={item.title}>{item.title}: {item.value}</p>
            ))}
          </div>
          <div className="overview-card">
            <h3 className="overview-card__title">Idle assets</h3>
            {maintenance.map((item) => (
              <p key={item.title}>{item.title}: {item.value}</p>
            ))}
          </div>
        </div>
        <div className="overview-card" style={{ marginTop: '18px' }}>
          <h3 className="overview-card__title">Assets due for maintenance / nearing retirement</h3>
          {retirement.map((item) => (
            <p key={item.title}>{item.title}: {item.value}</p>
          ))}
          <button className="action-button" style={{ marginTop: '18px' }}>Export report</button>
        </div>
      </div>
    </MainLayout>
  );
}

export default Reports;
