import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useDataSource } from '../context/DataSourceContext';

export const MedicationDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { useDummy } = useDataSource();

  useEffect(() => {
    if (!user) return;

    // const res = await fetch(`/api/inventoryLots/${id}?orgId=${user.orgId}`);
    // const data = await res.json();
  }, [id, user, useDummy]);

  return (
    <DashboardLayout>
      <div style={{ padding: '28px 28px 0' }}>
        <div
          style={{
            height: 'calc(100vh - 120px)',
            borderRadius: 14,
            border: '1px dashed #e5e7eb',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 14,
          }}
        >
          Build this page UI here
        </div>
      </div>
    </DashboardLayout>
  );
};
