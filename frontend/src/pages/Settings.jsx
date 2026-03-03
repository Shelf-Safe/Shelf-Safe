import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';

function IconGear({ size = 22, color = '#00808d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconBell({ size = 22, color = '#00808d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconLock({ size = 22, color = '#00808d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconDollar({ size = 22, color = '#00808d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconRefresh({ size = 20, color = '#00808d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function IconMail({ size = 20, color = '#00808d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function IconEdit({ size = 18, color = '#00808d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconTrash({ size = 18, color = '#00808d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}


function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-[#1e1e1e] mb-1">{label}</label>
      {children}
    </div>
  );
}
const inputCls = 'w-full px-3 py-2.5 bg-white border border-[#d9d9d9] rounded-lg text-sm text-[#1e1e1e] outline-none focus:border-[#00808d] transition-colors';


function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${checked ? 'bg-[#00808d]' : 'bg-[#d2d2d2]'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}


function Checkbox({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-[#00808d] border-[#00808d]' : 'bg-white border-[#d2d2d2]'}`}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}


function PanelHeader({ title, onCancel, onSave }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-[#1e1e1e]">{title}</h2>
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="px-5 py-2 border border-[#d2d2d2] rounded-lg text-sm font-semibold text-[#1e1e1e] bg-white hover:bg-[#f5f5f5] transition-colors">
          Cancel
        </button>
        <button onClick={onSave} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#00808d] hover:bg-[#006e79] transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}


function AccountPanel({ user, onCancel, onSave }) {
  const [form, setForm] = useState({
    fullName: user?.name || '',
    employeeId: '',
    userRole: 'Lead Pharmacist',
    pharmacyOrg: 'Imagine Pharmacy',
    email: user?.email || '',
    phone: '',
  });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <PanelHeader title="Profile Details" onCancel={onCancel} onSave={() => onSave(form)} />

      {/* avatar + name */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ShelfSafe-xzo3unJd7sC7NV8bmp8gkDV1DB3TRE.png"
          alt={form.fullName}
          className="w-20 h-20 rounded-full object-cover object-top flex-shrink-0"
        />
        <div>
          <p className="text-xl font-bold text-[#1e1e1e]">{form.fullName || user?.name}</p>
          <p className="text-[#636363] text-sm">{form.userRole}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Full Name">
          <input className={inputCls} value={form.fullName} onChange={set('fullName')} />
        </Field>
        <Field label="Employee ID">
          <input className={inputCls} value={form.employeeId} onChange={set('employeeId')} />
        </Field>
        <Field label="User Role">
          <input className={inputCls} value={form.userRole} onChange={set('userRole')} />
        </Field>
        <Field label="Pharmacy/ Organization Name">
          <input className={inputCls} value={form.pharmacyOrg} onChange={set('pharmacyOrg')} />
        </Field>
        <Field label="Email">
          <input type="email" className={inputCls} value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Phone # (Optional)">
          <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+1 XXX-XXX-XXXX" />
        </Field>
      </div>

      <div className="mt-6">
        <p className="text-sm font-bold text-[#1e1e1e] mb-2">Preferences</p>
        <ul className="flex flex-col gap-1 text-sm text-[#4f5250]">
          <li>• English (Canada</li>
          <li>• PST (UTC−08:00)</li>
          <li>• Date Format : YYYY-MM-DD</li>
        </ul>
      </div>
    </div>
  );
}


function NotificationsPanel({ user, onCancel, onSave }) {
  const [phoneEnabled, setPhoneEnabled] = useState(false);
  const [phone, setPhone] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [email, setEmail] = useState(user?.email || 'steven@gmail.com');

  return (
    <div>
      <PanelHeader title="Notifications Preferences" onCancel={onCancel} onSave={() => onSave({ phoneEnabled, phone, emailEnabled, email })} />
      <p className="text-sm text-[#4f5250] mb-6">Choose how you&apos;d like to receive notifications about important updates.</p>

      <div className="bg-white rounded-xl border border-[#e6e6e6] p-5 flex flex-col gap-5">
        {/* Phone */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Checkbox checked={phoneEnabled} onChange={setPhoneEnabled} />
            <span className="font-bold text-sm text-[#1e1e1e]">Enable Phone Notifications</span>
          </div>
          <p className="text-sm text-[#4f5250] mb-3 ml-9">Get notified by SMS for critical updates.</p>
          <input
            className={inputCls}
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!phoneEnabled}
          />
        </div>

        <hr className="border-[#e6e6e6]" />

        {/* Email */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Checkbox checked={emailEnabled} onChange={setEmailEnabled} />
            <span className="font-bold text-sm text-[#1e1e1e]">Enable Email Notifications</span>
          </div>
          <p className="text-sm text-[#4f5250] mb-3 ml-9">Get notified by email for important updates.</p>
          <input
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!emailEnabled}
          />
        </div>
      </div>
    </div>
  );
}


function SecurityPanel({ onCancel, onSave }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);
  const [resetContact, setResetContact] = useState('');

  return (
    <div>
      <PanelHeader title="Security" onCancel={onCancel} onSave={() => onSave({ password, confirm, twoFactor })} />

      <div className="flex flex-col gap-4 mb-6">
        <Field label="Password">
          <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Confirm Password">
          <input type="password" className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-[#4f5250]">Enable two-factor authentication</span>
          <Toggle checked={twoFactor} onChange={setTwoFactor} />
        </div>
      </div>

      <hr className="border-[#e6e6e6] mb-6" />

      {/* forgot password section */}
      <div className="mb-6">
        <p className="font-bold text-sm text-[#1e1e1e] mb-2">Forgot Your Password?</p>
        <p className="text-sm text-[#4f5250] mb-4">
          Don&apos;t worry, we will help you to reset. Enter your email or phone number to receive a one-time password reset link.
        </p>
        <Field label="Enter your email/phone number">
          <input
            className={inputCls}
            value={resetContact}
            onChange={(e) => setResetContact(e.target.value)}
          />
        </Field>
        <button
          disabled={!resetContact}
          className="mt-3 px-5 py-2 rounded-lg text-sm font-semibold text-[#a6a6a6] bg-[#e6e6e6] cursor-not-allowed"
        >
          Send Reset Link
        </button>
      </div>

      {/* contact support */}
      <div className="flex justify-center">
        <button className="flex items-center gap-2 text-sm font-semibold text-[#1e1e1e] hover:text-[#00808d] transition-colors">
          <IconMail size={22} color="#00808d" />
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

function BillingPanel({ onCancel, onSave }) {
  return (
    <div>
      <PanelHeader title="Billing" onCancel={onCancel} onSave={onSave} />

      {/* Plan card */}
      <p className="text-sm font-bold text-[#1e1e1e] mb-3">Professional Plan</p>
      <div className="bg-white rounded-xl border border-[#e6e6e6] p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-2 text-sm text-[#4f5250]">
            <IconRefresh size={18} color="#00808d" />
            Renewal Date: August, 2027
          </span>
          <span className="text-lg font-bold text-[#1e1e1e]">$65/monthly</span>
        </div>
        {/* progress bar */}
        <div className="h-4 rounded-full bg-[#e6e6e6] overflow-hidden">
          <div className="h-full w-3/4 bg-[#d2d2d2] rounded-full" />
        </div>
      </div>

      {/* Payment method */}
      <p className="text-sm font-bold text-[#1e1e1e] mb-3">Payment Method</p>
      <div className="bg-white rounded-xl border border-[#e6e6e6] p-4 mb-6">
        <div className="flex items-center justify-end gap-3 mb-3">
          <button className="text-[#00808d] hover:opacity-75 transition-opacity"><IconEdit /></button>
          <button className="text-[#00808d] hover:opacity-75 transition-opacity"><IconTrash /></button>
        </div>
        <div className="flex items-center gap-3">
          {/* MasterCard logo */}
          <div className="flex items-center justify-center w-10 h-7 rounded border border-[#e6e6e6] bg-white overflow-hidden flex-shrink-0">
            <div className="flex">
              <div className="w-4 h-4 rounded-full bg-red-500 opacity-90" />
              <div className="w-4 h-4 rounded-full bg-yellow-400 opacity-90 -ml-2" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1e1e1e]">
              MasterCard <span className="text-[#a6a6a6]">•••• •••• ••••</span> 5494
            </p>
          </div>
        </div>
        <div className="flex gap-6 mt-2 text-sm text-[#4f5250]">
          <span>Exp: 5/2028</span>
          <span>Steven Rothschild</span>
        </div>
      </div>

      {/* Invoices table */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-[#1e1e1e]">Invoices</p>
        <button className="text-sm font-bold text-[#1e1e1e] hover:text-[#00808d] transition-colors">View Billing History</button>
      </div>
      <div className="bg-white rounded-xl border border-[#e6e6e6] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e6e6e6]">
              <th className="text-left px-4 py-3 text-[#636363] font-semibold">Date</th>
              <th className="text-left px-4 py-3 text-[#636363] font-semibold">Invoice#</th>
              <th className="text-left px-4 py-3 text-[#636363] font-semibold">Amount</th>
              <th className="text-left px-4 py-3 text-[#636363] font-semibold">Download</th>
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


const MENU = [
  { id: 'account',       label: 'Account',       desc: 'Update your name, username, photo, and contact details.', Icon: IconGear  },
  { id: 'notifications', label: 'Notifications',  desc: 'Preferences for email or in-app notification updates.',   Icon: IconBell  },
  { id: 'security',      label: 'Security',       desc: 'Password update, enable two-factor authentication.',      Icon: IconLock  },
  { id: 'billing',       label: 'Billing',        desc: 'Review your subscription plan, payment method, and invoices.', Icon: IconDollar },
];


export const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initial = searchParams.get('section') || null;
  const [active, setActive] = useState(initial); // null = no section selected on mobile

  const handleSave = (data) => {
    // In production: call API endpoint
    setActive(null);
  };
  const handleCancel = () => setActive(null);

  const renderPanel = () => {
    if (active === 'account')       return <AccountPanel       user={user} onCancel={handleCancel} onSave={handleSave} />;
    if (active === 'notifications') return <NotificationsPanel user={user} onCancel={handleCancel} onSave={handleSave} />;
    if (active === 'security')      return <SecurityPanel              onCancel={handleCancel} onSave={handleSave} />;
    if (active === 'billing')       return <BillingPanel               onCancel={handleCancel} onSave={handleSave} />;
    return null;
  };

  return (
    <DashboardLayout pageTitle="Settings">
      {/*
        Desktop: flex row — left list (fixed 420 px) + right detail panel.
        Mobile:  show list when no section selected, show panel when selected.
      */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">

        {/* ── LEFT MENU ── */}
        <div className={`w-full lg:w-[420px] lg:flex-shrink-0 lg:border-r border-[#e6e6e6] bg-white
          ${active ? 'hidden lg:block' : 'block'}`}
        >
          <h1 className="text-4xl font-black text-[#1e1e1e] px-6 pt-6 pb-4">Settings</h1>
          {MENU.map(({ id, label, desc, Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-start gap-4 px-6 py-5 border-t border-[#e6e6e6] text-left transition-colors
                ${active === id ? 'bg-[#f5f5f5]' : 'bg-white hover:bg-[#fafafa]'}`}
            >
              <span className="mt-0.5 flex-shrink-0"><Icon /></span>
              <div>
                <p className="text-base font-bold text-[#1e1e1e]">{label}</p>
                <p className="text-sm text-[#636363] mt-0.5 leading-snug">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className={`flex-1 bg-[#f5f5f5] p-6 lg:p-8
          ${active ? 'block' : 'hidden lg:block'}`}
        >
          {active ? (
            renderPanel()
          ) : (
            /* desktop empty state when nothing selected */
            <div className="hidden lg:flex h-full items-center justify-center text-[#a6a6a6] text-sm">
              Select a section from the left menu to get started.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
