import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

function AllocationTransfer() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('allocations');
  const [loading, setLoading] = useState(true);

  // Data states
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Checkout / Transfer form states
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [checkoutTarget, setCheckoutTarget] = useState('employee'); // 'employee' or 'department'
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [targetDepartmentId, setTargetDepartmentId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [transferReason, setTransferReason] = useState('');
  
  // Return check-in states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returningAlloc, setReturningAlloc] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Good');
  const [checkInNotes, setCheckInNotes] = useState('');

  // Status/Error states
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // Role authorization
  const isManager = user?.role === 'Admin' || user?.role === 'Asset Manager';

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allocRes, transRes, assetsRes, empRes, deptRes] = await Promise.all([
        api.get('allocations/'),
        api.get('allocations/transfers/'),
        api.get('assets/'),
        api.get('organization/employees/'),
        api.get('organization/departments/'),
      ]);
      
      // Filter allocations to only show active ones by default
      setAllocations(allocRes.data.filter((a) => a.status === 'Active'));
      setTransfers(transRes.data);
      setAssets(assetsRes.data);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error('Failed to load allocation dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Find the selected asset's details
  const selectedAsset = assets.find((a) => a.id === parseInt(selectedAssetId));
  const isAssetConflicted = selectedAsset && selectedAsset.status !== 'Available';
  const conflictHolder = selectedAsset?.current_allocation?.holder_name;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMsg('');

    const errors = {};
    if (!selectedAssetId) errors.asset = 'Please select an asset.';
    
    if (checkoutTarget === 'employee' && !targetEmployeeId) {
      errors.recipient = 'Please select a recipient employee.';
    }
    if (checkoutTarget === 'department' && !targetDepartmentId) {
      errors.recipient = 'Please select a recipient department.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        asset: selectedAssetId,
        expected_return_date: expectedReturnDate || null,
        remarks: remarks.trim(),
      };
      
      if (checkoutTarget === 'employee') {
        payload.employee = targetEmployeeId;
      } else {
        payload.department = targetDepartmentId;
      }

      await api.post('allocations/', payload);
      setSuccessMsg('Asset allocated successfully!');
      
      // Reset form
      setSelectedAssetId('');
      setTargetEmployeeId('');
      setTargetDepartmentId('');
      setExpectedReturnDate('');
      setRemarks('');
      
      fetchData();
      setActiveTab('allocations');
    } catch (err) {
      if (err.response?.data) {
        setFormErrors(err.response.data);
      } else {
        setFormErrors({ server: 'Failed to complete allocation checkout.' });
      }
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMsg('');

    const errors = {};
    if (!selectedAssetId) errors.asset = 'Please select an asset.';
    if (!transferReason.trim()) errors.reason = 'Please state a reason for this transfer request.';
    
    if (checkoutTarget === 'employee' && !targetEmployeeId) {
      errors.recipient = 'Please select a recipient employee.';
    }
    if (checkoutTarget === 'department' && !targetDepartmentId) {
      errors.recipient = 'Please select a recipient department.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        allocation: selectedAsset.current_allocation.id,
        reason: transferReason.trim(),
      };

      if (checkoutTarget === 'employee') {
        payload.to_employee = targetEmployeeId;
      } else {
        payload.to_department = targetDepartmentId;
      }

      await api.post('allocations/transfers/', payload);
      setSuccessMsg('Transfer request submitted successfully. Awaiting manager approval.');
      
      // Reset form
      setSelectedAssetId('');
      setTargetEmployeeId('');
      setTargetDepartmentId('');
      setTransferReason('');
      
      fetchData();
      setActiveTab('transfers');
    } catch (err) {
      if (err.response?.data) {
        setFormErrors(err.response.data);
      } else {
        setFormErrors({ server: 'Failed to create transfer request.' });
      }
    }
  };

  const handleReturnClick = (alloc) => {
    setReturningAlloc(alloc);
    setReturnCondition('Good');
    setCheckInNotes('');
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`allocations/${returningAlloc.id}/return/`, {
        return_condition: returnCondition,
        check_in_notes: checkInNotes.trim(),
      });
      setShowReturnModal(false);
      setReturningAlloc(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to complete check-in.');
    }
  };

  const handleProcessTransfer = async (id, action) => {
    try {
      await api.post(`allocations/transfers/${id}/${action}/`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to ${action} transfer request.`);
    }
  };

  return (
    <MainLayout
      title="Asset Allocation & Transfer"
      subtitle="Manage asset handovers, check-ins, and employee transfer requests."
    >
      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          className={`tab-button ${activeTab === 'allocations' ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab('allocations')}
        >
          Active Allocations
        </button>
        <button
          className={`tab-button ${activeTab === 'checkout' ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab('checkout')}
        >
          Allocate / Transfer Form
        </button>
        <button
          className={`tab-button ${activeTab === 'transfers' ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab('transfers')}
        >
          Transfer Requests ({transfers.filter((t) => t.status === 'Requested').length})
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(46, 204, 113, 0.2)', borderLeft: '4px solid #2ecc71', color: '#fff', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><h3>Loading Allocation Dashboard...</h3></div>
      ) : (
        <>
          {/* Active Allocations Tab */}
          {activeTab === 'allocations' && (
            <div className="screen-panel">
              {allocations.length === 0 ? (
                <div className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>
                  <h3>No active allocations found.</h3>
                </div>
              ) : (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Asset Tag</th>
                      <th>Asset Name</th>
                      <th>Assigned To</th>
                      <th>Allocated Date</th>
                      <th>Expected Return</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((alloc) => (
                      <tr key={alloc.id}>
                        <td><strong>{alloc.asset_tag}</strong></td>
                        <td>{alloc.asset_name}</td>
                        <td>{alloc.employee_name || alloc.department_name}</td>
                        <td>{new Date(alloc.allocated_date).toLocaleDateString()}</td>
                        <td>
                          {alloc.expected_return_date ? (
                            <span style={{
                              color: new Date(alloc.expected_return_date) < new Date() ? '#ff4d4d' : 'inherit',
                              fontWeight: new Date(alloc.expected_return_date) < new Date() ? 'bold' : 'normal'
                            }}>
                              {alloc.expected_return_date} {new Date(alloc.expected_return_date) < new Date() && ' (Overdue)'}
                            </span>
                          ) : 'No due date'}
                        </td>
                        <td>
                          <button
                            style={{
                              background: '#27ae60',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                            onClick={() => handleReturnClick(alloc)}
                          >
                            Check-in Return
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Allocate & Transfer Tab */}
          {activeTab === 'checkout' && (
            <div className="screen-panel" style={{ maxWidth: '700px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '16px' }}>Allocate Asset / Submit Transfer Request</h3>
              
              {formErrors.server && <p className="error-text" style={{ textAlign: 'center' }}>{formErrors.server}</p>}

              <form onSubmit={isAssetConflicted ? handleTransferSubmit : handleCheckoutSubmit}>
                
                {/* Select Asset */}
                <div className="form-row" style={{ marginBottom: '16px' }}>
                  <label htmlFor="select-asset">Select Asset *</label>
                  <select
                    id="select-asset"
                    value={selectedAssetId}
                    onChange={(e) => {
                      setSelectedAssetId(e.target.value);
                      setFormErrors({});
                    }}
                  >
                    <option value="">Choose Asset...</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.asset_tag} - {a.name} ({a.status})
                      </option>
                    ))}
                  </select>
                  {formErrors.asset && <span className="error-text">{formErrors.asset}</span>}
                </div>

                {/* Conflict warning */}
                {isAssetConflicted && (
                  <div style={{ background: 'rgba(231, 76, 60, 0.15)', borderLeft: '4px solid #e74c3c', color: '#fff', padding: '14px', borderRadius: '4px', marginBottom: '20px' }}>
                    <strong>Direct Checkout Blocked:</strong> This asset is currently allocated to <strong>{conflictHolder || 'another employee'}</strong>. 
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem' }}>
                      To request this asset, fill out the target recipient details below and submit a <strong>Transfer Request</strong> instead.
                    </p>
                  </div>
                )}

                {/* Target Type */}
                <div className="form-row" style={{ marginBottom: '16px', display: 'flex', gap: '20px' }}>
                  <div>
                    <input
                      type="radio"
                      id="target-employee"
                      name="checkout-target"
                      checked={checkoutTarget === 'employee'}
                      onChange={() => setCheckoutTarget('employee')}
                    />
                    <label htmlFor="target-employee" style={{ marginLeft: '6px', cursor: 'pointer' }}>Allocate to Employee</label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="target-dept"
                      name="checkout-target"
                      checked={checkoutTarget === 'department'}
                      onChange={() => setCheckoutTarget('department')}
                    />
                    <label htmlFor="target-dept" style={{ marginLeft: '6px', cursor: 'pointer' }}>Allocate to Department</label>
                  </div>
                </div>

                {/* Target dropdowns */}
                <div className="form-row" style={{ marginBottom: '16px' }}>
                  {checkoutTarget === 'employee' ? (
                    <>
                      <label htmlFor="target-emp-select">Select Employee *</label>
                      <select
                        id="target-emp-select"
                        value={targetEmployeeId}
                        onChange={(e) => setTargetEmployeeId(e.target.value)}
                      >
                        <option value="">Select Employee...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.employee_code} - {emp.full_name}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label htmlFor="target-dept-select">Select Department *</label>
                      <select
                        id="target-dept-select"
                        value={targetDepartmentId}
                        onChange={(e) => setTargetDepartmentId(e.target.value)}
                      >
                        <option value="">Select Department...</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.code} - {dept.name}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {formErrors.recipient && <span className="error-text">{formErrors.recipient}</span>}
                </div>

                {/* Action-specific fields */}
                {isAssetConflicted ? (
                  /* Transfer Form */
                  <div className="form-row" style={{ marginBottom: '18px' }}>
                    <label htmlFor="transfer-reason">Reason for Transfer Request *</label>
                    <textarea
                      id="transfer-reason"
                      placeholder="Why do you need to transfer this asset? (e.g. Employee changed desk/role)"
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      style={{ width: '100%', minHeight: '100px' }}
                    />
                    {formErrors.reason && <span className="error-text">{formErrors.reason}</span>}
                  </div>
                ) : (
                  /* Checkout Form */
                  <>
                    <div className="form-row" style={{ marginBottom: '16px' }}>
                      <label htmlFor="due-date">Expected Return Date</label>
                      <input
                        id="due-date"
                        type="date"
                        value={expectedReturnDate}
                        onChange={(e) => setExpectedReturnDate(e.target.value)}
                      />
                    </div>
                    <div className="form-row" style={{ marginBottom: '18px' }}>
                      <label htmlFor="remarks">Checkout Remarks</label>
                      <textarea
                        id="remarks"
                        placeholder="Condition comments, remarks..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        style={{ width: '100%', minHeight: '80px' }}
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="action-button" style={{ width: '100%', margin: 0 }}>
                  {isAssetConflicted ? 'Submit Transfer Request' : 'Complete Allocation Checkout'}
                </button>
              </form>
            </div>
          )}

          {/* Transfer Requests Tab */}
          {activeTab === 'transfers' && (
            <div className="screen-panel">
              {transfers.length === 0 ? (
                <div className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>
                  <h3>No transfer requests found.</h3>
                </div>
              ) : (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>From Holder</th>
                      <th>To Recipient</th>
                      <th>Requested By</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((req) => (
                      <tr key={req.id}>
                        <td><strong>{req.asset_tag}</strong> ({req.asset_name})</td>
                        <td>{req.from_holder}</td>
                        <td>{req.to_holder}</td>
                        <td>{req.requested_by_name}</td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'normal', fontSize: '0.85rem' }}>{req.reason}</td>
                        <td>
                          <span className={`status-pill ${
                            req.status === 'Approved' || req.status === 'Completed' ? 'status-pill--success' : 
                            req.status === 'Requested' ? 'status-pill--warning' : 'status-pill--danger'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="table-actions">
                          {req.status === 'Requested' ? (
                            isManager ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="action-button"
                                  style={{ background: '#2ecc71', margin: 0, padding: '4px 8px', fontSize: '0.75rem' }}
                                  onClick={() => handleProcessTransfer(req.id, 'approve')}
                                >
                                  Approve
                                </button>
                                <button
                                  className="action-button"
                                  style={{ background: '#e74c3c', margin: 0, padding: '4px 8px', fontSize: '0.75rem' }}
                                  onClick={() => {
                                    const rem = prompt("Enter rejection remarks:");
                                    if (rem !== null) handleProcessTransfer(req.id, 'reject');
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="muted" style={{ fontSize: '0.8rem' }}>Awaiting Manager</span>
                            )
                          ) : (
                            <span className="muted" style={{ fontSize: '0.8rem' }}>Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Return Asset Check-In Dialog Modal */}
      {showReturnModal && returningAlloc && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="screen-panel" style={{ width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3>Check-In Returned Asset</h3>
              <button style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setShowReturnModal(false)}>✕</button>
            </div>

            <p style={{ marginBottom: '14px', fontSize: '0.9rem' }}>
              Returning asset <strong>{returningAlloc.asset_tag}</strong> (held by {returningAlloc.employee_name || returningAlloc.department_name}).
            </p>

            <form onSubmit={handleReturnSubmit}>
              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="return-condition-select">Return Condition *</label>
                <select
                  id="return-condition-select"
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>

              <div className="form-row" style={{ marginBottom: '18px' }}>
                <label htmlFor="check-in-notes">Condition Notes / Check-In Remarks</label>
                <textarea
                  id="check-in-notes"
                  placeholder="Notes about scratches, physical state, repairs needed..."
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  style={{ width: '100%', minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={() => setShowReturnModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-button" style={{ background: '#27ae60' }}>
                  Verify & Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default AllocationTransfer;
