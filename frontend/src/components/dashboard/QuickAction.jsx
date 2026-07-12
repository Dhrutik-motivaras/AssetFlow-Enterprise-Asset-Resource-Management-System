import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';
import Button from '../common/Button';

function QuickAction({ icon, title, description, buttonText, path }) {
  const navigate = useNavigate();

  return (
    <div className="quick-action-card">
      <div className="quick-action-card__top">
        <div className="quick-action-card__icon">{icon}</div>
        <div>
          <p className="quick-action-card__title">{title}</p>
          <p className="quick-action-card__description">{description}</p>
        </div>
      </div>
      <Button variant="secondary" fullWidth onClick={() => path && navigate(path)}>
        {buttonText}
      </Button>
    </div>
  );
}

export default QuickAction;
