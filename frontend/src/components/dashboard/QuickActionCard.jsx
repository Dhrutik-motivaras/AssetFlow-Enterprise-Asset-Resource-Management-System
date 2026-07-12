import '../../styles/Dashboard.css';

function QuickActionCard({ icon, title, description }) {
  return (
    <div className="quick-action-card">
      <div className="quick-action-card__icon">{icon}</div>
      <div>
        <div className="quick-action-card__title">{title}</div>
        <div className="quick-action-card__description">{description}</div>
      </div>
    </div>
  );
}

export default QuickActionCard;
