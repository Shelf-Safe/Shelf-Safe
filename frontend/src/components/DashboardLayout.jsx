import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.fullName || user?.email || 'User';
  const initial = (displayName?.trim()?.[0] || 'U').toUpperCase();

  const goProfile = () => navigate('/profile');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout-main">
        <header className="dashboard-layout-header">
          <div />
          <div className="header-right">
            <button type="button" className="header-user" onClick={goProfile} aria-label="Open profile">
              <span className="header-avatar" aria-hidden="true">{initial}</span>
              <span className="header-username">{displayName}</span>
            </button>
            <button type="button" className="btn btn-outline" onClick={logout}>Logout</button>
          </div>
        </header>
        <main className="dashboard-layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};
