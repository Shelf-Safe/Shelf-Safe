import React from "react";

export const ProfileSection = ({ user, onLogout }) => {
  return (
    <div className="dashboard-section">
      <h2>Profile</h2>

      <div className="profile-basic">
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

      {/* More profile sections (tabs/settings/activity) will be added in later commits */}
    </div>
  );
};