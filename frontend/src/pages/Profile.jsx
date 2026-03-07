import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { ProfileSection } from '../components/ProfileSection';
import { getProfile } from '../services/profileService';

export const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const profileData = await getProfile();
        setProfile(profileData);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <DashboardLayout>
      <div className="profile-page">
        <h1 className="profile-page-title">Profile</h1>

        {loading ? (
          <div className="dashboard-section">
            <p>Loading profile...</p>
          </div>
        ) : error ? (
          <div className="dashboard-section">
            <p>{error}</p>
          </div>
        ) : profile ? (
          <ProfileSection user={profile} onLogout={handleLogout} />
        ) : (
          <div className="dashboard-section">
            <p>Profile not found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};