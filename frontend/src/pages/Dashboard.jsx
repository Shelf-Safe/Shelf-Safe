import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { medicationService } from '../services/medicationService';

function getPriority(m) {
  if (m.status === 'Out of Stock' || m.status === 'Expiring Soon') return 'High';
  if (m.status === 'Low Stock' || m.risk === 'Medium') return 'Mid';
  return 'Low';
}

function mapMedication(m) {
  const id = m._id ? String(m._id) : m.id;
  const expiryDate = m.expiryDate ? new Date(m.expiryDate) : null;
  const expiryMonth = m.expiryMonth || (expiryDate ? expiryDate.toLocaleString('default', { month: 'short' }) : '');
  const expiryYear = m.expiryYear || (expiryDate ? expiryDate.getFullYear() : '');
  return {
    id,
    medicationName: m.medicationName || '',
    sku: m.sku || m.barcodeData || '',
    batchLotNumber: m.batchLotNumber || '',
    expiryMonth,
    expiryYear,
    currentStock: m.currentStock ?? 0,
    status: m.status || 'In Stock',
    risk: m.risk || 'Low',
  };
}

export const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ expiring: 0, expired: 0, highRisk: 0, lowStock: 0 });
  const [actionItems, setActionItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    medicationService
      .getAll({ limit: 100 })
      .then((res) => {
        if (cancelled || !res.success) return;
        const list = res.data || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysOut = new Date(today);
        thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

        const expiring = list.filter(
          (m) => m.expiryDate && new Date(m.expiryDate) <= thirtyDaysOut && new Date(m.expiryDate) >= today
        ).length;
        const expired = list.filter(
          (m) => m.expiryDate && new Date(m.expiryDate) < today
        ).length;
        const highRisk = list.filter(
          (m) => m.risk === 'Medium' || m.risk === 'High' || m.risk === 'Critical'
        ).length;
        const lowStock = list.filter(
          (m) => m.status === 'Low Stock' || m.status === 'Out of Stock'
        ).length;

        const withPriority = list.map((m) => {
          let p = 0;
          if (m.status === 'Out of Stock' || m.status === 'Expiring Soon') p = 3;
          else if (m.status === 'Low Stock' || m.risk === 'Medium') p = 2;
          else p = 1;
          return { m, p };
        });
        const sorted = withPriority.sort((a, b) => b.p - a.p).slice(0, 20);

        setStats({ expiring, expired, highRisk, lowStock });
        setActionItems(sorted.map(({ m }) => mapMedication(m)));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = search.trim()
    ? actionItems.filter((m) =>
        m.medicationName.toLowerCase().includes(search.toLowerCase()) ||
        (m.sku && m.sku.includes(search))
      )
    : actionItems;

  const { expiring, expired, highRisk, lowStock } = stats;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dash">
          <p className="dash-loading">Loading dashboard…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="dash">
          <p className="dash-error">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dash">
        <div className="dash-header">
          <h1 className="dash-title">Dashboard</h1>
          <div className="dash-header-actions">
            <div className="dash-header-buttons">
              <Link to="/inventory/add" className="btn btn-outline">Add Medication</Link>
              <button type="button" className="btn btn-primary">Sync Inventory</button>
            </div>
            <div className="dash-header-sync">
              <span className="dash-header-sync-label">Last Sync</span>
              <span className="dash-header-sync-time">29 Jan 2026 - 8:45 am</span>
            </div>
            <select className="dash-header-date" aria-label="Date range">
              <option>Today</option>
            </select>
          </div>
        </div>

        <div className="dash-cards">
          <div className="dash-card">
            <div className="dash-card-label">Expiring Medications</div>
            <div className="dash-card-num">{expiring}</div>
          </div>
          <div className="dash-card">
            <div className="dash-card-label">Expired Medications</div>
            <div className="dash-card-num">{expired}</div>
          </div>
          <div className="dash-card">
            <div className="dash-card-label">High-Risk Medications</div>
            <div className="dash-card-num">{highRisk}</div>
          </div>
          <div className="dash-card">
            <div className="dash-card-label">Low Stock Items</div>
            <div className="dash-card-num">{lowStock}</div>
          </div>
        </div>

        <div className="dash-charts">
          <div className="dash-chart-box">
            <h2 className="dash-chart-title">Inventory Health Score</h2>
            <div className="dash-chart-placeholder">
              <span className="dash-chart-center">Overall 70</span>
              <div className="dash-chart-legend">
                <span>Not expiring soon (120+ days) 10,000</span>
                <span>Attention needed (90 days) 1100</span>
                <span>Critical (60 days) 300</span>
              </div>
            </div>
          </div>
          <div className="dash-chart-box">
            <h2 className="dash-chart-title">Expiry Risk Distribution</h2>
            <div className="dash-chart-placeholder">
              <span>Bar chart placeholder</span>
              <div className="dash-chart-legend">Expired, 30, 60, 90, 120, 120+ days</div>
            </div>
          </div>
        </div>

        <div className="dash-action">
          <div className="dash-action-head">
            <h2 className="dash-action-title">Action Required</h2>
            <input
              type="text"
              className="dash-search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search medications"
            />
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Medication Name</th>
                  <th>SKU / Barcode</th>
                  <th>Batch / Lot Number</th>
                  <th>Expiry Date</th>
                  <th>Current Stock</th>
                  <th>Action</th>
                  <th>Priority / Urgency</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const priority = getPriority(m).toLowerCase();
                  return (
                  <tr key={m.id}>
                    <td>{m.medicationName}</td>
                    <td>{m.sku}</td>
                    <td>{m.batchLotNumber}</td>
                    <td>{m.expiryMonth} {m.expiryYear}</td>
                    <td>{m.currentStock}</td>
                    <td>
                      <Link to={`/inventory/${m.id}/edit`} className="dash-act-link">Edit</Link>
                      {' | '}
                      <Link to={`/inventory/${m.id}`} className="dash-act-link">View</Link>
                    </td>
                    <td>
                      <span className={`dash-priority dash-priority-${priority}`}>
                        {getPriority(m)}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
