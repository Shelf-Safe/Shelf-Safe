import React from 'react';

const inputCls =
  'w-full rounded-xl border border-[#d9d9d9] bg-white px-4 py-2.5 text-sm text-[#1e1e1e] outline-none transition focus:border-[#00808d] disabled:bg-[#f5f5f5] disabled:text-[#a6a6a6]';

const Checkbox = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors ${checked ? 'border-[#00808d] bg-[#00808d]' : 'border-[#bfbfbf] bg-white'
      }`}
  >
    {checked && (
      <svg width="10" height="8" viewBox="0 0 12 10" fill="none">
        <polyline
          points="1.5 5 4.5 8.5 10.5 1.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

function NotificationsSection({
  notifications,
  onChange,
  onToggle,
  onSave,
  onCancel,
  saving,
}) {
  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <h2 className="pl-4 lg:pl-0 text-[22px] lg:text-[18px] font-bold text-[#1e1e1e]">
          Notifications Preferences
        </h2>
        <div className="flex shrink-0 items-center justify-end gap-2 pr-1 lg:pr-0">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[#00808d] bg-white px-4 py-[7px] text-sm font-medium text-[#00808d] transition hover:bg-[#f4fbfc]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-md border border-[#00808d] bg-[#00808d] px-4 py-[7px] text-sm font-medium text-white transition hover:bg-[#006d77]"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Subtitle ── */}
      <p className="mb-14 mt-8 text-sm text-[#4f5250]">
        Choose how you&apos;d like to receive notifications about important updates.
      </p>

      {/* ── Card ── */}
      <div className="ps-notif-card rounded-2xl border border-[#e6e6e6] bg-white p-7">
        {/* Phone row */}
        <div className="mb-1 flex items-center gap-3">
          <Checkbox
            checked={notifications.phoneEnabled}
            onChange={(v) => onToggle('phoneEnabled', v)}
          />
          <span className="text-[13.5px] font-bold text-[#1e1e1e]">
            Enable Phone Notifications
          </span>
        </div>
        <p className="mb-3 ml-[30px] text-[13px] text-[#4f5250]">
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

        <hr className="my-5 border-[#e6e6e6]" />

        {/* Email row */}
        <div className="mb-1 flex items-center gap-3">
          <Checkbox
            checked={notifications.emailEnabled}
            onChange={(v) => onToggle('emailEnabled', v)}
          />
          <span className="text-[13.5px] font-bold text-[#1e1e1e]">
            Enable Email Notifications
          </span>
        </div>
        <p className="mb-3 ml-[30px] text-[13px] text-[#4f5250]">
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
  );
}

export default NotificationsSection;