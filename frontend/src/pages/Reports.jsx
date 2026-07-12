import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import api from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Screens.css';

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const res = await api.get('assets/reports-data/');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ASSETFLOW ANALYTICS REPORT\n\n';
    
    // Overview
    csvContent += 'OVERVIEW\n';
    csvContent += `Total Assets,${data.total_assets}\n`;
    csvContent += `Utilization Rate,${data.utilization_rate}%\n\n`;

    // Status
    csvContent += 'ASSET STATUS DISTRIBUTION\nStatus,Count\n';
    data.status_distribution.forEach((s) => {
      csvContent += `${s.status},${s.count}\n`;
    });
    csvContent += '\n';

    // Maintenance by Category
    csvContent += 'MAINTENANCE BY CATEGORY\nCategory,Requests Count,Total Cost ($)\n';
    data.maintenance_by_category.forEach((c) => {
      csvContent += `"${c.category_name}",${c.requests_count},${c.total_cost}\n`;
    });
    csvContent += '\n';

    // Nearing Retirement
    csvContent += 'ASSETS NEARING RETIREMENT / DUE FOR MAINTENANCE\nTag,Name,Acquisition Date,Condition,Status\n';
    data.nearing_retirement.forEach((a) => {
      csvContent += `${a.asset_tag},"${a.name}",${a.acquisition_date},${a.condition},${a.status}\n`;
    });
    csvContent += '\n';

    // Bookings Heatmap
    csvContent += 'RESOURCE BOOKING HEATMAP\nTime Window,Bookings Count\n';
    data.booking_heatmap.forEach((h) => {
      csvContent += `"${h.time_window}",${h.bookings_count}\n`;
    });
    csvContent += '\n';

    // Most Used
    csvContent += 'MOST USED ASSETS\nTag,Name,Usage Count (Allocations + Bookings)\n';
    data.most_used_assets.forEach((a) => {
      csvContent += `${a.asset_tag},"${a.name}",${a.usage_count}\n`;
    });
    csvContent += '\n';

    // Idle
    csvContent += 'IDLE ASSETS (0 Usage recorded)\nTag,Name\n';
    data.idle_assets.forEach((a) => {
      csvContent += `${a.asset_tag},"${a.name}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'AssetFlow_Analytics_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout
      title="Reports & Analytics"
      subtitle="Gain actionable insight into utilization, bookings, category maintenance, and retirement forecasting."
      actions={
        <button className="action-button" onClick={handleExportCSV} disabled={!data}>
          📥 Export CSV Report
        </button>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><h3>Gathering analytical insights...</h3></div>
      ) : !data ? (
        <div style={{ textAlign: 'center', padding: '40px' }} className="muted"><h3>Failed to load analytics.</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* KPI row */}
          <section className="dashboard-grid dashboard-grid--kpi">
            <div className="dashboard-card dashboard-card--primary">
              <div className="dashboard-card__top">
                <div className="dashboard-card__icon">📦</div>
                <div>
                  <p className="dashboard-card__title">Total Registered Assets</p>
                  <h3 className="dashboard-card__value">{data.total_assets}</h3>
                </div>
              </div>
            </div>

            <div className="dashboard-card dashboard-card--success">
              <div className="dashboard-card__top">
                <div className="dashboard-card__icon">📊</div>
                <div>
                  <p className="dashboard-card__title">Asset Utilization Rate</p>
                  <h3 className="dashboard-card__value">{data.utilization_rate}%</h3>
                </div>
              </div>
            </div>
          </section>

          {/* Core distribution maps */}
          <section className="dashboard-grid dashboard-grid--tables">
            
            {/* Status Distribution */}
            <div className="screen-panel" style={{ flex: 1 }}>
              <h3>Asset Status Distribution</h3>
              <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '14px' }}>Overview of active asset statuses.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.status_distribution.length === 0 ? (
                  <p className="muted">No assets registered.</p>
                ) : (
                  data.status_distribution.map((s) => {
                    const percentage = data.total_assets > 0 ? (s.count / data.total_assets) * 100 : 0;
                    return (
                      <div key={s.status}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                          <span>{s.status}</span>
                          <strong>{s.count} ({Math.round(percentage)}%)</strong>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#1c3234', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: s.status === 'Available' ? '#2ecc71' : s.status === 'Allocated' ? '#3498db' : '#f1c40f', borderRadius: '4px' }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Booking Heatmap */}
            <div className="screen-panel" style={{ flex: 1 }}>
              <h3>Resource Booking Heatmap</h3>
              <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '14px' }}>Peak usage window distribution for bookable resources.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.booking_heatmap.map((h) => {
                  const maxVal = Math.max(...data.booking_heatmap.map((item) => item.bookings_count), 1);
                  const percentage = (h.bookings_count / maxVal) * 100;
                  return (
                    <div key={h.time_window}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                        <span>{h.time_window}</span>
                        <strong>{h.bookings_count} bookings</strong>
                      </div>
                      <div style={{ width: '100%', height: '12px', background: '#1c3234', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #9b59b6, #e74c3c)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Dynamic details lists */}
          <section className="dashboard-grid dashboard-grid--tables">
            
            {/* Most Used vs Idle */}
            <div className="screen-panel" style={{ flex: 1 }}>
              <h3>Asset Utilization Rankings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginTop: '14px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2ecc71' }}>🔥 Most Used Assets</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.most_used_assets.length === 0 ? (
                      <li className="muted">No allocation history yet.</li>
                    ) : (
                      data.most_used_assets.map((a) => (
                        <li key={a.asset_tag} style={{ background: '#142526', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{a.name} (<strong>{a.asset_tag}</strong>)</span>
                          <strong className="muted">{a.usage_count} uses</strong>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#e74c3c' }}>❄️ Idle Assets (0 Usage)</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.idle_assets.length === 0 ? (
                      <li className="muted">All assets have been allocated or booked.</li>
                    ) : (
                      data.idle_assets.map((a) => (
                        <li key={a.asset_tag} style={{ background: '#142526', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{a.name} (<strong>{a.asset_tag}</strong>)</span>
                          <span style={{ color: '#ff7675', fontSize: '0.75rem', fontWeight: 'bold' }}>Idle</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Maintenance by Category summary */}
            <div className="screen-panel" style={{ flex: 1, overflowX: 'auto' }}>
              <h3>Maintenance by Category</h3>
              <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '14px' }}>Aggregate repair requests and costs.</p>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Tickets</th>
                    <th>Actual Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.maintenance_by_category.length === 0 ? (
                    <tr><td colSpan="3" style={{ textAlign: 'center', color: '#888' }}>No maintenance data.</td></tr>
                  ) : (
                    data.maintenance_by_category.map((c) => (
                      <tr key={c.category_name}>
                        <td><strong>{c.category_name}</strong></td>
                        <td>{c.requests_count} tickets</td>
                        <td>${c.total_cost.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Nearing retirement or due for maintenance */}
          <div className="screen-panel" style={{ overflowX: 'auto' }}>
            <h3>Assets Due for Maintenance / Nearing Retirement</h3>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '14px' }}>
              Assets over 3 years old or flagged with "Poor"/"Damaged" condition requiring manager review.
            </p>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Asset Name</th>
                  <th>Acquisition Date</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.nearing_retirement.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>No assets flagged for retirement or maintenance.</td></tr>
                ) : (
                  data.nearing_retirement.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.asset_tag}</strong></td>
                      <td>{a.name}</td>
                      <td>{a.acquisition_date}</td>
                      <td>
                        <span style={{ fontWeight: 'bold', color: ['Poor', 'Damaged'].includes(a.condition) ? '#ff7675' : '#ffeaa7' }}>
                          {a.condition}
                        </span>
                      </td>
                      <td>{a.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Reports;
