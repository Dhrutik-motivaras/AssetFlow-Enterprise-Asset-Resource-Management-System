import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

function OrganizationSetup() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Departments');
  const [loading, setLoading] = useState(true);

  // Lists from API
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals visibility
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // New Department form state
  const [deptForm, setDeptForm] = useState({ name: '', code: '', parent: '', status: 'Active' });
  // New Category form state
  const [catForm, setCatForm] = useState({ name: '', code: '', description: '', warranty_period_months: 0, status: 'Active' });

  // Errors/Status states
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const isAdmin = user?.role === 'Admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, catRes, empRes] = await Promise.all([
        api.get('organization/departments/'),
        api.get('assets/categories/'),
        api.get('organization/employees/'),
      ]);
      setDepartments(deptRes.data);
      setCategories(catRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to load setup data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDept = async (e) => {
    e.preventDefault();
    setFormErrors({});
    if (!deptForm.name || !deptForm.code) {
      setFormErrors({ name: 'Name and Code are required.' });
      return;
    }

    try {
      await api.post('organization/departments/', {
        name: deptForm.name,
        code: deptForm.code,
        parent: deptForm.parent ? parseInt(deptForm.parent) : null,
        status: deptForm.status,
      });
      setSuccessMsg('Department added successfully!');
      setShowDeptModal(false);
      setDeptForm({ name: '', code: '', parent: '', status: 'Active' });
      fetchData();
    } catch (err) {
      setFormErrors(err.response?.data || { server: 'Failed to create department.' });
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setFormErrors({});
    if (!catForm.name || !catForm.code) {
      setFormErrors({ name: 'Name and Code are required.' });
      return;
    }

    try {
      await api.post('assets/categories/', {
        name: catForm.name,
        code: catForm.code,
        description: catForm.description,
        warranty_period_months: catForm.warranty_period_months,
        status: catForm.status,
      });
      setSuccessMsg('Asset category added successfully!');
      setShowCategoryModal(false);
      setCatForm({ name: '', code: '', description: '', warranty_period_months: 0, status: 'Active' });
      fetchData();
    } catch (err) {
      setFormErrors(err.response?.data || { server: 'Failed to create asset category.' });
    }
  };

  const handleUpdateRole = async (employeeId, newRole) => {
    try {
      const res = await api.post(`organization/employees/${employeeId}/update-role/`, { role: newRole });
      setSuccessMsg(res.data.detail);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update employee role.');
    }
  };

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmployees = employees.filter((e) =>
    e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout
      title="Organization Setup"
      subtitle="Manage departments, organizational group structures, and asset category schemas."
      actions={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Departments', 'Categories', 'Employees'].map((tab) => (
            <button
              key={tab}
              className={`nav-pill ${tab === activeTab ? 'nav-pill--active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery('');
                setSuccessMsg('');
              }}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              {tab}
            </button>
          ))}
        </div>
      }
    >
      {successMsg && (
        <div style={{ background: 'rgba(46, 204, 113, 0.2)', borderLeft: '4px solid #2ecc71', color: '#fff', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {successMsg}
        </div>
      )}

      <div className="screen-panel">
        <div className="filter-row" style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: '1', maxWidth: '400px' }}
          />

          {activeTab === 'Departments' && (
            <button className="action-button" style={{ margin: 0 }} onClick={() => setShowDeptModal(true)}>
              + Add Department
            </button>
          )}

          {activeTab === 'Categories' && (
            <button className="action-button" style={{ margin: 0 }} onClick={() => setShowCategoryModal(true)}>
              + Add Category
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><h3>Loading {activeTab}...</h3></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* Departments Tab */}
            {activeTab === 'Departments' && (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Department Name</th>
                    <th>Parent Dept</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepts.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>No departments found.</td></tr>
                  ) : (
                    filteredDepts.map((d) => (
                      <tr key={d.id}>
                        <td><strong>{d.code}</strong></td>
                        <td>{d.name}</td>
                        <td>{d.parent_name || 'None'}</td>
                        <td>
                          <span className={`status-pill ${d.status === 'Active' ? 'status-pill--success' : 'status-pill--warning'}`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Categories Tab */}
            {activeTab === 'Categories' && (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Warranty (Mths)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>No categories found.</td></tr>
                  ) : (
                    filteredCategories.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.code}</strong></td>
                        <td>{c.name}</td>
                        <td style={{ maxWidth: '280px', whiteSpace: 'normal', fontSize: '0.85rem' }}>{c.description || 'No description'}</td>
                        <td>{c.warranty_period_months} months</td>
                        <td>
                          <span className={`status-pill ${c.status === 'Active' ? 'status-pill--success' : 'status-pill--warning'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Employees Tab */}
            {activeTab === 'Employees' && (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Full Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Current Role</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#888' }}>No employees found.</td></tr>
                  ) : (
                    filteredEmployees.map((e) => (
                      <tr key={e.id}>
                        <td><strong>{e.employee_code || 'N/A'}</strong></td>
                        <td>{e.full_name}</td>
                        <td>{e.designation || 'N/A'}</td>
                        <td>{e.department_name || 'N/A'}</td>
                        <td>
                          <span className={`status-pill ${e.role === 'Admin' ? 'status-pill--danger' : e.role === 'Asset Manager' ? 'status-pill--info' : 'status-pill--success'}`}>
                            {e.role}
                          </span>
                        </td>
                        <td>
                          {isAdmin ? (
                            <select
                              value={e.role}
                              onChange={(opt) => handleUpdateRole(e.id, opt.target.value)}
                              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cce9e4', background: '#f0fbfa' }}
                            >
                              <option value="Employee">Employee</option>
                              <option value="Asset Manager">Asset Manager</option>
                              <option value="Admin">Admin</option>
                            </select>
                          ) : (
                            <span className="muted" style={{ fontSize: '0.8rem' }}>Admin only</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        <p className="screen-note" style={{ marginTop: '18px' }}>
          Updates made here propagate instantly across all asset registration, checkout, booking, and auditing workflows.
        </p>
      </div>

      {/* Add Department Modal */}
      {showDeptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="screen-panel" style={{ width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3>Add New Department</h3>
              <button style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setShowDeptModal(false)}>✕</button>
            </div>
            
            {formErrors.server && <p className="error-text">{formErrors.server}</p>}

            <form onSubmit={handleAddDept}>
              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="dept-name">Department Name *</label>
                <input
                  id="dept-name"
                  type="text"
                  placeholder="e.g. Human Resources"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="dept-code">Department Code *</label>
                <input
                  id="dept-code"
                  type="text"
                  placeholder="e.g. HR"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="dept-parent">Parent Department</label>
                <select
                  id="dept-parent"
                  value={deptForm.parent}
                  onChange={(e) => setDeptForm({ ...deptForm, parent: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="">None</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row" style={{ marginBottom: '18px' }}>
                <label htmlFor="dept-status">Status</label>
                <select
                  id="dept-status"
                  value={deptForm.status}
                  onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={() => setShowDeptModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-button">
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Asset Category Modal */}
      {showCategoryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="screen-panel" style={{ width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3>Add New Asset Category</h3>
              <button style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setShowCategoryModal(false)}>✕</button>
            </div>

            {formErrors.server && <p className="error-text">{formErrors.server}</p>}

            <form onSubmit={handleAddCategory}>
              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="cat-name">Category Name *</label>
                <input
                  id="cat-name"
                  type="text"
                  placeholder="e.g. IT Equipment"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="cat-code">Category Code *</label>
                <input
                  id="cat-code"
                  type="text"
                  placeholder="e.g. IT"
                  value={catForm.code}
                  onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="cat-desc">Description</label>
                <textarea
                  id="cat-desc"
                  placeholder="Details about assets falling under this category..."
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  style={{ width: '100%', minHeight: '80px' }}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="cat-warranty">Default Warranty Period (Months)</label>
                <input
                  id="cat-warranty"
                  type="number"
                  placeholder="e.g. 12"
                  value={catForm.warranty_period_months}
                  onChange={(e) => setCatForm({ ...catForm, warranty_period_months: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '18px' }}>
                <label htmlFor="cat-status">Status</label>
                <select
                  id="cat-status"
                  value={catForm.status}
                  onChange={(e) => setCatForm({ ...catForm, status: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={() => setShowCategoryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-button">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default OrganizationSetup;
