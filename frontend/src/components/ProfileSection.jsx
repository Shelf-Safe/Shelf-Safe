import React, { useEffect, useState } from 'react';
import { updateProfile, requestPasswordReset } from '../services/profileService';
import {
  FiSettings,
  FiBell,
  FiLock,
  FiDollarSign,
  FiRefreshCw,
  FiMail,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';

const inputCls =
  'w-full rounded-md border border-[#d9d9d9] bg-white px-3 py-2 text-sm text-[#1e1e1e] outline-none transition focus:border-[#00808d]';

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1 block text-sm text-[#1e1e1e]">{label}</label>
    {children}
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
      checked ? 'bg-[#00808d]' : 'bg-[#d2d2d2]'
    }`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
        checked ? 'left-5' : 'left-0.5'
      }`}
    />
  </button>
);

const Checkbox = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
      checked ? 'border-[#00808d] bg-[#00808d]' : 'border-[#bfbfbf] bg-white'
    }`}
  >
    {checked && (
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <polyline
          points="2 6 5 9 10 3"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

const PanelHeader = ({
  title,
  onCancel,
  onSave,
  saveLabel = 'Save Changes',
  saving = false,
}) => (
  <div className="mb-8 flex items-center justify-between">
    <h2 className="text-[18px] font-bold text-[#1e1e1e]">{title}</h2>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md border border-[#00808d] bg-white px-4 py-2 text-sm font-medium text-[#00808d] transition hover:bg-[#f4fbfc]"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        className="rounded-md bg-[#00808d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#006d77]"
      >
        {saving ? 'Saving...' : saveLabel}
      </button>
    </div>
  </div>
);

const Messages = ({ success, error }) => (
  <>
    {success && <p className="mb-4 text-sm text-green-600">{success}</p>}
    {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
  </>
);

const MENU_ITEMS = [
  {
    id: 'account',
    label: 'Account',
    description: 'Update your name, username, photo, and contact details.',
    icon: <FiSettings size={20} color="#00808d" />,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Preferences for email or in-app notification updates.',
    icon: <FiBell size={20} color="#00808d" />,
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Password update, enable two-factor authentication.',
    icon: <FiLock size={20} color="#00808d" />,
  },
  {
    id: 'billing',
    label: 'Billing',
    description: 'Review your subscription plan, payment method, and invoices.',
    icon: <FiDollarSign size={20} color="#00808d" />,
  },
];

const buildProfileData = (user) => ({
  name: user?.name || '',
  employeeId: user?.employeeId || '',
  userRole: user?.userRole || '',
  pharmacyOrganization: user?.pharmacyOrganization || '',
  email: user?.email || '',
  phone: user?.phone || '',
  role: user?.role || '',
  notifications: {
    emailEnabled: user?.notifications?.emailEnabled ?? true,
    emailAddress: user?.notifications?.emailAddress || user?.email || '',
    phoneEnabled: user?.notifications?.phoneEnabled ?? false,
    phoneNumber: user?.notifications?.phoneNumber || user?.phone || '',
  },
});

const buildSecurityData = (user) => ({
  password: '',
  confirmPassword: '',
  twoFactorEnabled: user?.twoFactorEnabled ?? false,
  resetContact: user?.email || user?.phone || '',
});

function AccountTab({ profileData, onChange, onSave, onCancel, saving }) {
  return (
    <div>
      <PanelHeader
        title="Profile Details"
        onCancel={onCancel}
        onSave={onSave}
        saving={saving}
      />

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#d9d9d9] text-2xl font-bold text-[#1e1e1e]">
          {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <p className="text-[20px] font-bold text-[#1e1e1e]">
            {profileData.name || 'User'}
          </p>
          <p className="text-[16px] text-[#4f5250]">
            {profileData.userRole || 'Lead Pharmacist'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {[
          { label: 'Full Name', name: 'name' },
          { label: 'Employee ID', name: 'employeeId' },
          { label: 'User Role', name: 'userRole' },
          { label: 'Pharmacy/ Organization Name', name: 'pharmacyOrganization' },
          { label: 'Phone # (Optional)', name: 'phone' },
        ].map(({ label, name }) => (
          <Field key={name} label={label}>
            <input
              className={inputCls}
              name={name}
              value={profileData[name]}
              onChange={onChange}
            />
          </Field>
        ))}

        <Field label="Email">
          <input
            className={`${inputCls} bg-white`}
            type="email"
            value={profileData.email}
            disabled
            readOnly
          />
        </Field>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-bold text-[#1e1e1e]">Preferences</p>
        <ul className="flex flex-col gap-1 text-sm text-[#4f5250]">
          <li>• English (Canada)</li>
          <li>• PST (UTC-08:00)</li>
          <li>• Date Format : YYYY-MM-DD</li>
        </ul>
      </div>
    </div>
  );
}

function NotificationsTab({
  notifications,
  onChange,
  onToggle,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <div>
      <PanelHeader
        title="Notifications Preferences"
        onCancel={onCancel}
        onSave={onSave}
        saving={saving}
      />

      <p className="mb-6 text-sm text-[#4f5250]">
        Choose how you&apos;d like to receive notifications about important
        updates.
      </p>

      <div className="rounded-xl border border-[#e6e6e6] bg-white p-5">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Checkbox
              checked={notifications.phoneEnabled}
              onChange={(v) => onToggle('phoneEnabled', v)}
            />
            <span className="text-sm font-bold text-[#1e1e1e]">
              Enable Phone Notifications
            </span>
          </div>
          <p className="mb-3 ml-8 text-sm text-[#4f5250]">
            Get notified by SMS for critical updates.
          </p>
          <input
            className={inputCls}
            placeholder="Enter your phone number"
            name="phoneNumber"
            value={notifications.phoneNumber}
            onChange={onChange}
            disabled={!notifications.phoneEnabled}
          />
        </div>

        <hr className="my-5 border-[#e6e6e6]" />

        <div>
          <div className="mb-2 flex items-center gap-3">
            <Checkbox
              checked={notifications.emailEnabled}
              onChange={(v) => onToggle('emailEnabled', v)}
            />
            <span className="text-sm font-bold text-[#1e1e1e]">
              Enable Email Notifications
            </span>
          </div>
          <p className="mb-3 ml-8 text-sm text-[#4f5250]">
            Get notified by email for important updates.
          </p>
          <input
            className={inputCls}
            type="email"
            name="emailAddress"
            value={notifications.emailAddress}
            onChange={onChange}
            disabled={!notifications.emailEnabled}
          />
        </div>
      </div>
    </div>
  );
}

function SecurityTab({
  securityData,
  onChange,
  onToggle2FA,
  onSave,
  onCancel,
  saving,
  onSendReset,
  resetSending,
  resetMsg,
  resetErr,
}) {
  return (
    <div>
      <PanelHeader
        title="Security"
        onCancel={onCancel}
        onSave={onSave}
        saving={saving}
      />

      <div className="flex flex-col gap-4">
        <Field label="Password">
          <input
            type="password"
            className={inputCls}
            name="password"
            value={securityData.password}
            onChange={onChange}
          />
        </Field>

        <Field label="Confirm Password">
          <input
            type="password"
            className={inputCls}
            name="confirmPassword"
            value={securityData.confirmPassword}
            onChange={onChange}
          />
        </Field>

        <div className="flex items-center justify-end gap-3 pt-1">
          <span className="text-sm text-[#4f5250]">
            Enable two-factor authentication
          </span>
          <Toggle checked={securityData.twoFactorEnabled} onChange={onToggle2FA} />
        </div>
      </div>

      <div className="mt-14">
        <p className="mb-2 text-sm font-bold text-[#1e1e1e]">
          Forgot Your Password?
        </p>
        <p className="mb-5 max-w-[610px] text-sm leading-6 text-[#4f5250]">
          Don&apos;t worry, we will help you to reset. Enter your email or phone
          number to receive a one-time password reset link.
        </p>

        <Field label="Enter your email/phone number">
          <input
            className={inputCls}
            name="resetContact"
            value={securityData.resetContact}
            onChange={onChange}
          />
        </Field>

        <Messages success={resetMsg} error={resetErr} />

        <button
          type="button"
          onClick={onSendReset}
          disabled={resetSending || !securityData.resetContact.trim()}
          className={`mt-5 rounded-md px-4 py-2 text-sm font-medium transition ${
            securityData.resetContact.trim()
              ? 'bg-[#00808d] text-white hover:bg-[#006d77]'
              : 'cursor-not-allowed bg-[#e6e6e6] text-[#a6a6a6]'
          }`}
        >
          {resetSending ? 'Sending...' : 'Send Reset Link'}
        </button>
      </div>

      <div className="mt-20 flex justify-center">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-[#1e1e1e]"
        >
          <FiMail size={22} color="#00808d" />
          Contact our support
        </button>
      </div>
    </div>
  );
}

const INVOICES = [
  { date: 'Nov 20, 2025', invoice: '#867508', amount: '$455', download: 'PDF' },
  { date: 'Sept 15, 2025', invoice: '#844125', amount: '$57', download: 'Word Docs' },
  { date: 'Paracetamol 500mg', invoice: '#648154', amount: '$25.80', download: 'CSV...' },
];

function BillingTab() {
  return (
    <div>
      <PanelHeader title="Billing" onCancel={() => {}} onSave={() => {}} />

      <p className="mb-3 text-sm font-bold text-[#1e1e1e]">Professional Plan</p>
      <div className="mb-6 rounded-xl border border-[#e6e6e6] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm text-[#4f5250]">
            <FiRefreshCw size={18} color="#00808d" />
            Renewal Date: August, 2027
          </span>
          <span className="text-lg font-bold text-[#1e1e1e]">$65/monthly</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-[#e6e6e6]">
          <div className="h-full w-3/4 rounded-full bg-[#d2d2d2]" />
        </div>
      </div>

      <p className="mb-3 text-sm font-bold text-[#1e1e1e]">Payment Method</p>
      <div className="mb-6 rounded-xl border border-[#e6e6e6] bg-white p-4">
        <div className="mb-3 flex items-center justify-end gap-3">
          <button type="button">
            <FiEdit2 size={18} color="#00808d" />
          </button>
          <button type="button">
            <FiTrash2 size={18} color="#00808d" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-7 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded border border-[#e6e6e6] bg-white">
            <div className="flex">
              <div className="h-4 w-4 rounded-full bg-red-500 opacity-90" />
              <div className="-ml-2 h-4 w-4 rounded-full bg-yellow-400 opacity-90" />
            </div>
          </div>
          <p className="text-sm font-semibold text-[#1e1e1e]">
            MasterCard <span className="text-[#a6a6a6]">•••• •••• ••••</span> 5494
          </p>
        </div>

        <div className="mt-2 flex gap-6 text-sm text-[#4f5250]">
          <span>Exp: 5/2028</span>
          <span>Steven Rothschild</span>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-[#1e1e1e]">Invoices</p>
        <button type="button" className="text-sm font-bold text-[#1e1e1e]">
          View Billing History
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e6e6e6] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e6e6e6]">
              {['Date', 'Invoice#', 'Amount', 'Download'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-[#636363]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((row, i) => (
              <tr key={i} className={i > 0 ? 'border-t border-[#e6e6e6]' : ''}>
                <td className="px-4 py-3 text-[#4f5250]">{row.date}</td>
                <td className="px-4 py-3 text-[#4f5250]">{row.invoice}</td>
                <td className="px-4 py-3 text-[#4f5250]">{row.amount}</td>
                <td className="px-4 py-3 text-[#4f5250]">{row.download}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const ProfileSection = ({ user, onProfileUpdated, initialTab = 'account' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profileData, setProfileData] = useState(buildProfileData(user));
  const [securityData, setSecurityData] = useState(buildSecurityData(user));

  const [fb, setFb] = useState({ msg: '', err: '' });
  const [notifFb, setNotifFb] = useState({ msg: '', err: '' });
  const [secFb, setSecFb] = useState({ msg: '', err: '' });
  const [resetFb, setResetFb] = useState({ msg: '', err: '' });

  const [saving, setSaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [secSaving, setSecSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);

  useEffect(() => {
    setProfileData(buildProfileData(user));
    setSecurityData(buildSecurityData(user));
  }, [user]);

  useEffect(() => {
    setActiveTab(initialTab);
    setNotifFb({ msg: '', err: '' });
  }, [initialTab]);

  const clearAllFeedback = () => {
    setFb({ msg: '', err: '' });
    setNotifFb({ msg: '', err: '' });
    setSecFb({ msg: '', err: '' });
    setResetFb({ msg: '', err: '' });
  };

  const switchTab = (id) => {
    setActiveTab(id);
    clearAllFeedback();
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((p) => ({ ...p, [name]: value }));
  };

  const handleSaveProfile = async () => {
    const { name, employeeId, userRole, pharmacyOrganization, phone } = profileData;

    if (!name.trim()) return setFb({ msg: '', err: 'Full Name is required' });
    if (!employeeId.trim()) return setFb({ msg: '', err: 'Employee ID is required' });
    if (!userRole.trim()) return setFb({ msg: '', err: 'User Role is required' });

    try {
      setSaving(true);
      setFb({ msg: '', err: '' });

      const updated = await updateProfile({
        name: name.trim(),
        employeeId: employeeId.trim(),
        userRole: userRole.trim(),
        pharmacyOrganization: pharmacyOrganization.trim(),
        phone: phone.trim(),
      });

      onProfileUpdated(updated);
      setFb({ msg: 'Profile updated successfully!', err: '' });
    } catch (e) {
      setFb({ msg: '', err: e.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileData(buildProfileData(user));
    setFb({ msg: '', err: '' });
  };

  const handleNotifChange = (e) => {
    const { name, value } = e.target;
    setNotifFb({ msg: '', err: '' });
    setProfileData((p) => ({
      ...p,
      notifications: { ...p.notifications, [name]: value },
    }));
  };

  const handleNotifToggle = (key, value) => {
    setNotifFb({ msg: '', err: '' });
    setProfileData((p) => ({
      ...p,
      notifications: { ...p.notifications, [key]: value },
    }));
  };

  const handleSaveNotifications = async () => {
    const { emailEnabled, emailAddress, phoneEnabled, phoneNumber } =
      profileData.notifications;

    if (emailEnabled && !emailAddress.trim()) {
      return setNotifFb({
        msg: '',
        err: 'Email address is required when email notifications are enabled.',
      });
    }

    if (phoneEnabled && !phoneNumber.trim()) {
      return setNotifFb({
        msg: '',
        err: 'Phone number is required when phone notifications are enabled.',
      });
    }

    try {
      setNotifSaving(true);
      setNotifFb({ msg: '', err: '' });

      const updated = await updateProfile({
        notifications: {
          emailEnabled,
          emailAddress: emailAddress.trim(),
          phoneEnabled,
          phoneNumber: phoneNumber.trim(),
        },
      });

      onProfileUpdated(updated);
      setProfileData((p) => ({
        ...p,
        notifications: buildProfileData(updated).notifications,
      }));
      setNotifFb({
        msg: 'Notification preferences updated successfully!',
        err: '',
      });
    } catch (e) {
      setNotifFb({
        msg: '',
        err: e.message || 'Failed to update notification preferences',
      });
    } finally {
      setNotifSaving(false);
    }
  };

  const handleCancelNotif = () => {
    setProfileData((p) => ({
      ...p,
      notifications: buildProfileData(user).notifications,
    }));
    setNotifFb({ msg: '', err: '' });
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecFb({ msg: '', err: '' });
    setResetFb({ msg: '', err: '' });
    setSecurityData((p) => ({ ...p, [name]: value }));
  };

  const handleSaveSecurity = async () => {
    const { password, confirmPassword, twoFactorEnabled } = securityData;
    const pwd = password.trim();

    if (pwd && pwd.length < 6) {
      return setSecFb({
        msg: '',
        err: 'Password must be at least 6 characters long.',
      });
    }

    if (pwd !== confirmPassword.trim()) {
      return setSecFb({
        msg: '',
        err: 'Password and Confirm Password must match.',
      });
    }

    try {
      setSecSaving(true);
      setSecFb({ msg: '', err: '' });

      const payload = {
        twoFactorEnabled,
        ...(pwd && { password: pwd }),
      };

      const updated = await updateProfile(payload);
      onProfileUpdated(updated);
      setSecurityData(buildSecurityData(updated));
      setSecFb({ msg: 'Security settings updated successfully!', err: '' });
    } catch (e) {
      setSecFb({
        msg: '',
        err: e.message || 'Failed to update security settings',
      });
    } finally {
      setSecSaving(false);
    }
  };

  const handleCancelSecurity = () => {
    setSecurityData(buildSecurityData(user));
    setSecFb({ msg: '', err: '' });
    setResetFb({ msg: '', err: '' });
  };

  const handleSendResetLink = async () => {
    const contact = securityData.resetContact.trim();

    if (!contact) {
      return setResetFb({
        msg: '',
        err: 'Please enter your email or phone number.',
      });
    }

    try {
      setResetSending(true);
      setResetFb({ msg: '', err: '' });
      const res = await requestPasswordReset(contact);
      setResetFb({ msg: res.message || 'Reset link sent successfully.', err: '' });
    } catch (e) {
      setResetFb({
        msg: '',
        err: e.message || 'Failed to send reset link',
      });
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#e6e6e6] bg-white">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full border-b border-[#e6e6e6] bg-white lg:w-[440px] lg:flex-shrink-0 lg:border-b-0 lg:border-r">
          <div className="border-b border-[#e6e6e6] px-6 py-5">
            <h1 className="text-[38px] font-black leading-none text-[#1e1e1e]">
              Settings
            </h1>
          </div>

          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => switchTab(item.id)}
              className={`flex w-full items-start gap-4 border-b border-[#e6e6e6] px-6 py-5 text-left transition-colors ${
                activeTab === item.id ? 'bg-[#f5f5f5]' : 'bg-white hover:bg-[#fafafa]'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
              <div>
                <p className="text-[16px] font-bold text-[#1e1e1e]">{item.label}</p>
                <p className="mt-1 text-[14px] leading-snug text-[#636363]">
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-visible bg-[#f5f5f5] px-6 py-4">
          <div className="max-w-[700px]">
            {activeTab === 'account' && <Messages success={fb.msg} error={fb.err} />}
            {activeTab === 'notifications' && (
              <Messages success={notifFb.msg} error={notifFb.err} />
            )}
            {activeTab === 'security' && <Messages success={secFb.msg} error={secFb.err} />}

            {activeTab === 'account' && (
              <AccountTab
                profileData={profileData}
                onChange={handleProfileChange}
                onSave={handleSaveProfile}
                onCancel={handleCancelProfile}
                saving={saving}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab
                notifications={profileData.notifications}
                onChange={handleNotifChange}
                onToggle={handleNotifToggle}
                onSave={handleSaveNotifications}
                onCancel={handleCancelNotif}
                saving={notifSaving}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab
                securityData={securityData}
                onChange={handleSecurityChange}
                onToggle2FA={(v) =>
                  setSecurityData((p) => ({ ...p, twoFactorEnabled: v }))
                }
                onSave={handleSaveSecurity}
                onCancel={handleCancelSecurity}
                saving={secSaving}
                onSendReset={handleSendResetLink}
                resetSending={resetSending}
                resetMsg={resetFb.msg}
                resetErr={resetFb.err}
              />
            )}

            {activeTab === 'billing' && <BillingTab />}
          </div>
        </div>
      </div>
    </div>
  );
};