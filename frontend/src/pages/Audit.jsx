import MainLayout from '../components/layout/MainLayout';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

const audits = [
  { asset: 'AF-003 Dell laptop', location: 'Desk E12', status: 'Verified' },
  { asset: 'AF-021 Office chair', location: 'Desk E19', status: 'Missing' },
  { asset: 'AF-035 Monitor', location: 'Desk E15', status: 'Damaged' },
];

function Audit() {
  return (
    <MainLayout
      title="Asset Audit"
      subtitle="Review the current audit cycle and auto-generated discrepancy report."
    >
      <div className="screen-panel">
        <div className="filter-row" style={{ marginBottom: '18px' }}>
          <span className="status-pill status-pill--info">Q3 audit: Engineering dept • 1-15 Jul</span>
          <span className="status-pill status-pill--success">Auditors: A. Rao, S. Iqbal</span>
        </div>

        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Expected location</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((row) => (
              <tr key={row.asset}>
                <td>{row.asset}</td>
                <td>{row.location}</td>
                <td>
                  <span className={`status-pill ${row.status === 'Verified' ? 'status-pill--success' : row.status === 'Missing' ? 'status-pill--danger' : 'status-pill--warning'}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="screen-note">2 assets flagged - discrepancy report generated automatically.</p>
        <button className="action-button">Close audit cycle</button>
      </div>
    </MainLayout>
  );
}

export default Audit;
