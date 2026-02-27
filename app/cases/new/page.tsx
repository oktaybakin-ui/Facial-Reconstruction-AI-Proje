'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Sex, DepthCategory } from '@/types/cases';

const regions = [
  'Alın',
  'Göz kapağı',
  'Burun kanadı',
  'Burun sırtı',
  'Yanak',
  'Üst dudak',
  'Alt dudak',
  'Çene',
  'Kulak',
  'Diğer',
];

const criticalStructuresOptions = [
  'Alar rim',
  'Eyelid margin',
  'Lip commissure',
  'Nostril',
  'Nasal tip',
  'Columella',
  'Philtrum',
  'Diğer',
];

const STEPS = [
  { id: 1, title: 'Hasta Bilgileri', description: 'Temel hasta ve vaka bilgileri' },
  { id: 2, title: 'Defekt Bilgileri', description: 'Lezyon ve defekt detayları' },
  { id: 3, title: 'Fotoğraf & Kaydet', description: 'Fotoğraf yükle ve kaydet' },
];

/* ------------------------------------------------------------------ */
/*  SVG Icon components                                                */
/* ------------------------------------------------------------------ */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function CloudUploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Step Progress Bar                                                  */
/* ------------------------------------------------------------------ */

function StepProgressBar({ currentStep }: { currentStep: number }) {
  const stepIcons = [UserIcon, ClipboardIcon, CameraIcon];

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const StepIcon = stepIcons[idx];
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.id} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5">
                  <div
                    className={`h-full transition-colors duration-300 ${
                      isCompleted ? 'bg-cyan-700' : 'bg-slate-200'
                    }`}
                  />
                </div>
              )}

              {/* Circle */}
              <div
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-cyan-700 border-cyan-700 text-white'
                    : isCurrent
                    ? 'bg-white border-cyan-700 text-cyan-700 shadow-md'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                <p
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-xs mt-0.5 hidden sm:block transition-colors duration-300 ${
                    isCurrent ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function NewCasePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    case_code: '',
    age: '',
    sex: '' as Sex | '',
    region: '',
    width_mm: '',
    height_mm: '',
    depth: '' as DepthCategory | '',
    previous_surgery: false,
    previous_radiotherapy: false,
    pathology_suspected: '',
    critical_structures: [] as string[],
    high_aesthetic_zone: false,
    case_date: '',
    case_time: '',
    case_duration_minutes: '',
    patient_special_condition: '',
    operation_date: '',
    followup_days: '21',
  });

  /* ---- Photo handling ---- */

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyaları yüklenebilir.');
      return;
    }

    setPhotoFile(file);
    setUploadingPhoto(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUploadingPhoto(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fotoğraf okuma hatası');
      setUploadingPhoto(false);
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ---- Submit ---- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Oturum açmanız gerekli');

      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined,
          width_mm: formData.width_mm ? parseFloat(formData.width_mm) : undefined,
          height_mm: formData.height_mm ? parseFloat(formData.height_mm) : undefined,
          sex: formData.sex || undefined,
          depth: formData.depth || undefined,
          case_date: formData.case_date || undefined,
          case_time: formData.case_time || undefined,
          case_duration_minutes: formData.case_duration_minutes ? parseInt(formData.case_duration_minutes) : undefined,
          patient_special_condition: formData.patient_special_condition || undefined,
          operation_date: formData.operation_date || undefined,
          followup_days: formData.followup_days ? parseInt(formData.followup_days) : undefined,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);

        if (response.status === 401 || response.status === 403) {
          alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          router.push('/auth/login');
          return;
        }

        throw new Error(data.error || 'Olgu oluşturulamadı');
      }

      console.log('Case created successfully:', data.case.id);
      const caseId = data.case.id;

      if (photoFile) {
        try {
          const fileExt = photoFile.name.split('.').pop();
          const timestamp = Date.now();
          const fileName = `preop-${caseId}-${timestamp}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          console.log('Uploading pre-op photo after case creation:', filePath);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('case-photos')
            .upload(filePath, photoFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
            setError('Fotoğraf yüklenemedi: ' + uploadError.message);
          } else {
            // Store storage path (not full URL) for security
            const storagePath = uploadData.path;
            console.log('Photo uploaded, path:', storagePath);

            const { error: photoInsertError } = await supabase
              .from('case_photos')
              .insert({
                case_id: caseId,
                type: 'preop',
                url: storagePath,
              });

            if (photoInsertError) {
              console.error('Photo insert error:', photoInsertError);
              setError('Fotoğraf kaydı oluşturulamadı: ' + photoInsertError.message);
            } else {
              console.log('Photo record created successfully');
            }
          }
        } catch (photoErr: unknown) {
          console.error('Error uploading photo:', photoErr);
          setError('Fotoğraf yükleme hatası: ' + (photoErr instanceof Error ? photoErr.message : String(photoErr)));
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      window.location.href = `/cases/${caseId}`;
    } catch (err: unknown) {
      console.error('Error creating case:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setLoading(false);
    }
  };

  /* ---- Critical structures toggle ---- */

  const toggleCriticalStructure = (structure: string) => {
    setFormData((prev) => ({
      ...prev,
      critical_structures: prev.critical_structures.includes(structure)
        ? prev.critical_structures.filter((s) => s !== structure)
        : [...prev.critical_structures, structure],
    }));
  };

  /* ---- Step validation ---- */

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.case_code.trim() !== '';
      case 2:
        return formData.region !== '';
      default:
        return true;
    }
  };

  const [stepErrors, setStepErrors] = useState<string | null>(null);

  const goToNextStep = () => {
    if (!canProceedFromStep(currentStep)) {
      if (currentStep === 1) {
        setStepErrors('Olgu Kodu / Protokol No alanı zorunludur.');
      } else if (currentStep === 2) {
        setStepErrors('Lezyon Bölgesi seçimi zorunludur.');
      }
      return;
    }
    setStepErrors(null);
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const goToPrevStep = () => {
    setStepErrors(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  /* ---- Shared select class ---- */
  const selectClass =
    'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 hover:border-slate-300 transition-colors duration-150 appearance-none';

  /* ---- Shared checkbox style ---- */
  const checkboxClass =
    'h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-600 focus:ring-offset-0 cursor-pointer accent-cyan-700';

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-cyan-700">
              {`AI Yüz Rekonstrüksiyon Platformu`}
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Yeni Olgu Ekle</h1>
          <p className="text-sm text-slate-500 mt-1">{`Hasta bilgilerini ve defekt detaylarını girin`}</p>
        </div>

        {/* Step Progress */}
        <StepProgressBar currentStep={currentStep} />

        {/* Error banner */}
        {(error || stepErrors) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{stepErrors || error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* ====================================================== */}
          {/*  STEP 1 - Hasta Bilgileri                               */}
          {/* ====================================================== */}
          {currentStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Hasta Bilgileri</h2>
                  <p className="text-xs text-slate-500">Temel hasta ve vaka bilgileri</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Case code & Age */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Olgu Kodu / Protokol No"
                    required
                    value={formData.case_code}
                    onChange={(e) => setFormData({ ...formData, case_code: e.target.value })}
                    placeholder={'Örneğin: CASE-2024-001'}
                  />
                  <Input
                    label={`Yaş`}
                    type="number"
                    min={0}
                    max={120}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder={'Örneğin: 45'}
                  />
                </div>

                {/* Sex */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Cinsiyet</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value as Sex })}
                    className={selectClass}
                  >
                    <option value="">{`Seçiniz`}</option>
                    <option value="M">Erkek</option>
                    <option value="F">{`Kadın`}</option>
                    <option value="Other">{`Diğer`}</option>
                  </select>
                </div>

                {/* Case date / time / duration row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Input
                    label="Vaka Tarihi"
                    type="date"
                    value={formData.case_date}
                    onChange={(e) => setFormData({ ...formData, case_date: e.target.value })}
                  />
                  <Input
                    label="Vaka Saati"
                    type="time"
                    value={formData.case_time}
                    onChange={(e) => setFormData({ ...formData, case_time: e.target.value })}
                  />
                  <Input
                    label={`Vaka Süresi (dakika)`}
                    type="number"
                    min={0}
                    value={formData.case_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, case_duration_minutes: e.target.value })}
                    placeholder={'Örn: 120'}
                  />
                </div>

                {/* Operation date / Followup */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Operasyon Tarihi"
                    type="date"
                    value={formData.operation_date}
                    onChange={(e) => setFormData({ ...formData, operation_date: e.target.value })}
                  />
                  <Input
                    label={`Kontrol Süresi (gün)`}
                    type="number"
                    min={1}
                    value={formData.followup_days}
                    onChange={(e) => setFormData({ ...formData, followup_days: e.target.value })}
                    placeholder={`Varsayılan: 21 gün`}
                    hint={`Kontrol tarihi otomatik hesaplanacak`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/*  STEP 2 - Defekt Bilgileri                              */}
          {/* ====================================================== */}
          {currentStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700">
                  <ClipboardIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Defekt Bilgileri</h2>
                  <p className="text-xs text-slate-500">{`Lezyon bölgesi, boyut ve özellikler`}</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Region */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    {`Lezyon Bölgesi`} <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">{`Seçiniz`}</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label={`Defekt Boyutu (mm) – En`}
                    type="number"
                    step={0.1}
                    min={0}
                    value={formData.width_mm}
                    onChange={(e) => setFormData({ ...formData, width_mm: e.target.value })}
                    placeholder={'Örn: 15.0'}
                  />
                  <Input
                    label={`Defekt Boyutu (mm) – Boy`}
                    type="number"
                    step={0.1}
                    min={0}
                    value={formData.height_mm}
                    onChange={(e) => setFormData({ ...formData, height_mm: e.target.value })}
                    placeholder={'Örn: 20.0'}
                  />
                </div>

                {/* Depth */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Derinlik</label>
                  <select
                    value={formData.depth}
                    onChange={(e) => setFormData({ ...formData, depth: e.target.value as DepthCategory })}
                    className={selectClass}
                  >
                    <option value="">{`Seçiniz`}</option>
                    <option value="skin">Cilt</option>
                    <option value="skin+subcutis">Cilt+Subkutan</option>
                    <option value="muscle">Kas</option>
                    <option value="mucosa">Mukozaya Uzanan</option>
                  </select>
                </div>

                {/* Pathology */}
                <Input
                  label="Tahmini Patoloji"
                  value={formData.pathology_suspected}
                  onChange={(e) => setFormData({ ...formData, pathology_suspected: e.target.value })}
                  placeholder={'Örn: BCC, SCC, vb.'}
                />

                {/* History checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.previous_surgery}
                      onChange={(e) => setFormData({ ...formData, previous_surgery: e.target.checked })}
                      className={checkboxClass}
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">{`Önceki Cerrahi Var mı?`}</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.previous_radiotherapy}
                      onChange={(e) => setFormData({ ...formData, previous_radiotherapy: e.target.checked })}
                      className={checkboxClass}
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">{`Önceki Radyoterapi Var mı?`}</span>
                  </label>
                </div>

                {/* Critical Structures */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{`Kritik Yapılar`}</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {criticalStructuresOptions.map((structure) => (
                      <label
                        key={structure}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={formData.critical_structures.includes(structure)}
                          onChange={() => toggleCriticalStructure(structure)}
                          className={checkboxClass}
                        />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900">{structure}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Aesthetic Zone */}
                <label className="flex items-center gap-3 cursor-pointer group pt-1">
                  <input
                    type="checkbox"
                    checked={formData.high_aesthetic_zone}
                    onChange={(e) => setFormData({ ...formData, high_aesthetic_zone: e.target.checked })}
                    className={checkboxClass}
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">
                    {`Yüksek Estetik Zon`}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/*  STEP 3 - Fotoğraf & Kaydet                             */}
          {/* ====================================================== */}
          {currentStep === 3 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700">
                  <CameraIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{`Fotoğraf & Kaydet`}</h2>
                  <p className="text-xs text-slate-500">{`Pre-op fotoğraf yükleyin ve olguyu kaydedin`}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Drag & Drop upload zone */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">{`Pre-op Fotoğraf`}</label>

                  {!photoUrl ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                        isDragOver
                          ? 'border-cyan-600 bg-cyan-50'
                          : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <CloudUploadIcon
                        className={`w-10 h-10 mb-3 transition-colors duration-200 ${
                          isDragOver ? 'text-cyan-600' : 'text-slate-400'
                        }`}
                      />
                      <p className="text-sm font-medium text-slate-700">
                        {`Dosya Seç veya Sürükle Bırak`}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP - Maks. 10MB</p>

                      {uploadingPhoto && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                          <svg className="animate-spin h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={photoUrl}
                        alt={`Pre-op önizleme`}
                        className="w-full max-h-[320px] object-contain bg-slate-50"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-lg shadow-md px-4 py-2 flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                          {`Kaldır`}
                        </button>
                      </div>
                      <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckIcon className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm text-slate-700 font-medium">
                            {photoFile?.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {photoFile && (photoFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Patient special condition (notes) */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    {`Hastanın Özel Durumu / Özelliği`}
                  </label>
                  <textarea
                    value={formData.patient_special_condition}
                    onChange={(e) => setFormData({ ...formData, patient_special_condition: e.target.value })}
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 hover:border-slate-300 transition-colors duration-150 resize-none"
                    placeholder={'Örn: Diyabet, hipertansiyon, alerji, önceki cerrahi, vb.'}
                  />
                  <p className="text-xs text-slate-500">{`Operasyon öncesi önemli notlar ve hasta özellikleri`}</p>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================== */}
          {/*  Step Navigation                                         */}
          {/* ====================================================== */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              {currentStep > 1 ? (
                <Button type="button" variant="secondary" size="lg" onClick={goToPrevStep}>
                  <ArrowLeftIcon className="w-4 h-4" />
                  Geri
                </Button>
              ) : (
                <Link href="/dashboard">
                  <Button type="button" variant="secondary" size="lg">
                    {`İptal`}
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 3 ? (
                <Button type="button" variant="primary" size="lg" onClick={goToNextStep}>
                  Sonraki
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="submit" variant="primary" size="lg" loading={loading}>
                  Kaydet
                </Button>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
