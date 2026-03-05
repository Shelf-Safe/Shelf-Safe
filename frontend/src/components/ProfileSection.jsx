import React, { useState } from "react";

export const ProfileSection = ({ user, onLogout }) => {
  const [activeProfileTab, setActiveProfileTab] = useState("account");
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
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
    alert("Profile updated successfully!");
  };

  const profileTabs = [
    { id: "account", label: "Account", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "billing", label: "Billing", icon: "💳" },
  ];

  return (
    <div className="dashboard-section">
      <h2>Profile Settings</h2>

      <div className="profile-tabs">
        {profileTabs.map((tab) => (
          <button
            key={tab.id}
            className={`profile-tab ${
              activeProfileTab === tab.id ? "active" : ""
            }`}
            onClick={() => setActiveProfileTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-content">
        {activeProfileTab === "account" && (
          <div className="profile-account">
            <h3>Account Information</h3>

            {!editMode ? (
              <div className="profile-view">
                <div className="profile-field">
                  <label>Name</label>
                  <p>{profileData.name || "—"}</p>
                </div>

                <div className="profile-field">
                  <label>Email</label>
                  <p>{profileData.email || "—"}</p>
                </div>

                <div className="profile-field">
                  <label>Role</label>
                  <p>{user?.role || "User"}</p>
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
      </div>
    </div>
  );
};