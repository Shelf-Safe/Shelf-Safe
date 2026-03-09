import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { medicationService } from '../services/medicationService';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEARS = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i));
const RISK_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const SHELF_OPTIONS = ['A1','A2','A3','B1','B2','B3','C1','C2','C3','Refrigerated','Controlled'];
const CATEGORY_OPTIONS = ['Analgesic','Antibiotic','Antihypertensive','Antihistamine','Antidiabetic','Cardiovascular','Gastrointestinal','Neurological','Oncology','Other'];
const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-[#00808d] focus:ring-1 focus:ring-[#00808d]';
const selectCls = `${inputCls} cursor-pointer appearance-none`;
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

const SelectWrap = ({ children }) => (
  <div className="relative">
    {children}
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#00808d]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
    </div>
  </div>
);

export const AddMedicationPage = () => {
  const navigate = useNavigate(), location = useLocation(), photoInputRef = useRef(null);
  const [form, setForm] = useState({
    medicationName: '', brandName: '', risk: '', shelfId: '',
    expiryMonth: MONTHS[new Date().getMonth()], expiryYear: String(new Date().getFullYear()),
    currentStock: '', supplierName: '', supplierContact: '', status: '',
    category: '', sku: '', barcodeData: '', batchLotNumber: '',
  });
  const [photoFile, setPhotoFile] = useState(null), [photoPreview, setPhotoPreview] = useState(null), [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false), [error, setError] = useState('');
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const p = location?.state?.prefill;
    if (!p) return;
    setForm((f) => ({ ...f, sku: p.sku || f.sku, barcodeData: p.barcodeData || f.barcodeData }));
    if (p.photoUrl) { setPhotoUrl(p.photoUrl); setPhotoPreview(p.photoUrl); setPhotoFile(null); }
  }, [location?.state]);

  const handlePhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f); setPhotoUrl('');
    const r = new FileReader();
    r.onload = (ev) => setPhotoPreview(ev.target.result);
    r.readAsDataURL(f); e.target.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.medicationName.trim()) return setError('Medication name is required.');
    setError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile); else if (photoUrl) fd.append('photoUrl', photoUrl);
      await medicationService.create(fd);
      navigate('/inventory');
    } catch (err) {
      setError(err.message || 'Failed to save medication.');
    } finally { setSaving(false); }
  };

  const fields = [
    ['Medication Name', 'medicationName'], ['Brand Name', 'brandName'],
    ['Current Stock', 'currentStock', 'number'], ['Supplier Name', 'supplierName'],
    ['Supplier Contact', 'supplierContact'], ['Status', 'status'],
  ];

  return (
    <DashboardLayout pageTitle="">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/inventory')} className="text-gray-500 hover:text-gray-800">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add Medication</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/inventory')} className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: '#00808d' }}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-100">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="flex gap-6 items-start">
          <div className="flex-1 flex flex-col gap-5 bg-[#f5f5f5] rounded-2xl p-6">
            {fields.slice(0, 2).map(([label, key, type]) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input className={inputCls} type={type || 'text'} min={type === 'number' ? '0' : undefined} value={form[key]} onChange={(e) => set(key, e.target.value)} />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>SKU / Barcode</label><input className={inputCls} value={form.sku} onChange={(e) => { set('sku', e.target.value); set('barcodeData', e.target.value); }} /></div>
              <div><label className={labelCls}>Batch / Lot Number</label><input className={inputCls} value={form.batchLotNumber} onChange={(e) => set('batchLotNumber', e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Risk</label><SelectWrap><select className={selectCls} value={form.risk} onChange={(e) => set('risk', e.target.value)}><option value="" />{RISK_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select></SelectWrap></div>
              <div><label className={labelCls}>Shelf ID</label><SelectWrap><select className={selectCls} value={form.shelfId} onChange={(e) => set('shelfId', e.target.value)}><option value="" />{SHELF_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select></SelectWrap></div>
            </div>

            <div>
              <label className={labelCls}>Expiry Date</label>
              <div className="grid grid-cols-2 gap-4">
                <SelectWrap><select className={selectCls} value={form.expiryMonth} onChange={(e) => set('expiryMonth', e.target.value)}>{MONTHS.map((m) => <option key={m}>{m}</option>)}</select></SelectWrap>
                <SelectWrap><select className={selectCls} value={form.expiryYear} onChange={(e) => set('expiryYear', e.target.value)}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></SelectWrap>
              </div>
            </div>

            {fields.slice(2).map(([label, key, type]) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input className={inputCls} type={type || 'text'} min={type === 'number' ? '0' : undefined} value={form[key]} onChange={(e) => set(key, e.target.value)} />
              </div>
            ))}

            <div>
              <label className={labelCls}>Category</label>
              <SelectWrap><select className={selectCls} value={form.category} onChange={(e) => set('category', e.target.value)}><option value="" />{CATEGORY_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select></SelectWrap>
            </div>
          </div>

          <div className="w-64 flex-shrink-0">
            <label className={labelCls}>Medication Photo</label>
            <button type="button" onClick={() => photoInputRef.current?.click()} className="w-full aspect-square rounded-xl border border-gray-200 bg-[#f5f5f5] flex items-center justify-center hover:bg-gray-100 overflow-hidden">
              {photoPreview ? <img src={photoPreview} alt="Medication" className="w-full h-full object-cover" /> : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              )}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            {photoPreview && <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); setPhotoUrl(''); }} className="mt-2 w-full text-xs text-red-500 hover:text-red-700">Remove photo</button>}
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}