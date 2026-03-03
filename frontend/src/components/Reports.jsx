import React, { useState } from 'react';

export const Reports = () => {
  const [reportType, setReportType] = useState('inventory');

  const reportTypes = [
    { id: 'inventory', label: 'Inventory Report', icon: '📦' },
    { id: 'expiry', label: 'Expiry Report', icon: '⏰' },
    { id: 'usage', label: 'Usage Trends', icon: '📈' },
    { id: 'compliance', label: 'Compliance & Safety', icon: '✓' },
  ];

  const inventoryReport = {
    totalMedications: 3,
    inStock: 85,
    lowStock: 5,
    outOfStock: 10,
  };

  const expiryReport = [
    { medication: 'Ibuprofen 200mg', expiry: '2025-03-31', daysLeft: 30, status: 'expiring-soon' },
    { medication: 'Paracetamol 1000mg', expiry: '2025-06-30', daysLeft: 120, status: 'ok' },
  ];

  const usageReport = [
    { date: '2025-02-01', medications: 15, trend: '+5%' },
    { date: '2025-02-02', medications: 18, trend: '+20%' },
    { date: '2025-02-03', medications: 22, trend: '+22%' },
  ];

  return (
    <div className="dashboard-section">
      <h2>Reports & Analytics</h2>

      <div className="report-tabs">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            className={`report-tab ${reportType === type.id ? 'active' : ''}`}
            onClick={() => setReportType(type.id)}
          >
            <span className="report-icon">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      <div className="report-content">
        {reportType === 'inventory' && (
          <div className="report-grid">
            <div className="report-card">
              <h3>Total Medications</h3>
              <p className="report-number">{inventoryReport.totalMedications}</p>
            </div>
            <div className="report-card">
              <h3>In Stock</h3>
              <p className="report-number success">{inventoryReport.inStock}%</p>
            </div>
            <div className="report-card">
              <h3>Low Stock</h3>
              <p className="report-number warning">{inventoryReport.lowStock}%</p>
            </div>
            <div className="report-card">
              <h3>Out of Stock</h3>
              <p className="report-number danger">{inventoryReport.outOfStock}%</p>
            </div>
          </div>
        )}

        {reportType === 'expiry' && (
          <div className="report-table">
            <h3>Medications Expiring Soon</h3>
            <div className="table-header">
              <div className="col-name">Medication</div>
              <div className="col-date">Expiry Date</div>
              <div className="col-days">Days Left</div>
              <div className="col-status">Status</div>
            </div>
            {expiryReport.map((item, index) => (
              <div key={index} className="table-row">
                <div className="col-name">{item.medication}</div>
                <div className="col-date">{item.expiry}</div>
                <div className="col-days">{item.daysLeft}</div>
                <div className="col-status">
                  <span className={`status-badge status-${item.status}`}>
                    {item.status === 'expiring-soon' ? 'Expiring Soon' : 'OK'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {reportType === 'usage' && (
          <div className="report-table">
            <h3>Usage Trends</h3>
            <div className="table-header">
              <div className="col-date">Date</div>
              <div className="col-meds">Medications Used</div>
              <div className="col-trend">Trend</div>
            </div>
            {usageReport.map((item, index) => (
              <div key={index} className="table-row">
                <div className="col-date">{item.date}</div>
                <div className="col-meds">{item.medications}</div>
                <div className="col-trend">
                  <span className="trend-up">{item.trend}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {reportType === 'compliance' && (
          <div className="compliance-report">
            <h3>Compliance & Safety Status</h3>
            <div className="compliance-items">
              <div className="compliance-item">
                <span className="compliance-check">✓</span>
                <p>All medications properly stored</p>
              </div>
              <div className="compliance-item">
                <span className="compliance-check">✓</span>
                <p>Expiry dates monitored</p>
              </div>
              <div className="compliance-item">
                <span className="compliance-check">✗</span>
                <p>Some medications need review</p>
              </div>
              <div className="compliance-item">
                <span className="compliance-check">✓</span>
                <p>Documentation up to date</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-primary" style={{ marginTop: '20px' }}>
        Download Report
      </button>
    </div>
  );
};
