import MainLayout from '../components/layout/MainLayout';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

const history = [
  { date: 'Mar 12', detail: 'Allocated to Priya Shah - Engineering' },
  { date: 'Jan 04', detail: 'Returned by Arjun Nair - condition good' },
];

function AllocationTransfer() {
  return (
    <MainLayout
      title="Allocation & Transfer"
      subtitle="Create transfer requests and review current allocation history."
      actions={<span className="status-pill status-pill--danger">Direct re-allocation is blocked</span>}
    >
      <div className="screen-panel">
        <div className="screen-note" style={{ marginBottom: '16px' }}>
          Asset AF-0114 is currently allocated to Priya Shah (Engineering). Transfer requests are reviewed by the Operations team.
        </div>
        <div className="form-row" style={{ marginBottom: '18px' }}>
          <input style={{ flex: 1 }} type="text" placeholder="Asset AF-0114 - Dell Laptop" readOnly />
          <input type="text" value="Priya Shah" readOnly />
          <select>
            <option>Select Employee...</option>
            <option>Rajesh Nair</option>
            <option>Mira Patel</option>
          </select>
        </div>
        <div className="form-row" style={{ marginBottom: '18px' }}>
          <textarea style={{ flex: 1, minHeight: '140px' }} placeholder="Reason for transfer request"></textarea>
        </div>
        <button className="action-button">Submit Request</button>
      </div>

      <div className="screen-panel">
        <h3>Allocation History</h3>
        <ul style={{ marginTop: '16px', paddingLeft: '18px', color: '#cccccc' }}>
          {history.map((item) => (
            <li key={item.date} style={{ marginBottom: '10px' }}>
              <strong>{item.date}</strong> — {item.detail}
            </li>
          ))}
        </ul>
      </div>
    </MainLayout>
  );
}

export default AllocationTransfer;
