import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useDataSource } from '../context/DataSourceContext';
import { getDummyMedicationById } from '../data/dummyMedications';
import { medicationService } from '../services/medicationService';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR + i));

const RISK_OPTIONS     = ['Low', 'Medium', 'High', 'Critical'];
const SHELF_OPTIONS    = ['A1','A2','A3','B1','B2','B3','C1','C2','C3','Refrigerated','Controlled'];
const CATEGORY_OPTIONS = ['Analgesic','Antibiotic','Antihypertensive','Antihistamine','Antidiabetic','Cardiovascular','Gastrointestinal','Neurological','Oncology','Other'];

const inputCls  = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-[#00808d] focus:ring-1 focus:ring-[#00808d] transition-colors';
const selectCls = `${inputCls} cursor-pointer appearance-none`;
const labelCls  = 'block text-sm font-medium text-gray-700 mb-1.5';

function SelectWrapper({ children }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#00808d]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

export const EditMedicationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { useDummy } = useDataSource();

  const photoInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    medicationName: '',
    brandName: '',
    risk: '',
    shelfId: '',
    expiryMonth: MONTHS[new Date().getMonth()],
    expiryYear: String(CURRENT_YEAR),
    currentStock: '',
    supplierName: '',
    supplierContact: '',
    status: '',
    category: '',
    sku: '',
    barcodeData: '',
    batchLotNumber: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoMode, setPhotoMode] = useState('upload'); // upload | camera
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // Load medication
  useEffect(() => {
    let alive = true;

    async function runLive() {
      setLoading(true);
      setError('');
      try {
        const res = await medicationService.getById(id);
        const med = res?.data || {};
        if (!alive) return;

        setForm((p) => ({
          ...p,
          medicationName: med.medicationName || '',
          brandName: med.brandName || '',
          risk: med.risk || '',
          shelfId: med.shelfId || '',
          expiryMonth: med.expiryMonth || p.expiryMonth,
          expiryYear: med.expiryYear || p.expiryYear,
          currentStock: (typeof med.currentStock === 'number' ? String(med.currentStock) : (med.currentStock || '')),
          supplierName: med.supplierName || '',
          supplierContact: med.supplierContact || '',
          status: med.status || '',
          category: med.category || '',
          sku: med.sku || '',
          barcodeData: med.barcodeData || '',
          batchLotNumber: med.batchLotNumber || '',
        }));

        const url = med.photoUrl || '';
        setPhotoPreview(url || null);
        setPhotoFile(null);
      } catch (e) {
        if (!alive) return;
        const med = location?.state?.medication || null;
        if (med) {
          setForm((p) => ({
            ...p,
            medicationName: med.medicationName || '',
            brandName: med.brandName || '',
            risk: med.risk || '',
            shelfId: med.shelfId || '',
            expiryMonth: med.expiryMonth || p.expiryMonth,
            expiryYear: med.expiryYear || p.expiryYear,
            currentStock: (typeof med.currentStock === 'number' ? String(med.currentStock) : (med.currentStock || '')),
            supplierName: med.supplierName || '',
            supplierContact: med.supplierContact || '',
            status: med.status || '',
            category: med.category || '',
            sku: med.sku || '',
            barcodeData: med.barcodeData || '',
            batchLotNumber: med.batchLotNumber || '',
          }));
          setPhotoPreview(med.photoUrl || null);
          setPhotoFile(null);
          setError('');
        } else {
          setError(e?.message || 'Failed to load medication.');
        }
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    function runDummy() {
      setLoading(true);
      setError('');
      const med = getDummyMedicationById(id);
      if (!med) {
        setError('Dummy medication not found.');
        setLoading(false);
        return;
      }

      setForm((p) => ({
        ...p,
        medicationName: med.medicationName || '',
        brandName: med.brandName || '',
        risk: med.risk || '',
        shelfId: med.shelfId || '',
        expiryMonth: med.expiryMonth || p.expiryMonth,
        expiryYear: med.expiryYear || p.expiryYear,
        currentStock: (typeof med.currentStock === 'number' ? String(med.currentStock) : (med.currentStock || '')),
        supplierName: med.supplierName || '',
        supplierContact: med.supplierContact || '',
        status: med.status || '',
        category: med.category || '',
        sku: med.sku || '',
        barcodeData: med.barcodeData || '',
        batchLotNumber: med.batchLotNumber || '',
      }));

      setPhotoPreview(med.photoUrl || null);
      setPhotoFile(null);
      setLoading(false);
    }

    if (!id) return () => { alive = false; };

    if (useDummy) runDummy();
    else runLive();

    return () => { alive = false; };
  }, [id, useDummy, location?.state]);

  const handlePhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const stopCamera = () => {
    try {
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
    } catch {}
    streamRef.current = null;
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser.');
      return;
    }
    try {
      // Camera access only works on HTTPS (or localhost). On HTTP deployments it will be blocked by the browser.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError('Camera permission denied or unavailable. If you are not on HTTPS, camera will not work.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `medication-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      stopCamera();
      setPhotoMode('upload');
    }, 'image/jpeg', 0.9);
  }
};