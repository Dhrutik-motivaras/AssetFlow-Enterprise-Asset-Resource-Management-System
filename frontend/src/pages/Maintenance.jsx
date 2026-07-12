import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

function Maintenance() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & detail drawer
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form states
  const [newRequest, setNewRequest] = useState({
    asset: '',
    issue_title: '',
    issue_description: '',
    priority: 'Medium',
    estimated_cost: '0.00',
  });
  const [fileAttachment, setFileAttachment] = useState(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [actualCost, setActualCost] = useState('0.00');

  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const isManager = user?.role === 'Admin' || user?.role === 'Asset Manager';

  const fetchRequestsAndAssets = async () => {
    setLoading(true);
    try {
      const [reqRes, assetRes] = await Promise.all([
        api.get('maintenance/requests/'),
        api.get('assets/'),
      ]);
      setRequests(reqRes.data);
      // Filter out assets that are retired or disposed for raising requests
      setAssets(assetRes.data.filter((a) => !['Retired', 'Disposed'].includes(a.status)));
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsAndAssets();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    if (!newRequest.asset || !newRequest.issue_title || !newRequest.issue_description) {
      setFormErrors({ server: 'Asset, Title, and Description are required.' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('asset', newRequest.asset);
      formData.append('issue_title', newRequest.issue_title);
      formData.append('issue_description', newRequest.issue_description);
      formData.append('priority', newRequest.priority);
      formData.append('estimated_cost', newRequest.estimated_cost);
      if (fileAttachment) {
        formData.append('attachment', fileAttachment);
      }

      await api.post('maintenance/requests/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMsg('Maintenance request raised successfully!');
      setShowCreateModal(false);
      setNewRequest({ asset: '', issue_title: '', issue_description: '', priority: 'Medium', estimated_cost: '0.00' });
      setFileAttachment(null);
      fetchRequestsAndAssets();
    } catch (err) {
      setFormErrors(err.response?.data || { server: 'Failed to submit maintenance request.' });
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`maintenance/requests/${id}/approve/`);
      setSuccessMsg('Request approved. Asset is now marked as Under Maintenance.');
      setSelectedRequest(null);
      fetchRequestsAndAssets();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to approve request.');
    }
  };

  const handleReject = async (id) => {
    const remarks = prompt('Enter rejection remarks:');
    if (remarks === null) return;
    try {
      await api.post(`maintenance/requests/${id}/reject/`, { remarks });
      setSuccessMsg('Request rejected.');
      setSelectedRequest(null);
      fetchRequestsAndAssets();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject request.');
    }
  };

  const handleAssignTechnician = async (e, id) => {
    e.preventDefault();
    if (!technicianName) return;
    try {
      await api.post(`maintenance/requests/${id}/assign-technician/`, { technician_name: technicianName });
      setSuccessMsg(`Assigned technician: ${technicianName}`);
      setTechnicianName('');
      setSelectedRequest(null);
      fetchRequestsAndAssets();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign technician.');
    }
  };

  const handleStartWork = async (id) => {
    try {
      await api.post(`maintenance/requests/${id}/start-progress/`);
      setSuccessMsg('Work status set to In Progress.');
      setSelectedRequest(null);
      fetchRequestsAndAssets();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start progress.');
    }
  };

  const handleResolve = async (e, id) => {
    e.preventDefault();
    try {
      await api.post(`maintenance/requests/${id}/resolve/`, {
        actual_cost: actualCost,
        remarks: actionRemarks,
      });
      setSuccessMsg('Maintenance resolved. Asset set back to Available.');
      setActualCost('0.00');
      setActionRemarks('');
      setSelectedRequest(null);
      fetchRequestsAndAssets();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to resolve request.');
    }
  };

  // Columns helper
  const columns = [
    { title: 'Pending', status: 'Pending', class: 'status-pill--warning' },
    { title: 'Approved', status: 'Approved', class: 'status-pill--info' },
    { title: 'Technician Assigned', status: 'Technician Assigned', class: 'status-pill--primary' },
    { title: 'In Progress', status: 'In Progress', class: 'status-pill--purple' },
    { title: 'Resolved', status: 'Resolved', class: 'status-pill--success' },
    { title: 'Rejected', status: 'Rejected', class: 'status-pill--danger' },
  ];

  return (
    <MainLayout
      title="Maintenance Requests"
      subtitle="Manage repairs, track costs, and assign work orders in a responsive kanban lifecycle board."
      actions={
        <button className="action-button" onClick={() => setShowCreateModal(true)}>
          + Raise Request
        </button>
      }
    >
      {successMsg && (
        <div style={{ background: 'rgba(46, 204, 113, 0.2)', borderLeft: '4px solid #2ecc71', color: '#fff', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><h3>Loading Maintenance Board...</h3></div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* Kanban Board Grid */}
          <div className="board-grid" style={{ flex: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', width: '100%' }}>
            {columns.map((col) => {
              const colRequests = requests.filter((r) => r.status === col.status);
              return (
                <div key={col.status} className="board-column" style={{ background: '#0e1b1c', borderRadius: '12px', padding: '14px', minHeight: '400px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #1a2f31', paddingBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{col.title}</h4>
                    <span className="muted" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{colRequests.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {colRequests.length === 0 ? (
                      <div className="muted" style={{ textAlign: 'center', fontSize: '0.8rem', padding: '20px 0' }}>No requests</div>
                    ) : (
                      colRequests.map((req) => (
                        <div
                          key={req.id}
                          className="board-card"
                          onClick={() => setSelectedRequest(req)}
                          style={{
                            background: selectedRequest?.id === req.id ? '#1e2d2f' : '#142526',
                            border: selectedRequest?.id === req.id ? '1px solid #0d9488' : '1px solid #1c3234',
                            borderRadius: '8px',
                            padding: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{req.asset_tag}</strong>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: req.priority === 'Critical' || req.priority === 'High' ? '#ff7675' : '#ffeaa7' }}>
                              {req.priority}
                            </span>
                          </div>
                          <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.issue_title}
                          </p>
                          <div className="muted" style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>By: {req.raised_by_name?.split(' ')[0] || 'User'}</span>
                            <span>Est: ${req.estimated_cost}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Request Detail Panel */}
          {selectedRequest && (
            <div className="screen-panel" style={{ flex: 1.2, minWidth: '320px', position: 'sticky', top: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0 }}>Request Details</h3>
                <button
                  style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '18px' }}
                  onClick={() => setSelectedRequest(null)}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: '#182425', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0' }}>{selectedRequest.issue_title}</h4>
                <p style={{ fontSize: '0.85rem', margin: '0 0 10px 0', color: '#ddd' }}>{selectedRequest.issue_description}</p>
                <div style={{ fontSize: '0.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><span className="muted">Asset:</span> <div>{selectedRequest.asset_name} ({selectedRequest.asset_tag})</div></div>
                  <div><span className="muted">Priority:</span> <div>{selectedRequest.priority}</div></div>
                  <div><span className="muted">Status:</span> <div>{selectedRequest.status}</div></div>
                  <div><span className="muted">Raised By:</span> <div>{selectedRequest.raised_by_name}</div></div>
                  {selectedRequest.technician_name && (
                    <div><span className="muted">Technician:</span> <div>{selectedRequest.technician_name}</div></div>
                  )}
                  {selectedRequest.estimated_cost && (
                    <div><span className="muted">Estimated Cost:</span> <div>${selectedRequest.estimated_cost}</div></div>
                  )}
                  {parseFloat(selectedRequest.actual_cost) > 0 && (
                    <div><span className="muted">Actual Cost:</span> <div>${selectedRequest.actual_cost}</div></div>
                  )}
                </div>

                {selectedRequest.remarks && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #2e4446' }}>
                    <span className="muted">Remarks:</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#ccc' }}>{selectedRequest.remarks}</p>
                  </div>
                )}
              </div>

              {/* Action Forms based on Status & Role */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* 1. Pending -> Approved / Rejected */}
                {selectedRequest.status === 'Pending' && isManager && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ flex: 1, padding: '8px', background: '#2ecc71', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleApprove(selectedRequest.id)}>
                      Approve
                    </button>
                    <button style={{ flex: 1, padding: '8px', background: '#e74c3c', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleReject(selectedRequest.id)}>
                      Reject
                    </button>
                  </div>
                )}

                {/* 2. Approved -> Technician Assigned */}
                {selectedRequest.status === 'Approved' && (
                  <form onSubmit={(e) => handleAssignTechnician(e, selectedRequest.id)}>
                    <label htmlFor="tech-input" className="muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Assign Technician</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        id="tech-input"
                        type="text"
                        placeholder="Technician Name"
                        value={technicianName}
                        onChange={(e) => setTechnicianName(e.target.value)}
                        required
                        style={{ flex: 1, padding: '8px' }}
                      />
                      <button type="submit" style={{ padding: '8px 12px', background: '#0d9488', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                        Assign
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. Assigned -> In Progress */}
                {selectedRequest.status === 'Technician Assigned' && (
                  <button style={{ padding: '10px', background: '#9b59b6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleStartWork(selectedRequest.id)}>
                    Start Work / Mark In Progress
                  </button>
                )}

                {/* 4. In Progress -> Resolved */}
                {selectedRequest.status === 'In Progress' && (
                  <form onSubmit={(e) => handleResolve(e, selectedRequest.id)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label htmlFor="cost-input" className="muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Actual Cost ($)</label>
                      <input
                        id="cost-input"
                        type="number"
                        step="0.01"
                        value={actualCost}
                        onChange={(e) => setActualCost(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="res-remarks" className="muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Resolution Remarks</label>
                      <textarea
                        id="res-remarks"
                        placeholder="Describe resolution details..."
                        value={actionRemarks}
                        onChange={(e) => setActionRemarks(e.target.value)}
                        style={{ width: '100%', padding: '8px', minHeight: '60px' }}
                      />
                    </div>
                    <button type="submit" style={{ padding: '10px', background: '#2ecc71', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                      Mark Resolved
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Maintenance Request Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="screen-panel" style={{ width: '90%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3>Raise Maintenance Request</h3>
              <button style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            {formErrors.server && <p className="error-text">{formErrors.server}</p>}

            <form onSubmit={handleCreateSubmit}>
              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="req-asset">Asset *</label>
                <select
                  id="req-asset"
                  value={newRequest.asset}
                  onChange={(e) => setNewRequest({ ...newRequest, asset: e.target.value })}
                  style={{ width: '100%' }}
                  required
                >
                  <option value="">Select Asset</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.asset_tag})</option>
                  ))}
                </select>
              </div>

              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="req-title">Issue Title *</label>
                <input
                  id="req-title"
                  type="text"
                  placeholder="e.g. Screen flickering"
                  value={newRequest.issue_title}
                  onChange={(e) => setNewRequest({ ...newRequest, issue_title: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div className="form-row" style={{ marginBottom: '14px' }}>
                <label htmlFor="req-desc">Issue Description *</label>
                <textarea
                  id="req-desc"
                  placeholder="Detail the failure or inspection needs..."
                  value={newRequest.issue_description}
                  onChange={(e) => setNewRequest({ ...newRequest, issue_description: e.target.value })}
                  style={{ width: '100%', minHeight: '80px' }}
                  required
                />
              </div>

              <div className="form-row" style={{ marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label htmlFor="req-priority">Priority</label>
                  <select
                    id="req-priority"
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="req-cost">Est. Cost ($)</label>
                  <input
                    id="req-cost"
                    type="number"
                    step="0.01"
                    value={newRequest.estimated_cost}
                    onChange={(e) => setNewRequest({ ...newRequest, estimated_cost: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '20px' }}>
                <label htmlFor="req-file">Attachment (Photo/Document)</label>
                <input
                  id="req-file"
                  type="file"
                  onChange={(e) => setFileAttachment(e.target.files[0])}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-button">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Maintenance;
