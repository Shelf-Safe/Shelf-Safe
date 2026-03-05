import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { ProfileSection } from '../components/ProfileSection';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayUser = user
    ? {
        name: user.fullName || user.name || user.email || 'User',
        email: user.email || '—',
        role: user.role || 'User',
      }
    : null;

  return (
    <DashboardLayout>
      <div className="profile-page">
        <h1 className="profile-page-title">Profile</h1>
        {displayUser ? (
          <ProfileSection user={displayUser} onLogout={handleLogout} />
        ) : (
          <div className="dashboard-section">
            <p>Not signed in.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
