import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { DUMMY_MEDICATIONS } from '../data/dummyMedications';

function getPriority(m) {
  if (m.status === 'Out of Stock' || m.status === 'Expiring Soon') return 'High';
  if (m.status === 'Low Stock' || m.risk === 'Medium') return 'Mid';
  return 'Low';
}

export const Dashboard = () => {
  const [search, setSearch] = useState('');
  const actionItems = useMemo(() => DUMMY_MEDICATIONS.slice(0, 8), []);

  const expiring = DUMMY_MEDICATIONS.filter((m) => m.status === 'Expiring Soon').length;
  const expired = 0;
  const highRisk = DUMMY_MEDICATIONS.filter((m) => m.risk === 'Medium').length;
  const lowStock = DUMMY_MEDICATIONS.filter((m) => m.status === 'Low Stock' || m.status === 'Out of Stock').length;

  const filtered = search.trim()
    ? actionItems.filter((m) =>
        m.medicationName.toLowerCase().includes(search.toLowerCase()) ||
        m.sku.includes(search)
      )
    : actionItems;

  return (
    <DashboardLayout>
      <div className="dash">
        <h1 className="dash-title">Dashboard</h1>

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
                {filtered.map((m) => (
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
                      <span className={`dash-priority dash-priority-${getPriority(m).toLowerCase()}`}>
                        {getPriority(m)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
