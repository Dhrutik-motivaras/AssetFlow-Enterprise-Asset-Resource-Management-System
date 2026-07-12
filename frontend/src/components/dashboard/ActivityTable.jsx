import '../../styles/Dashboard.css';

function ActivityTable({ rows }) {
  return (
    <div className="table-card">
      <div className="table-card__header">
        <h3>Recent Activity</h3>
        <p>Live updates from asset and booking operations.</p>
      </div>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Activity</th>
            <th>User</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={`${item.time}-${item.activity}`}>
              <td>{item.time}</td>
              <td>{item.activity}</td>
              <td>{item.user}</td>
              <td>
                <span className={`status-badge status-badge--${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityTable;
