import MainLayout from '../components/layout/MainLayout';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

const departments = [
  { department: 'Engineering', head: 'Aditya Rao', parent: 'Head Office', status: 'Active' },
  { department: 'Facilities', head: 'Rehan Mehta', parent: 'Head Office', status: 'Active' },
  { department: 'Field Ops (East)', head: 'Sara Iqbal', parent: 'Field Ops', status: 'Inactive' },
  { department: 'Audit & Compliance', head: 'Mira Patel', parent: 'Head Office', status: 'Active' },
];

const tabs = ['Departments', 'Categories', 'Employees', 'Add'];

function OrganizationSetup() {
  return (
    <MainLayout
      title="Organization Setup"
      subtitle="Manage departments, employee groups and category structures."
      actions={
        <>
          {tabs.map((tab) => (
            <span key={tab} className={`nav-pill ${tab === 'Departments' ? 'nav-pill--active' : ''}`}>
              {tab}
            </span>
          ))}
        </>
      }
    >
      <div className="screen-panel">
        <div className="filter-row" style={{ marginBottom: '18px' }}>
          <input type="text" placeholder="Search department, head, parent..." />
          <button className="action-button">+ Add Department</button>
        </div>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Head</th>
              <th>Parent Dept</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((row) => (
              <tr key={row.department}>
                <td>{row.department}</td>
                <td>{row.head}</td>
                <td>{row.parent}</td>
                <td>
                  <span className={`status-pill ${row.status === 'Active' ? 'status-pill--success' : 'status-pill--warning'}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="screen-note">Editing a department here also updates allocation, booking and audit records across the system.</p>
      </div>
    </MainLayout>
  );
}

export default OrganizationSetup;
