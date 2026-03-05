import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Reports as ReportsContent } from '../components/Reports';
import { DUMMY_MEDICATIONS } from '../data/dummyMedications';

export const Reports = () => {
  return (
    <DashboardLayout>
      <div className="reports-page">
        <h1 className="reports-page-title">Reports</h1>
        <ReportsContent medications={DUMMY_MEDICATIONS} />
      </div>
    </DashboardLayout>
  );
};