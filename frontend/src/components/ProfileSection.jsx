import React, { useState } from "react";

export const ProfileSection = ({ user, onLogout }) => {
  const [activeProfileTab, setActiveProfileTab] = useState("account");

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
            className={`profile-tab ${activeProfileTab === tab.id ? "active" : ""}`}
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

            <div className="profile-view">
              <div className="profile-field">
                <label>Name</label>
                <p>{user?.name || "—"}</p>
              </div>

              <div className="profile-field">
                <label>Email</label>
                <p>{user?.email || "—"}</p>
              </div>

              <div className="profile-field">
                <label>Role</label>
                <p>{user?.role || "User"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};