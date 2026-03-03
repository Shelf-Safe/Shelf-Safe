import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';

const MOCK_PROFILE = {
  name: 'Steven',
  userRole: 'Lead Pharmacist',
  verified: true,
  employeeId: 'XXXXXXX',
  pharmacyOrganization: 'Imagine Pharmacy',
  email: 'steven_imagine@email.com',
  phone: '+1 XXX-XXX-XXXX',
  createdAt: 'February 11th, 2021',
  preferences: {
    language: 'English (Canada)',
    timezone: 'Pacific Time (Vancouver)',
    utcOffset: 'UTC-08:00 • UTC-07:00',
  },
  recentActivity: [
    'Logged in via mobile app Saturday at 8:24 PM PT',
    'Enabled two-factor authentication March 15, 2026, 9:10 AM PT',
    'Changed password and Email May 20, 2025 - 8:45 PM PT',
    'Logged in via mobile app Saturday at 8:24 PM PT',
    'Enabled two-factor authentication March 15, 2026, 9:10 AM PT',
  ],
};

function IconVerify() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="inline-block">
      <path d="M12 2L14.4 7.26L20.4 7.86L16.2 11.54L17.52 17.4L12 14.28L6.48 17.4L7.8 11.54L3.6 7.86L9.6 7.26L12 2Z"
        stroke="#00808d" strokeWidth="1.8" strokeLinejoin="round" />
      <polyline points="9 12 11 14 15 10" stroke="#00808d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00808d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconRibbon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00808d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" /><path d="M8.56 14.63L7 22l5-3 5 3-1.56-7.37" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00808d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profile = { ...MOCK_PROFILE, name: user?.name || MOCK_PROFILE.name, email: user?.email || MOCK_PROFILE.email };

  return (
    <DashboardLayout pageTitle="Profile">
      {/* ── page header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-3xl font-bold text-[#1e1e1e] flex items-center gap-2">
            Profile
            <button
              onClick={() => navigate('/settings')}
              className="ml-1 p-1 rounded hover:bg-[#f1f1f1] transition-colors"
              aria-label="Settings"
            >
              <IconGear />
            </button>
          </h1>
          <p className="text-[#636363] text-sm mt-1">Access your personal and professional details.</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => { logout?.(); navigate('/login'); }}
            className="px-5 py-2 border border-[#d2d2d2] rounded-lg text-sm font-semibold text-[#1e1e1e] bg-white hover:bg-[#f5f5f5] transition-colors"
          >
            Logout
          </button>
          <button
            onClick={() => navigate('/settings?section=account')}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#00808d] hover:bg-[#006e79] transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── main 2-col grid (desktop) / single col (mobile) ── */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* ── LEFT CARD ── */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-[#e6e6e6] overflow-hidden">
          {/* identity block */}
          <div className="p-6 flex items-center gap-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ShelfSafe-xzo3unJd7sC7NV8bmp8gkDV1DB3TRE.png"
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover object-top flex-shrink-0"
            />
            <div>
              <p className="text-2xl font-bold text-[#1e1e1e]">{profile.name}</p>
              <p className="text-[#636363] text-sm mt-0.5">{profile.userRole}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-mono font-semibold text-[#00808d]">
                <IconVerify /> Verified Pharmacist
              </span>
            </div>
          </div>

          <hr className="border-[#e6e6e6] mx-6" />

          {/* account information */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-[#1e1e1e] mb-4">Account Information</h3>
            <div className="flex flex-col gap-3">
              {[
                ['Full Name', profile.name],
                ['Employee ID', profile.employeeId],
                ['User Role', profile.userRole],
                ['Pharmacy Organization', profile.pharmacyOrganization],
                ['Email', profile.email],
                ['Phone', profile.phone],
              ].map(([label, value]) => (
                <p key={label} className="text-sm text-[#1e1e1e]">
                  <span className="font-bold">{label}:</span>{' '}
                  <span className="text-[#4f5250]">{value}</span>
                </p>
              ))}
            </div>
          </div>

          {/* footer */}
          <div className="px-6 py-3 bg-[#f5f5f5] border-t border-[#e6e6e6]">
            <p className="text-xs text-[#a6a6a6]">Account was created on {profile.createdAt}</p>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-5">
          {/* Preferences */}
          <div className="bg-white rounded-xl border border-[#e6e6e6] p-6">
            <h3 className="text-lg font-bold text-[#1e1e1e] flex items-center gap-2 mb-3">
              <IconRibbon /> Preferences
            </h3>
            <ul className="flex flex-col gap-1.5 text-sm text-[#4f5250]">
              <li>• Language: {profile.preferences.language}</li>
              <li>• Time Zone: {profile.preferences.timezone}</li>
              <li>• UTC Offset: {profile.preferences.utcOffset}</li>
            </ul>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-[#e6e6e6] p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-[#1e1e1e] flex items-center gap-2 mb-3">
              <IconShield /> Recent Activity
            </h3>
            <div className="overflow-y-auto max-h-52 pr-1">
              <ul className="flex flex-col gap-2.5 text-sm text-[#4f5250]">
                {profile.recentActivity.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
