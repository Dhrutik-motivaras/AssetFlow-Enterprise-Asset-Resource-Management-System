import MainLayout from '../components/layout/MainLayout';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

const cards = [
  { title: 'AF-0062', detail: 'Projector bulb not turning on', type: 'Pending' },
  { title: 'AF-003', detail: 'Air unit compressor leak', type: 'Approved' },
  { title: 'AF-0079', detail: 'Forklift foot brake issue', type: 'Technician assigned' },
  { title: 'AF-0897', detail: 'Printer jam / parts ordered', type: 'In progress' },
  { title: 'AF-973', detail: 'Chair repair resolved', type: 'Resolved' },
];

function Maintenance() {
  return (
    <MainLayout
      title="Maintenance Management"
      subtitle="Track approval workflows and technician progress in a kanban style board."
    >
      <div className="board-grid">
        <div className="board-column">
          <h4>Pending</h4>
          {cards.filter((card) => card.type === 'Pending').map((card) => (
            <div key={card.title} className="board-card">
              <strong>{card.title}</strong>
              <p>{card.detail}</p>
            </div>
          ))}
        </div>
        <div className="board-column">
          <h4>Approved</h4>
          {cards.filter((card) => card.type === 'Approved').map((card) => (
            <div key={card.title} className="board-card">
              <strong>{card.title}</strong>
              <p>{card.detail}</p>
            </div>
          ))}
        </div>
        <div className="board-column">
          <h4>Technician assigned</h4>
          {cards.filter((card) => card.type === 'Technician assigned').map((card) => (
            <div key={card.title} className="board-card">
              <strong>{card.title}</strong>
              <p>{card.detail}</p>
            </div>
          ))}
        </div>
        <div className="board-column">
          <h4>In progress</h4>
          {cards.filter((card) => card.type === 'In progress').map((card) => (
            <div key={card.title} className="board-card">
              <strong>{card.title}</strong>
              <p>{card.detail}</p>
            </div>
          ))}
        </div>
        <div className="board-column">
          <h4>Resolved</h4>
          {cards.filter((card) => card.type === 'Resolved').map((card) => (
            <div key={card.title} className="board-card">
              <strong>{card.title}</strong>
              <p>{card.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="screen-note">Approving a card moves the asset to under maintenance, resolving returns it to available.</p>
    </MainLayout>
  );
}

export default Maintenance;
