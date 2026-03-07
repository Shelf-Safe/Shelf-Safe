import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><circle cx="8" cy="9" r="1" />
    </svg>
  );
}

function TrashIcon({ color = '#ef4444' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
const btnBase = {
  padding: '11px 24px', borderRadius: '8px', fontSize: '15px',
  fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.15s',
};
const btnOutline = {
  ...btnBase, background: '#fff', border: '1.5px solid #d1d5db', color: '#374151',
};
const btnTeal = {
  ...btnBase, background: '#00808d', border: 'none', color: '#fff',
};
const btnTealDisabled = {
  ...btnTeal, background: '#d1d5db', color: '#9ca3af', cursor: 'not-allowed',
};
function MethodPicker({ method, setMethod }) {
  const options = [
    {
      id: 'bulk',
      label: 'Import in bulk',
      sub: 'Upload a Excel file to add multiple medications at once.',
    },
    {
      id: 'manual',
      label: 'Add manually',
      sub: '',
    },
    {
      id: 'barcode',
      label: 'Scan a medication barcode using your device camera',
      sub: '',
    },
  ];

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Choose how you'd like to add your medications.{' '}
        You can upload multiple items at once, add them manually, or use your camera to scan.
      </p>
      <div className="flex flex-col gap-4">
        {options.map((o) => (
          <label
            key={o.id}
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => setMethod(o.id)}
          >
            
            <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: method === o.id ? '#00808d' : '#d1d5db' }}>
              {method === o.id && (
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#00808d' }} />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{o.label}</p>
              {o.sub && <p className="text-xs text-gray-500 mt-0.5">{o.sub}</p>}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}