import '../../styles/Dashboard.css';

function KpiCard({ icon, title, value, trend, theme }) {
  return (
    <div className={`kpi-card kpi-card--${theme}`}>
      <div className="kpi-card__icon">{icon}</div>
      <div>
        <div className="kpi-card__title">{title}</div>
        <div className="kpi-card__value">{value}</div>
        <div className="kpi-card__trend">{trend}</div>
      </div>
    </div>
  );
}

export default KpiCard;
