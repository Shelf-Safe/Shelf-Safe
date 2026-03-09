import React, { useEffect, useState } from 'react';
import { updateProfile } from '../services/profileService';

export const ProfileSection = ({ user, onLogout, onProfileUpdated }) => {
  const [activeProfileTab, setActiveProfileTab] = useState('account');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    employeeId: '',
    userRole: '',
    email: '',
    phone: '',
    role: '',
  });

  useEffect(() => {
    setProfileData({
      name: user?.name || '',
      employeeId: user?.employeeId || '',
      userRole: user?.userRole || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || '',
    });
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    const handleSaveProfile = async () => {
    const trimmedName = profileData.name.trim();
    const trimmedEmployeeId = profileData.employeeId.trim();
    const trimmedUserRole = profileData.userRole.trim();
    const trimmedPhone = profileData.phone.trim();

    if (!trimmedName) {
      setError('Full Name is required');
      setSaveMessage('');
      return;
    }

    if (!trimmedEmployeeId) {
      setError('Employee ID is required');
      setSaveMessage('');
      return;
    }

    if (!trimmedUserRole) {
      setError('User Role is required');
      setSaveMessage('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSaveMessage('');

      const updatedProfile = await updateProfile({
        name: trimmedName,
        employeeId: trimmedEmployeeId,
        userRole: trimmedUserRole,
        phone: trimmedPhone,
      });

      onProfileUpdated(updatedProfile);
      setEditMode(false);
      setSaveMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      employeeId: user?.employeeId || '',
      userRole: user?.userRole || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || '',
    });
    setEditMode(false);
    setError('');
    setSaveMessage('');
  };

    const profileTabs = [
    { id: 'account', label: 'Account', icon: '👤', disabled: false },
    { id: 'notifications', label: 'Notifications', icon: '🔔', disabled: true },
    { id: 'security', label: 'Security', icon: '🔒', disabled: true },
    { id: 'billing', label: 'Billing', icon: '💳', disabled: true },
  ];

  return (
    <div className="dashboard-section">
      <h2>Profile Settings</h2>

      <div className="profile-tabs">
        {profileTabs.map((tab) => (
                    <button
            key={tab.id}
            className={`profile-tab ${activeProfileTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              if (!tab.disabled) {
                setActiveProfileTab(tab.id);
              }
            }}
            disabled={tab.disabled}
            style={{
              opacity: tab.disabled ? 0.5 : 1,
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-content">
                {activeProfileTab === 'account' && (
          <div className="profile-account">
            <div
              className="profile-account-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3>Profile Details</h3>
                <p style={{ margin: '6px 0 0', color: '#666' }}>
                  Manage your account information
                </p>
              </div>

              {!editMode ? (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditMode(true);
                    setSaveMessage('');
                    setError('');
                  }}
                >
                  Edit Profile
                </button>
              ) : (
                <div
                  className="profile-actions"
                  style={{ display: 'flex', gap: '10px' }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {saveMessage && <p style={{ color: 'green' }}>{saveMessage}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div
              className="profile-summary-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '20px',
                }}
              >
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
              </div>

              <div>
                <h4 style={{ margin: 0 }}>{profileData.name || 'User'}</h4>
                <p style={{ margin: '4px 0 0', color: '#666' }}>
                  {profileData.userRole || 'No role assigned'}
                </p>
              </div>
            </div>

            <form className="profile-edit">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={profileData.employeeId}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>User Role</label>
                <input
                  type="text"
                  name="userRole"
                  value={profileData.userRole}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Phone #</label>
                <input
                  type="text"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={!editMode}
                />
              </div>

              <div className="form-group">
                <label>System Role</label>
                <input
                  type="text"
                  name="role"
                  value={profileData.role}
                  disabled
                  readOnly
                />
              </div>
            </form>
          </div>
        )}

        {activeProfileTab === 'notifications' && (
          <div className="profile-notifications">
            <h3>Notification Preferences</h3>
            <div className="notification-setting">
              <div className="setting-info">
                <p>Email Notifications</p>
                <small>Receive updates via email</small>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="notification-setting">
              <div className="setting-info">
                <p>Medication Reminders</p>
                <small>Get notified about medication schedules</small>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="notification-setting">
              <div className="setting-info">
                <p>Expiry Alerts</p>
                <small>Alert when medications are about to expire</small>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              Save Preferences
            </button>
          </div>
        )}

        {activeProfileTab === 'security' && (
          <div className="profile-security">
            <h3>Security Settings</h3>
            <div className="security-item">
              <h4>Change Password</h4>
              <p>Last changed: 3 months ago</p>
              <button className="btn btn-secondary">Change Password</button>
            </div>
            <div className="security-item">
              <h4>Two-Factor Authentication</h4>
              <p>Enhance your account security</p>
              <button className="btn btn-secondary">Enable 2FA</button>
            </div>
            <div className="security-item">
              <h4>Active Sessions</h4>
              <p>Manage devices and sessions</p>
              <button className="btn btn-secondary">View Sessions</button>
            </div>
          </div>
        )}

        {activeProfileTab === 'billing' && (
          <div className="profile-billing">
            <h3>Billing & Plans</h3>
            <div className="billing-info">
              <h4>Current Plan</h4>
              <p>Free Plan</p>
              <small>Upgrade to unlock premium features</small>
            </div>
            <div className="billing-info">
              <h4>Next Billing Date</h4>
              <p>Your current plan is free</p>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '20px' }}>
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>

      <div className="profile-danger-zone" style={{ marginTop: '40px' }}>
        <h3>Danger Zone</h3>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (window.confirm('Are you sure you want to logout?')) {
              onLogout();
            }
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};
