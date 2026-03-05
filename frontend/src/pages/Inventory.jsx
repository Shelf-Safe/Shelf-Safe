import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';

export const Inventory = () => {
  const [medications, setMedications] = useState([]);

  return (
    <DashboardLayout>
      <div className="inventory-page">
        <h1 className="inventory-page-title">Inventory</h1>
        <div className="dashboard-section">
          <p className="inventory-count">{medications.length} medications</p>
          <div className="inventory-table-wrap">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th></th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};