import '../../styles/Dashboard.css';

function StatusBadge({ label, type }) {
  return <span className={`status-badge status-badge--${type}`}>{label}</span>;
}

export default StatusBadge;
