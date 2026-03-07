import React, { useState, useEffect } from 'react';
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const YEARS = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i));

const CATEGORIES = ['Analgesic','Antibiotic','Antidiabetic','Antihypertensive','Antihistamine','Antiviral','Vitamin','Other'];
const STATUSES   = ['In Stock','Low Stock','Out of Stock','Expiring Soon','Recalled'];
const RISKS      = ['Low','Medium','High','Critical'];
function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00808d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function FieldLabel({ children }) {
  return <label className="block text-sm font-normal text-gray-800 mb-1.5">{children}</label>;
}

function TextInput({ value, onChange, placeholder = '', type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-[#00808d] focus:ring-1 focus:ring-[#00808d] transition-colors"
    />
  );
}

function SelectInput({ value, onChange, options, placeholder = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3 py-2.5 pr-8 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-[#00808d] focus:ring-1 focus:ring-[#00808d] transition-colors cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
        <ChevronDown />
      </div>
    </div>
  );
}
export const EditMedicationPanel = ({ isOpen, onClose, medication, onSave }) => {
  const [form, setForm] = useState({
    medicationName: '',
    brandName: '',
    category: '',
    expiryMonth: '',
    expiryYear: '',
    currentStock: '',
    supplierName: '',
    supplierContact: '',
    status: '',
    risk: '',
    shelfId: '',
  });

  return (
    <div>
      {/* Add your JSX content here */}
    </div>
  );
};