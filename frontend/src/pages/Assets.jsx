import MainLayout from '../components/layout/MainLayout';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

const assets = [
  { tag: 'AF-0012', name: 'Dell Laptop', category: 'Electronics', status: 'Allocated', department: 'IT', location: 'Bengaluru' },
  { tag: 'AF-0062', name: 'Projector', category: 'Electronics', status: 'Maintenance', department: 'Facilities', location: 'HQ Floor 2' },
  { tag: 'AF-0201', name: 'Office Chair', category: 'Furniture', status: 'Available', department: 'Operations', location: 'Warehouse' },
  { tag: 'AF-0119', name: 'Conference Phone', category: 'Electronics', status: 'Booked', department: 'Sales', location: 'Meeting Room 3' },
];

function Assets() {
  return (
    <MainLayout
      title="Assets"
      subtitle="View the full asset directory and filter by department, category and status."
      actions={<button className="action-button">Register Asset</button>}
    >
      <div className="screen-panel">
        <div className="filter-row" style={{ marginBottom: '18px' }}>
          <input type="text" placeholder="Search by tag, serial, or QR code..." />
          <select>
            <option>All Categories</option>
            <option>Electronics</option>
            <option>Furniture</option>
            <option>Vehicles</option>
          </select>
          <select>
            <option>All Status</option>
            <option>Available</option>
            <option>Allocated</option>
            <option>Maintenance</option>
            <option>Booked</option>
          </select>
          <select>
            <option>All Departments</option>
            <option>IT</option>
            <option>Facilities</option>
            <option>Operations</option>
          </select>
        </div>

        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.tag}>
                <td>{asset.tag}</td>
                <td>{asset.name}</td>
                <td>{asset.category}</td>
                <td>
                  <span className={`status-pill ${asset.status === 'Available' ? 'status-pill--success' : asset.status === 'Maintenance' ? 'status-pill--warning' : asset.status === 'Allocated' ? 'status-pill--info' : 'status-pill--danger'}`}>
                    {asset.status}
                  </span>
                </td>
                <td>{asset.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default Assets;
