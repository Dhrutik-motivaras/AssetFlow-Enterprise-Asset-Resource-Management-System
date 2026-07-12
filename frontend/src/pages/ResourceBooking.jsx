import MainLayout from '../components/layout/MainLayout';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

const bookings = [
  { time: '09:00 - 10:00', title: 'Booked - Procurement Team', status: 'Confirmed' },
  { time: '09:30 - 10:30', title: 'Requested - Design Sync', status: 'Conflict' },
  { time: '11:00 - 12:00', title: 'Available', status: 'Open' },
];

function ResourceBooking() {
  return (
    <MainLayout
      title="Resource Booking"
      subtitle="Reserve rooms, equipment and spaces with a live booking timeline."
      actions={<button className="action-button">Book a slot</button>}
    >
      <div className="screen-panel">
        <div className="filter-row" style={{ marginBottom: '18px' }}>
          <input style={{ flex: 1 }} type="text" value="Conference room B2 - Tue, 7 Jul" readOnly />
        </div>
        <div className="board-grid">
          {bookings.map((slot) => (
            <div key={slot.time} className="board-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <strong>{slot.time}</strong>
                <span className={`status-pill ${slot.status === 'Confirmed' ? 'status-pill--success' : slot.status === 'Conflict' ? 'status-pill--danger' : 'status-pill--info'}`}>
                  {slot.status}
                </span>
              </div>
              <p style={{ margin: '10px 0 0', color: '#cccccc' }}>{slot.title}</p>
            </div>
          ))}
        </div>
        <p className="screen-note">Only confirmed slots are blocked. Requests with conflicts require manual review.</p>
      </div>
    </MainLayout>
  );
}

export default ResourceBooking;
