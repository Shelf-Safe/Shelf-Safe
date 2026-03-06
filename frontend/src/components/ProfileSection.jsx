import React, { useState } from 'react';

export const ProfileSection = ({ user, onLogout }) => {
  const [activeProfileTab, setActiveProfileTab] = useState('account');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    setEditMode(false);
    alert('Profile updated successfully!');
  };

  const profileTabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'billing', label: 'Billing', icon: '💳' },
  ];

  return (
    <div className="dashboard-section">
      <h2>Profile Settings</h2>

      <div className="profile-tabs">
        {profileTabs.map((tab) => (
          <button
            key={tab.id}
            className={`profile-tab ${activeProfileTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveProfileTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-content">
        {activeProfileTab === 'account' && (
          <div className="profile-account">
            <h3>Account Information</h3>

            {!editMode ? (
              <div className="profile-view">
                <div className="profile-field">
                  <label>Name</label>
                  <p>{profileData.name}</p>
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <p>{profileData.email}</p>
                </div>
                <div className="profile-field">
                  <label>Role</label>
                  <p>{user?.role || 'User'}</p>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form className="profile-edit">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="profile-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
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
