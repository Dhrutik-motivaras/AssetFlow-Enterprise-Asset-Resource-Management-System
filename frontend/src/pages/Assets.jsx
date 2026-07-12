import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

function Assets() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    department: '',
    location: '',
  });

  // Selected Asset state (Modal details)
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [historyTimeline, setHistoryTimeline] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Document Upload state
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Image');
  const [docFile, setDocFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Register Asset Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerErrors, setRegisterErrors] = useState({});
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: '',
    serial_number: '',
    acquisition_date: new Date().toISOString().split('T')[0],
    acquisition_cost: '0.00',
    warranty_expiry: '',
    department: '',
    location: '',
    condition: 'Excellent',
    is_bookable: false,
    remarks: '',
  });

  // Fetch initial data
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch assets when filters change
  useEffect(() => {
    fetchAssets();
  }, [filters]);

  const fetchMetadata = async () => {
    try {
      const [catRes, deptRes] = await Promise.all([
        api.get('assets/categories/'),
        api.get('organization/departments/'),
      ]);
      setCategories(catRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.department) params.department = filters.department;
      if (filters.location) params.location = filters.location;

      const res = await api.get('assets/', { params });
      setAssets(res.data);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDetails = async (asset) => {
    setSelectedAsset(asset);
    setHistoryTimeline([]);
    setLoadingHistory(true);
    setUploadError('');
    
    try {
      const [detailRes, histRes] = await Promise.all([
        api.get(`assets/${asset.id}/`),
        api.get(`assets/${asset.id}/history/`),
      ]);
      setSelectedAsset(detailRes.data);
      setHistoryTimeline(histRes.data);
    } catch (err) {
      console.error('Failed to load asset details/history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!docFile || !docTitle.trim()) {
      setUploadError('Title and file are required.');
      return;
    }

    setUploading(true);
    setUploadError('');
    
    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('title', docTitle.trim());
    formData.append('document_type', docType);

    try {
      const res = await api.post(`assets/${selectedAsset.id}/upload-document/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Update selected asset documents in UI
      setSelectedAsset((prev) => ({
        ...prev,
        documents: [res.data, ...(prev.documents || [])],
      }));
      setDocTitle('');
      setDocFile(null);
      // Reset input element
      const fileInput = document.getElementById('doc-file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterErrors({});

    // Client-side validations
    const errors = {};
    if (!newAsset.name.trim()) errors.name = 'Asset Name is required.';
    if (!newAsset.category) errors.category = 'Category is required.';
    if (!newAsset.location.trim()) errors.location = 'Location is required.';
    if (!newAsset.acquisition_date) errors.acquisition_date = 'Acquisition Date is required.';

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    try {
      const payload = { ...newAsset };
      if (!payload.department) delete payload.department;
      if (!payload.warranty_expiry) delete payload.warranty_expiry;

      await api.post('assets/', payload);
      setShowRegisterModal(false);
      
      // Reset form
      setNewAsset({
        name: '',
        category: '',
        serial_number: '',
        acquisition_date: new Date().toISOString().split('T')[0],
        acquisition_cost: '0.00',
        warranty_expiry: '',
        department: '',
        location: '',
        condition: 'Excellent',
        is_bookable: false,
        remarks: '',
      });
      
      fetchAssets();
    } catch (err) {
      if (err.response?.data) {
        setRegisterErrors(err.response.data);
      } else {
        setRegisterErrors({ server: 'Failed to register asset. Try again.' });
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Available':
        return 'status-pill--success';
      case 'Allocated':
        return 'status-pill--info';
      case 'Reserved':
        return 'status-pill--purple';
      case 'Under Maintenance':
        return 'status-pill--warning';
      case 'Lost':
      case 'Retired':
      case 'Disposed':
        return 'status-pill--danger';
      default:
        return '';
    }
  };

  return (
    <MainLayout
      title="Asset Directory"
      subtitle="Register new equipment and track details, location, and maintenance centrally."
      actions={
        <button className="action-button" onClick={() => setShowRegisterModal(true)}>
          + Register Asset
        </button>
      }
    >
      {/* Directory Filter controls */}
      <div className="screen-panel" style={{ marginBottom: '20px' }}>
        <div className="filter-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            style={{ flex: 2, minWidth: '200px' }}
            type="text"
            name="search"
            placeholder="Search by tag, name, serial, QR code..."
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select style={{ flex: 1, minWidth: '130px' }} name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select style={{ flex: 1, minWidth: '130px' }} name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
            <option value="Disposed">Disposed</option>
          </select>
          <select style={{ flex: 1, minWidth: '130px' }} name="department" value={filters.department} onChange={handleFilterChange}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <input
            style={{ flex: 1, minWidth: '130px' }}
            type="text"
            name="location"
            placeholder="Filter location..."
            value={filters.location}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Grid listing & details panel */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Table Section */}
        <div className="screen-panel" style={{ flex: 3, minWidth: '60%', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}><h3>Loading Asset Registry...</h3></div>
          ) : assets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
              <h3>No assets found. Try resetting filters.</h3>
            </div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => handleOpenDetails(asset)}
                    style={{
                      cursor: 'pointer',
                      background: selectedAsset?.id === asset.id ? '#1e2d2f' : '',
                    }}
                  >
                    <td><strong>{asset.asset_tag}</strong></td>
                    <td>{asset.name}</td>
                    <td>{asset.category_name}</td>
                    <td>{asset.location}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td>{asset.department_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Asset details Panel */}
        {selectedAsset && (
          <div className="screen-panel" style={{ flex: 2, minWidth: '350px', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Asset Details</h3>
              <button
                style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '18px' }}
                onClick={() => setSelectedAsset(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#182425', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedAsset.name}</span>
                <span className={`status-pill ${getStatusClass(selectedAsset.status)}`}>{selectedAsset.status}</span>
              </div>
              <span className="muted" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '12px' }}>
                Tag Code: {selectedAsset.asset_tag} | Serial: {selectedAsset.serial_number || 'N/A'}
              </span>

              {selectedAsset.current_allocation && (
                <div style={{ background: 'rgba(52, 152, 219, 0.15)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #3498db', fontSize: '0.85rem' }}>
                  <strong>Currently held by:</strong> {selectedAsset.current_allocation.holder_name}<br/>
                  {selectedAsset.current_allocation.expected_return_date && (
                    <span><strong>Return due:</strong> {selectedAsset.current_allocation.expected_return_date}</span>
                  )}
                </div>
              )}
            </div>

            {/* Sub-tabs / info groups */}
            <div style={{ fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div>
                <span className="muted">Category:</span>
                <div>{selectedAsset.category_name}</div>
              </div>
              <div>
                <span className="muted">Condition:</span>
                <div>{selectedAsset.condition}</div>
              </div>
              <div>
                <span className="muted">Cost:</span>
                <div>${selectedAsset.acquisition_cost}</div>
              </div>
              <div>
                <span className="muted">Acquisition Date:</span>
                <div>{selectedAsset.acquisition_date}</div>
              </div>
              <div>
                <span className="muted">Location:</span>
                <div>{selectedAsset.location}</div>
              </div>
              <div>
                <span className="muted">QR Target:</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedAsset.qr_code || '-'}</div>
              </div>
            </div>

            {selectedAsset.remarks && (
              <div style={{ marginBottom: '16px' }}>
                <span className="muted">Remarks:</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#ddd' }}>{selectedAsset.remarks}</p>
              </div>
            )}

            {/* History timeline */}
            <div style={{ borderTop: '1px solid #2e4446', paddingTop: '16px', marginBottom: '16px' }}>
              <h4>Timeline / Activity Logs</h4>
              {loadingHistory ? (
                <div className="muted" style={{ padding: '10px 0' }}>Loading history...</div>
              ) : historyTimeline.length === 0 ? (
                <div className="muted" style={{ padding: '10px 0', fontSize: '0.85rem' }}>No events recorded for this asset.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', maxH: '200px', overflowY: 'auto' }}>
                  {historyTimeline.map((h, i) => (
                    <div key={i} style={{ borderLeft: '2px solid #2ecc71', paddingLeft: '10px', fontSize: '0.8rem' }}>
                      <div className="muted">{new Date(h.date).toLocaleDateString()} — {h.type}</div>
                      <div>{h.detail}</div>
                      {h.notes && <div style={{ fontStyle: 'italic', color: '#bbb' }}>"{h.notes}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document attachments list */}
            <div style={{ borderTop: '1px solid #2e4446', paddingTop: '16px' }}>
              <h4>Photos & Documents</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0' }}>
                {(!selectedAsset.documents || selectedAsset.documents.length === 0) ? (
                  <div className="muted" style={{ fontSize: '0.85rem' }}>No files attached.</div>
                ) : (
                  selectedAsset.documents.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#121d1e', padding: '6px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      <span><strong>{doc.title}</strong> ({doc.document_type})</span>
                      <a href={doc.file_url || doc.file} target="_blank" rel="noopener noreferrer" style={{ color: '#2ecc71', textDecoration: 'none' }}>Download</a>
                    </div>
                  ))
                )}
              </div>

              {/* Upload Document Form */}
              <form onSubmit={handleDocumentUpload} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#142021', padding: '10px', borderRadius: '6px' }}>
                <input
                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                  type="text"
                  placeholder="Document Title (e.g. Invoice)"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    style={{ padding: '4px 8px', fontSize: '0.8rem', flex: 1 }}
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="Image">Image</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Warranty">Warranty</option>
                    <option value="Manual">Manual</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    id="doc-file-input"
                    type="file"
                    style={{ fontSize: '0.8rem', flex: 2 }}
                    onChange={(e) => setDocFile(e.target.files[0])}
                  />
                </div>
                {uploadError && <span className="error-text" style={{ fontSize: '0.75rem' }}>{uploadError}</span>}
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    padding: '6px',
                    background: '#2ecc71',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Attach Document'}
                </button>
              </form>
            </div>

          </div>
        )}
      </div>

      {/* Register Asset Dialog Modal */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="screen-panel" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3>Register New Asset</h3>
              <button style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setShowRegisterModal(false)}>✕</button>
            </div>

            {registerErrors.server && <p className="error-text" style={{ textAlign: 'center' }}>{registerErrors.server}</p>}

            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-row" style={{ display: 'flex', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label htmlFor="asset-name">Asset Name *</label>
                  <input
                    id="asset-name"
                    type="text"
                    placeholder="e.g. Dell Monitor 24\"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset((p) => ({ ...p, name: e.target.value }))}
                  />
                  {registerErrors.name && <span className="error-text" style={{ fontSize: '0.8rem' }}>{registerErrors.name}</span>}
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label htmlFor="asset-category">Category *</label>
                  <select
                    id="asset-category"
                    value={newAsset.category}
                    onChange={(e) => setNewAsset((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {registerErrors.category && <span className="error-text" style={{ fontSize: '0.8rem' }}>{registerErrors.category}</span>}
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label htmlFor="asset-serial">Serial Number</label>
                  <input
                    id="asset-serial"
                    type="text"
                    placeholder="Unique factory number"
                    value={newAsset.serial_number}
                    onChange={(e) => setNewAsset((p) => ({ ...p, serial_number: e.target.value }))}
                  />
                  {registerErrors.serial_number && <span className="error-text" style={{ fontSize: '0.8rem' }}>{registerErrors.serial_number}</span>}
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label htmlFor="asset-location">Location *</label>
                  <input
                    id="asset-location"
                    type="text"
                    placeholder="e.g. Bangalore HQ Floor 2"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset((p) => ({ ...p, location: e.target.value }))}
                  />
                  {registerErrors.location && <span className="error-text" style={{ fontSize: '0.8rem' }}>{registerErrors.location}</span>}
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label htmlFor="asset-acq-date">Acquisition Date *</label>
                  <input
                    id="asset-acq-date"
                    type="date"
                    value={newAsset.acquisition_date}
                    onChange={(e) => setNewAsset((p) => ({ ...p, acquisition_date: e.target.value }))}
                  />
                  {registerErrors.acquisition_date && <span className="error-text" style={{ fontSize: '0.8rem' }}>{registerErrors.acquisition_date}</span>}
                </div>

                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label htmlFor="asset-acq-cost">Cost ($)</label>
                  <input
                    id="asset-acq-cost"
                    type="number"
                    step="0.01"
                    value={newAsset.acquisition_cost}
                    onChange={(e) => setNewAsset((p) => ({ ...p, acquisition_cost: e.target.value }))}
                  />
                </div>

                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label htmlFor="asset-warranty">Warranty Expiry</label>
                  <input
                    id="asset-warranty"
                    type="date"
                    value={newAsset.warranty_expiry}
                    onChange={(e) => setNewAsset((p) => ({ ...p, warranty_expiry: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label htmlFor="asset-condition">Condition</label>
                  <select
                    id="asset-condition"
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset((p) => ({ ...p, condition: e.target.value }))}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label htmlFor="asset-dept">Initial Dept (optional)</label>
                  <select
                    id="asset-dept"
                    value={newAsset.department}
                    onChange={(e) => setNewAsset((p) => ({ ...p, department: e.target.value }))}
                  >
                    <option value="">No Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id="asset-bookable"
                  type="checkbox"
                  checked={newAsset.is_bookable}
                  onChange={(e) => setNewAsset((p) => ({ ...p, is_bookable: e.target.checked }))}
                />
                <label htmlFor="asset-bookable" style={{ margin: 0, cursor: 'pointer' }}>
                  Available as shared/bookable resource
                </label>
              </div>

              <div className="form-row" style={{ marginBottom: '18px' }}>
                <label htmlFor="asset-remarks">Remarks</label>
                <textarea
                  id="asset-remarks"
                  placeholder="Additional observations..."
                  value={newAsset.remarks}
                  onChange={(e) => setNewAsset((p) => ({ ...p, remarks: e.target.value }))}
                  style={{ width: '100%', minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="secondary-button" style={{ margin: 0 }} onClick={() => setShowRegisterModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-button">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Assets;
