import '../../styles/Dashboard.css';

function ActivityItem({ icon, title, time }) {
  return (
    <div className="activity-item">
      <div className="activity-item__icon">{icon}</div>
      <div>
        <div className="activity-item__title">{title}</div>
        <div className="activity-item__time">{time}</div>
      </div>
    </div>
  );
}

export default ActivityItem;
