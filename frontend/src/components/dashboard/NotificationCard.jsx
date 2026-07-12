import '../../styles/Dashboard.css';

function NotificationCard({ title, message, time, badgeClass }) {
  return (
    <div className="notification-card">
      <div className="notification-card__top">
        <div className={`notification-card__badge notification-card__badge--${badgeClass}`} />
        <div>
          <h4>{title}</h4>
          <p>{message}</p>
        </div>
      </div>
      <span className="notification-card__time">{time}</span>
    </div>
  );
}

export default NotificationCard;
