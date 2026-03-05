import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { DUMMY_MEDICATIONS } from '../data/dummyMedications';

export const Inventory = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState(DUMMY_MEDICATIONS);

  useEffect(() => {
    if (!user) return;
    setMedications(DUMMY_MEDICATIONS);
  }, [user]);

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
              <tbody>
                {medications.map((m) => (
                  <tr key={m.id}>
                    <td>{m.medicationName}</td>
                    <td>{m.brandName}</td>
                    <td>{m.category}</td>
                    <td>{m.currentStock}</td>
                    <td>
                      <span className={`inventory-status inventory-status-${m.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>{m.expiryMonth} {m.expiryYear}</td>
                    <td>
                      <Link to={`/inventory/${m.id}`} className="inventory-link">View</Link>
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
