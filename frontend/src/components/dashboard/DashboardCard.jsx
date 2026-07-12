import '../../styles/Dashboard.css';

function DashboardCard({ icon, title, value, subtitle, colorClass }) {
  return (
    <article className={`dashboard-card dashboard-card--kpi ${colorClass}`}>
      <div className="dashboard-card__icon">{icon}</div>
      <div className="dashboard-card__content">
        <span className="dashboard-card__label">{title}</span>
        <h3 className="dashboard-card__value">{value}</h3>
        <p className="dashboard-card__subtitle">{subtitle}</p>
      </div>
    </article>
  );
}

export default DashboardCard;
