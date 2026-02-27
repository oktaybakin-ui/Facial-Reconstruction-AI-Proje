'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import UnifiedImageOverlay, { type Annotation, type AnnotationShape } from './UnifiedImageOverlay';
import type { Case, CasePhoto } from '@/types/cases';
import type { AIResult, FlapSuggestion } from '@/types/ai';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import ThreeDToggle from '@/components/ui/ThreeDToggle';
import MultiPhotoUpload from '@/components/ui/MultiPhotoUpload';
import ValidationScoreBadge from '@/components/ui/ValidationScoreBadge';
import ValidationIssuesList from '@/components/ui/ValidationIssuesList';
import AnatomicalOverlay from '@/components/ui/AnatomicalOverlay';
import VectorExportButton from '@/components/ui/VectorExportButton';
import FeedbackDialog from '@/components/ui/FeedbackDialog';
import Face3DViewer from '@/components/ui/Face3DViewer';
import { validateFlapDrawingClient } from '@/lib/face-detection/validation-client';

interface CaseDetailContentProps {
  caseData: Case;
  photos: CasePhoto[];
  aiResult: AIResult | null;
  userId: string;
}

export default function CaseDetailContent({
  caseData,
  photos,
  aiResult,
  userId,
}: CaseDetailContentProps) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();
  const { success, error: showError } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIResult | null>(aiResult);

  // Update analysisResult when aiResult prop changes
  useEffect(() => {
    if (aiResult) {
      setAnalysisResult(aiResult);
    }
  }, [aiResult]);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPostop, setUploadingPostop] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotation, setAnnotation] = useState<Annotation | null>(null);
  const [annotationShape, setAnnotationShape] = useState<AnnotationShape>('rectangle');
  const [imageInfo, setImageInfo] = useState<{ naturalWidth: number; naturalHeight: number; displayedWidth: number; displayedHeight: number } | null>(null);
  const [showFlapDrawings, setShowFlapDrawings] = useState(true);
  const [selectedFlapIndex, setSelectedFlapIndex] = useState<number | undefined>(undefined);
  const [enable3D, setEnable3D] = useState(false);
  const [faceImages3D, setFaceImages3D] = useState<string[]>([]);
  const [showAnatomicalOverlay, setShowAnatomicalOverlay] = useState(false);
  const [overlayType, setOverlayType] = useState<'guide-lines' | 'golden-ratio' | 'muscle-map' | 'bone-map'>('guide-lines');
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedFlapForFeedback, setSelectedFlapForFeedback] = useState<{ index: number; name: string } | null>(null);
  const [validatingClient, setValidatingClient] = useState<{ [key: number]: boolean }>({});

  const preopPhoto = photos.find((p) => p.type === 'preop');
  const postopPhotos = photos.filter((p) => p.type === 'postop');

  // Debug: Check why button might not be visible
  console.log('CaseDetailContent Debug:', {
    hasPreopPhoto: !!preopPhoto,
    hasAnalysisResult: !!analysisResult,
    photosCount: photos.length,
    photos: photos.map(p => ({ id: p.id, type: p.type, url: p.url?.substring(0, 50) + '...' })),
    aiResult: aiResult ? 'present' : 'null'
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      // Validate userId and caseData.id
      if (!userId) {
        throw new Error('Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.');
      }
      
      if (!caseData?.id) {
        throw new Error('Olgu kimliği bulunamadı.');
      }
      
      console.log('Starting AI analysis for case:', caseData.id, 'user:', userId);
      console.log('Type check - caseId:', typeof caseData.id, 'userId:', typeof userId);
      console.log('Full caseData:', caseData);
      console.log('Full userId prop:', userId);
      
      // Check if pre-op photo exists
      if (!preopPhoto) {
        throw new Error('Önce pre-op fotoğraf yüklemelisiniz!');
      }

      // CRITICAL: Require manual annotation before analysis
      if (!annotation) {
        throw new Error('Lütfen önce lezyon bölgesini işaretleyin! "Lezyonu İşaretle" butonuna tıklayıp fotoğraf üzerinde lezyon alanını çizin.');
      }

      // Normalize annotation coordinates to 0-1000 using DISPLAYED (what user sees) dimensions
      // This ensures perfect alignment - annotation is already in displayed coordinates
      let normalizedAnnotation = null;
      
      if (annotation && imageInfo) {
        // Annotation is already in displayed (canvas) pixel coordinates
        // Normalize directly to 0-1000 based on displayed dimensions
        // This matches what user sees on screen exactly
        
        const shape = annotation.shape || 'rectangle';
        
        if (shape === 'circle') {
          // For circle: normalize center and radius
          const centerX = annotation.x + annotation.width / 2;
          const centerY = annotation.y + annotation.height / 2;
          const radius = Math.max(Math.abs(annotation.width), Math.abs(annotation.height)) / 2;
          
          normalizedAnnotation = {
            x: (centerX / imageInfo.displayedWidth) * 1000 - (radius / imageInfo.displayedWidth) * 1000,
            y: (centerY / imageInfo.displayedHeight) * 1000 - (radius / imageInfo.displayedHeight) * 1000,
            width: (radius * 2 / imageInfo.displayedWidth) * 1000,
            height: (radius * 2 / imageInfo.displayedHeight) * 1000,
            shape: 'circle',
            displayed_width: imageInfo.displayedWidth,
            displayed_height: imageInfo.displayedHeight,
          };
        } else if (shape === 'polygon' && annotation.points && annotation.points.length > 0) {
          // For polygon: normalize points
          const normalizedPoints = annotation.points.map(point => ({
            x: (point.x / imageInfo.displayedWidth) * 1000,
            y: (point.y / imageInfo.displayedHeight) * 1000,
          }));
          
          // Calculate bounding box for polygon
          const minX = Math.min(...normalizedPoints.map(p => p.x));
          const minY = Math.min(...normalizedPoints.map(p => p.y));
          const maxX = Math.max(...normalizedPoints.map(p => p.x));
          const maxY = Math.max(...normalizedPoints.map(p => p.y));
          
          normalizedAnnotation = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            shape: 'polygon',
            points: normalizedPoints,
            displayed_width: imageInfo.displayedWidth,
            displayed_height: imageInfo.displayedHeight,
          };
        } else {
          // Rectangle: normalize x, y, width, height
          normalizedAnnotation = {
            x: (annotation.x / imageInfo.displayedWidth) * 1000,
            y: (annotation.y / imageInfo.displayedHeight) * 1000,
            width: (annotation.width / imageInfo.displayedWidth) * 1000,
            height: (annotation.height / imageInfo.displayedHeight) * 1000,
            shape: 'rectangle',
            displayed_width: imageInfo.displayedWidth,
            displayed_height: imageInfo.displayedHeight,
          };
        }
        
        console.log('🔍 Annotation normalization (displayed dimensions):', {
          'Shape': shape,
          'Canvas coords (pixels)': annotation,
          'Displayed dimensions': { width: imageInfo.displayedWidth, height: imageInfo.displayedHeight },
          'Normalized (0-1000)': normalizedAnnotation,
        });
      } else if (annotation) {
        console.warn('⚠️ Annotation exists but imageInfo is missing - cannot normalize correctly');
        throw new Error('Görüntü bilgisi eksik. Lütfen sayfayı yenileyip tekrar deneyin.');
      }

      // Validate 3D mode requirements
      if (enable3D) {
        if (!faceImages3D || faceImages3D.length !== 9) {
          throw new Error(`3D mod için 9 adet fotoğraf zorunludur. Şu an yüklenen: ${faceImages3D.length} adet.`);
        }
      }

      const requestBody: Record<string, unknown> = {
        user_id: userId,
        manual_annotation: normalizedAnnotation,
      };

      // Add 3D parameters if enabled
      if (enable3D) {
        requestBody.enable_3d = true;
        requestBody.face_images_3d = faceImages3D;
      }

      console.log('Request body to send:', requestBody);

      const response = await fetch(`/api/cases/${caseData.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('AI Analysis error:', data);
        const errorMessage = data.error || data.details || 'Analiz başarısız';
        const hint = data.hint ? `\n\nİpucu: ${data.hint}` : '';
        throw new Error(errorMessage + hint);
      }

      console.log('AI Analysis successful:', data.result);
      setAnalysisResult(data.result);
      
      // Wait a moment then refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      router.refresh();
    } catch (err: unknown) {
      console.error('AI Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analiz sırasında hata oluştu. Konsolu kontrol edin (F12).');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePostopUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPostop(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `postop-${timestamp}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log('Uploading post-op photo to path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('case-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      console.log('Post-op upload result:', uploadData, uploadError);

      if (uploadError) throw uploadError;

      // Store storage path (not full URL) for security
      const storagePath = uploadData.path;

      // Insert photo record
      const { error: insertError } = await supabase
        .from('case_photos')
        .insert({
          case_id: caseData.id,
          type: 'postop',
          url: storagePath,
        });

      if (insertError) throw insertError;

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fotoğraf yükleme hatası');
    } finally {
      setUploadingPostop(false);
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'en_uygun':
        return 'En Uygun';
      case 'uygun':
        return 'Uygun';
      case 'alternatif':
        return 'Alternatif';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'en_uygun':
        return 'bg-green-100 text-green-800';
      case 'uygun':
        return 'bg-blue-100 text-blue-800';
      case 'alternatif':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteCase = async (caseId: string, caseCode: string) => {
    confirm({
      title: 'Olgu Sil',
      message: `"${caseCode}" olgusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      onConfirm: async () => {
        try {
          if (!userId) {
            showError('Oturum açmanız gerekiyor');
            return;
          }

          const response = await fetch(`/api/cases/${caseId}?user_id=${userId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Olgu silinemedi');
          }

          success('Olgu başarıyla silindi');
          router.push('/dashboard');
        } catch (err: unknown) {
          console.error('Error deleting case:', err);
          showError(err instanceof Error ? err.message : 'Olgu silinirken bir hata oluştu');
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      {/* Modern Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold gradient-text hover:opacity-80 transition-opacity">
              AI Yüz Rekonstrüksiyon Platformu
            </Link>
            <Link
              href="/dashboard"
              className="btn-secondary text-sm"
            >
              ← Dashboard&apos;a Dön
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Modern Case Summary Card */}
        <div className="card-hover animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Olgu Detayı
              </h1>
              <p className="text-3xl font-extrabold gradient-text">{caseData.case_code}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/cases/${caseData.id}/edit`}
                className="btn-secondary text-sm"
              >
                ✏️ Düzenle
              </Link>
              <button
                onClick={() => handleDeleteCase(caseData.id, caseData.case_code)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                🗑️ Sil
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="text-xs text-gray-500 mb-1">Bölge</div>
              <div className="font-semibold text-gray-900">{caseData.region}</div>
            </div>
            {caseData.age && (
              <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="text-xs text-gray-500 mb-1">Yaş</div>
                <div className="font-semibold text-gray-900">{caseData.age}</div>
              </div>
            )}
            {caseData.sex && (
              <div className="p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                <div className="text-xs text-gray-500 mb-1">Cinsiyet</div>
                <div className="font-semibold text-gray-900">{caseData.sex}</div>
              </div>
            )}
            {caseData.width_mm && caseData.height_mm && (
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="text-xs text-gray-500 mb-1">Boyut</div>
                <div className="font-semibold text-gray-900">
                  {caseData.width_mm} × {caseData.height_mm} mm
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modern Pre-op Photo Section */}
        {preopPhoto ? (
          <div className="card-hover animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Pre-op Fotoğraf</h2>
                <p className="text-sm text-gray-500">Lezyon bölgesini işaretleyin ve AI analizi çalıştırın</p>
              </div>
              <div className="flex gap-2">
                {analysisResult && analysisResult.flap_suggestions.some(f => f.flap_drawing) && (
                  <button
                    onClick={() => {
                      setShowFlapDrawings(!showFlapDrawings);
                      if (!showFlapDrawings) setShowAnnotation(false);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all text-sm font-medium shadow-md hover:shadow-lg"
                  >
                    {showFlapDrawings ? '👁️ Gizle' : '📐 Göster'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAnnotation(!showAnnotation);
                    if (!showAnnotation) setShowFlapDrawings(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-sm font-medium shadow-md hover:shadow-lg"
                >
                  {showAnnotation ? '✕ Kapat' : '✏️ İşaretle'}
                </button>
              </div>
            </div>
            <div className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden shadow-2xl mb-6 p-4 border border-white/50">
              <div className="relative">
                <UnifiedImageOverlay
                  imageUrl={preopPhoto.url}
                  annotation={annotation}
                  onAnnotationChange={(ann, info) => {
                    setAnnotation(ann);
                    if (info) setImageInfo(info);
                  }}
                  flapSuggestions={showFlapDrawings && analysisResult ? analysisResult.flap_suggestions : []}
                  selectedFlapIndex={selectedFlapIndex}
                  showAnnotationMode={showAnnotation}
                  annotationShape={annotationShape}
                  onShapeChange={(shape) => setAnnotationShape(shape)}
                />
                {showAnatomicalOverlay && imageInfo && (
                  <AnatomicalOverlay
                    imageUrl={preopPhoto.url}
                    overlayType={overlayType}
                    visible={showAnatomicalOverlay}
                    opacity={0.6}
                    imageWidth={imageInfo.naturalWidth}
                    imageHeight={imageInfo.naturalHeight}
                    displayedWidth={imageInfo.displayedWidth}
                    displayedHeight={imageInfo.displayedHeight}
                  />
                )}
              </div>
              {annotation && (
                <div className="mt-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl text-sm text-indigo-800 font-medium">
                  ✅ Lezyon işaretlendi: {Math.round(annotation.width)}px × {Math.round(annotation.height)}px
                </div>
              )}
            </div>
            {!analysisResult ? (
              <div className="space-y-4">
                {!annotation ? (
                  <>
                    <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-md">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <strong className="text-amber-900 block mb-1">Önemli:</strong>
                          <p className="text-sm text-amber-800 mb-2">AI analizi çalıştırmadan önce lezyon bölgesini işaretlemelisiniz!</p>
                          <p className="text-xs text-amber-700">&quot;Lezyonu İşaretle&quot; butonuna tıklayın ve fotoğraf üzerinde lezyon alanını çizin.</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAnnotation(true)}
                      className="btn-primary w-full sm:w-auto"
                    >
                      📝 Önce Lezyonu İşaretle
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl shadow-md">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                          <strong className="text-emerald-900 block mb-1">Lezyon işaretlendi!</strong>
                          <p className="text-sm text-emerald-800">AI çizimleri bu manuel işaretlediğiniz konuma göre yapılacak.</p>
                        </div>
                      </div>
                    </div>

                    {/* 3D Mode Toggle */}
                    <ThreeDToggle
                      enabled={enable3D}
                      onChange={setEnable3D}
                      className="mt-4"
                    />

                    {/* 3D Multi-Photo Upload */}
                    {enable3D && (
                      <div className="mt-4">
                        <MultiPhotoUpload
                          caseId={caseData.id}
                          onUploadComplete={setFaceImages3D}
                          maxPhotos={9}
                          requiredPhotos={9}
                        />
                      </div>
                    )}

                    {/* Analyze Button */}
                    <div className="mt-6">
                      <button
                        onClick={handleAnalyze}
                        disabled={analyzing || (enable3D && faceImages3D.length !== 9)}
                        className={`btn-primary w-full sm:w-auto text-lg ${
                          enable3D && faceImages3D.length !== 9
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        {analyzing ? '🤖 Analiz ediliyor...' : '🚀 AI Analizi Çalıştır →'}
                      </button>
                      {enable3D && faceImages3D.length !== 9 && (
                        <p className="mt-2 text-sm text-red-600">
                          3D mod için 9 adet fotoğraf yüklemelisiniz. Şu an: {faceImages3D.length} / 9
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium">
                ✅ AI analizi tamamlandı. Sonuçlar aşağıda görüntüleniyor.
              </div>
            )}
          </div>
        ) : (
          <div className="card-hover">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pre-op Fotoğraf</h2>
            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-amber-800">
              ⚠️ Pre-op fotoğraf yüklenmemiş. Yeni olgu ekleme sayfasından fotoğraf yükleyebilirsiniz.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-start">
              <div className="text-2xl mr-3">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">AI Analiz Hatası</h3>
                <p className="mb-2">{error}</p>
                {error.includes('quota') || error.includes('429') ? (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <strong>Çözüm Önerileri:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>OpenAI hesabınızda kredi/quota kontrolü yapın: <a href="https://platform.openai.com/account/billing" target="_blank" rel="noopener noreferrer" className="underline">Billing Dashboard</a></li>
                      <li>API key&apos;inizin aktif olduğundan emin olun</li>
                      <li>Gerekirse yeni bir API key oluşturun</li>
                      <li>Ödeme yöntemi ekleyin veya quota limitinizi artırın</li>
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm mt-2 text-gray-600">Lütfen sayfayı yenileyip tekrar deneyin veya daha sonra tekrar deneyin.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modern AI Results */}
        {analysisResult && (
          <div className="space-y-6 animate-fadeIn">
            {/* Modern Vision Summary */}
            <div className="card-hover">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">🔍</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Görüntü Analizi Özeti</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="text-xs text-gray-500 mb-1">Tespit Edilen Bölge</div>
                  <div className="font-semibold text-gray-900">{analysisResult.vision_summary.detected_region}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <div className="text-xs text-gray-500 mb-1">Tahmini Boyut</div>
                  <div className="font-semibold text-gray-900">
                    {analysisResult.vision_summary.estimated_width_mm} × {analysisResult.vision_summary.estimated_height_mm} mm
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="text-xs text-gray-500 mb-1">Derinlik</div>
                  <div className="font-semibold text-gray-900">{analysisResult.vision_summary.depth_estimation}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                  <div className="text-xs text-gray-500 mb-1">Estetik Zon</div>
                  <div className="font-semibold text-gray-900">
                    {analysisResult.vision_summary.aesthetic_zone ? 'Evet' : 'Hayır'}
                  </div>
                </div>
                {analysisResult.vision_summary.critical_structures.length > 0 && (
                  <div className="md:col-span-2 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <div className="text-xs text-gray-500 mb-1">Kritik Yapılar</div>
                    <div className="font-semibold text-gray-900">
                      {analysisResult.vision_summary.critical_structures.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3D Face Model Section */}
            {analysisResult?.enable_3d && analysisResult?.face_3d && (
              <div className="card-hover">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">🎭</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">3D Yüz Modeli</h2>
                </div>
                
                <Face3DViewer
                  modelUrl={analysisResult.face_3d.model_url}
                  status={analysisResult.face_3d.status}
                  confidence={analysisResult.face_3d.confidence}
                  onError={(error) => {
                    console.error('3D Viewer error:', error);
                    setError(`3D model görüntüleme hatası: ${error}`);
                  }}
                />
                
                {analysisResult.face_3d.status === 'completed' && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <p className="text-sm text-gray-700">
                      <strong>Not:</strong> Bu 3D yüz modeli, fotoğraflardan yapay zekâ ile tahmin edilmiştir. 
                      Gerçek cerrahi ölçüm yerine geçmez. Sadece karar destek ve görselleştirme amaçlıdır.
                    </p>
                  </div>
                )}
                
                {analysisResult.face_3d.images_3d && analysisResult.face_3d.images_3d.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Kullanılan Fotoğraflar ({analysisResult.face_3d.images_3d.length} adet)
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {analysisResult.face_3d.images_3d.map((url, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`3D view ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                          <span className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modern Flap Suggestions */}
            <div className="card-hover">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">💡</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Flep Önerileri</h2>
              </div>
              <div className="space-y-4">
                {analysisResult.flap_suggestions.map((flap: FlapSuggestion, index: number) => (
                  <div
                    key={index}
                    className="card-hover border-2 border-transparent hover:border-indigo-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{flap.flap_name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${getCategoryColor(
                              flap.category
                            )}`}
                          >
                            {getCategoryText(flap.category)}
                          </span>
                          <span className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-lg border border-purple-200">
                            Uygunluk: {flap.suitability_score}/100
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {flap.flap_drawing && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedFlapIndex(selectedFlapIndex === index ? undefined : index);
                                setShowFlapDrawings(true);
                                setShowAnnotation(false);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium shadow-md hover:shadow-lg whitespace-nowrap"
                            >
                              {selectedFlapIndex === index ? '✕ Çizimi Kapat' : '📐 Fotoğrafta Göster'}
                            </button>
                            {preopPhoto && (
                              <VectorExportButton
                                imageUrl={preopPhoto.url}
                                flapSuggestion={flap}
                              />
                            )}
                            <button
                              onClick={() => {
                                setSelectedFlapForFeedback({ index, name: flap.flap_name });
                                setFeedbackDialogOpen(true);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm font-medium shadow-md hover:shadow-lg whitespace-nowrap"
                            >
                              💬 Geri Bildirim
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Validation Results */}
                    {flap.validation && (
                      <div className="mb-4 pt-4 border-t-2 border-gray-200 space-y-4">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-xl">✅</span> Çizim Doğruluk Analizi
                        </h4>
                        <ValidationScoreBadge validation={flap.validation} />
                        <ValidationIssuesList validation={flap.validation} />
                      </div>
                    )}

                    <div className="space-y-5">
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <span className="text-indigo-600">💡</span> Neden uygun?
                        </h4>
                        <p className="text-gray-700 leading-relaxed">{flap.why}</p>
                      </div>

                      {flap.advantages.length > 0 && (
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="text-emerald-600">✅</span> Avantajlar
                          </h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1.5">
                            {flap.advantages.map((adv, i) => (
                              <li key={i} className="leading-relaxed">{adv}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {flap.cautions.length > 0 && (
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="text-amber-600">⚠️</span> Dikkat Edilmesi Gerekenler
                          </h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1.5">
                            {flap.cautions.map((caution, i) => (
                              <li key={i} className="leading-relaxed">{caution}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {flap.alternatives.length > 0 && (
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="text-blue-600">🔄</span> Alternatifler
                          </h4>
                          <p className="text-gray-700">{flap.alternatives.join(', ')}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                          <span className="text-sm text-gray-600">Estetik Risk:</span>
                          <span className="ml-2 font-semibold text-gray-900 capitalize">{flap.aesthetic_risk}</span>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                          <span className="text-sm text-gray-600">Fonksiyonel Risk:</span>
                          <span className="ml-2 font-semibold text-gray-900 capitalize">{flap.functional_risk}</span>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                          <span className="text-sm text-gray-600">Komplikasyon Risk:</span>
                          <span className="ml-2 font-semibold text-gray-900 capitalize">{flap.complication_risk}</span>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                          <span className="text-sm text-gray-600">Donor Alan Morbiditesi:</span>
                          <span className="ml-2 font-semibold text-gray-900 capitalize">
                            {flap.donor_site_morbidity === 'minimal' ? 'Minimal' : 
                             flap.donor_site_morbidity === 'moderate' ? 'Orta' : 'Belirgin'}
                          </span>
                        </div>
                      </div>

                      {flap.expected_complications && flap.expected_complications.length > 0 && (
                        <div className="mt-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="text-orange-600">⚠️</span> Olası Komplikasyonlar
                          </h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {flap.expected_complications.map((comp, idx) => (
                              <li key={idx}>{comp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {flap.prevention_strategies && flap.prevention_strategies.length > 0 && (
                        <div className="mt-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span className="text-green-600">🛡️</span> Önleme Stratejileri
                          </h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {flap.prevention_strategies.map((strategy, idx) => (
                              <li key={idx}>{strategy}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {flap.surgical_technique && (
                        <div className="mt-4 pt-5 border-t-2 border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-xl">🔪</span> Cerrahi Teknik
                          </h4>
                          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-gray-800 whitespace-pre-line text-sm leading-relaxed shadow-inner">
                            {flap.surgical_technique}
                          </div>
                        </div>
                      )}
                      
                      {flap.contraindications && flap.contraindications.length > 0 && (
                        <div className="mt-4 pt-5 border-t-2 border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-xl">🚫</span> Kontrendikasyonlar
                          </h4>
                          <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              {flap.contraindications.map((contra, idx) => (
                                <li key={idx} className="font-medium">{contra}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {flap.relative_contraindications && flap.relative_contraindications.length > 0 && (
                        <div className="mt-4 pt-5 border-t-2 border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-xl">⚠️</span> Göreceli Kontrendikasyonlar
                          </h4>
                          <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                              {flap.relative_contraindications.map((contra, idx) => (
                                <li key={idx}>{contra}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {flap.when_to_avoid && flap.when_to_avoid !== 'Belirtilmemiş' && (
                        <div className="mt-4 pt-5 border-t-2 border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-xl">⛔</span> Ne Zaman Kullanılmamalı
                          </h4>
                          <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                            <p className="text-gray-700">{flap.when_to_avoid}</p>
                          </div>
                        </div>
                      )}

                      {flap.comparison_with_alternatives && (
                        <div className="mt-4 pt-5 border-t-2 border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-xl">⚖️</span> Alternatiflerle Karşılaştırma
                          </h4>
                          <div className="space-y-3">
                            {flap.comparison_with_alternatives.better_than && flap.comparison_with_alternatives.better_than.length > 0 && (
                              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <span className="text-green-600">✅</span> Daha İyi Olduğu Durumlar
                                </h5>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                  {flap.comparison_with_alternatives.better_than.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {flap.comparison_with_alternatives.worse_than && flap.comparison_with_alternatives.worse_than.length > 0 && (
                              <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <span className="text-red-600">❌</span> Daha Kötü Olduğu Durumlar
                                </h5>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                  {flap.comparison_with_alternatives.worse_than.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {flap.comparison_with_alternatives.similar_to && flap.comparison_with_alternatives.similar_to.length > 0 && (
                              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <span className="text-blue-600">🔄</span> Benzer Performans Gösteren Flepler
                                </h5>
                                <p className="text-gray-700">{flap.comparison_with_alternatives.similar_to.join(', ')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {flap.postoperative_care && (
                        <div className="mt-4 pt-5 border-t-2 border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-xl">🏥</span> Postoperatif Bakım Planı
                          </h4>
                          <div className="space-y-3">
                            {flap.postoperative_care.immediate && flap.postoperative_care.immediate.length > 0 && (
                              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <span className="text-blue-600">⏰</span> İlk 24 Saat
                                </h5>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                  {flap.postoperative_care.immediate.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {flap.postoperative_care.early && flap.postoperative_care.early.length > 0 && (
                              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <span className="text-green-600">📅</span> İlk Hafta
                                </h5>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                  {flap.postoperative_care.early.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {flap.postoperative_care.late && flap.postoperative_care.late.length > 0 && (
                              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <span className="text-purple-600">📆</span> İlk Ay
                                </h5>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                  {flap.postoperative_care.late.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {flap.postoperative_care.long_term && flap.postoperative_care.long_term.length > 0 && (
                              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <span className="text-amber-600">📊</span> 3+ Ay
                                </h5>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                  {flap.postoperative_care.long_term.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {flap.follow_up_schedule && (
                        <div className="mt-4 pt-5 border-t-2 border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-xl">📋</span> Takip Programı
                          </h4>
                          <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-3">
                                <span className="font-semibold text-gray-700 min-w-[80px]">1. Gün:</span>
                                <span className="text-gray-600">{flap.follow_up_schedule.day_1}</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <span className="font-semibold text-gray-700 min-w-[80px]">7. Gün:</span>
                                <span className="text-gray-600">{flap.follow_up_schedule.day_7}</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <span className="font-semibold text-gray-700 min-w-[80px]">14. Gün:</span>
                                <span className="text-gray-600">{flap.follow_up_schedule.day_14}</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <span className="font-semibold text-gray-700 min-w-[80px]">1. Ay:</span>
                                <span className="text-gray-600">{flap.follow_up_schedule.month_1}</span>
                              </div>
                              <div className="flex items-start gap-3">
                                <span className="font-semibold text-gray-700 min-w-[80px]">3. Ay:</span>
                                <span className="text-gray-600">{flap.follow_up_schedule.month_3}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-5 border-t-2 border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-xl">📊</span> Cerrahi Bilgileri
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {flap.estimated_surgery_time && flap.estimated_surgery_time !== 'Belirtilmemiş' && (
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                              <span className="text-sm text-gray-600">Tahmini Süre:</span>
                              <span className="ml-2 font-semibold text-gray-900">{flap.estimated_surgery_time}</span>
                            </div>
                          )}
                          {flap.estimated_cost_range && flap.estimated_cost_range !== 'Belirtilmemiş' && (
                            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                              <span className="text-sm text-gray-600">Maliyet:</span>
                              <span className="ml-2 font-semibold text-gray-900">{flap.estimated_cost_range}</span>
                            </div>
                          )}
                          {flap.complexity_level && (
                            <div className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                              <span className="text-sm text-gray-600">Kompleksite:</span>
                              <span className="ml-2 font-semibold text-gray-900 capitalize">{flap.complexity_level}</span>
                            </div>
                          )}
                          {flap.technical_difficulty && (
                            <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                              <span className="text-sm text-gray-600">Teknik Zorluk:</span>
                              <span className="ml-2 font-semibold text-gray-900 capitalize">{flap.technical_difficulty}</span>
                            </div>
                          )}
                          {flap.evidence_level && (
                            <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                              <span className="text-sm text-gray-600">Kanıt Seviyesi:</span>
                              <span className="ml-2 font-semibold text-gray-900 capitalize">{flap.evidence_level}</span>
                            </div>
                          )}
                          {flap.success_rate && flap.success_rate !== 'Belirtilmemiş' && (
                            <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                              <span className="text-sm text-gray-600">Başarı Oranı:</span>
                              <span className="ml-2 font-semibold text-gray-900">{flap.success_rate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modern Safety Review */}
            {analysisResult.safety_review && (
              <div className="card-hover border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Güvenlik İncelemesi</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">{analysisResult.safety_review.legal_disclaimer}</p>
                {analysisResult.safety_review.comments.length > 0 && (
                  <div className="p-4 bg-white/60 rounded-xl border border-amber-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Notlar:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {analysisResult.safety_review.comments.map((comment, i) => (
                        <li key={i} className="leading-relaxed">{comment}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Modern Legal Disclaimer */}
            <div className="card-hover border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Önemli:</strong> Bu öneriler yalnızca karar destek amaçlıdır; nihai karar, hastayı 
                değerlendiren klinik ekibe aittir.
              </p>
            </div>
          </div>
        )}

        {/* Modern Post-op Photos */}
        <div className="card-hover animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">📷</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Post-op Fotoğraflar</h2>
          </div>
          
          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={handlePostopUpload}
              disabled={uploadingPostop}
              className="input-modern"
            />
            {uploadingPostop && (
              <p className="mt-3 text-sm text-indigo-600 font-medium flex items-center gap-2">
                <span className="animate-spin">⏳</span> Yükleniyor...
              </p>
            )}
          </div>

          {postopPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {postopPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={photo.url}
                    alt="Post-op"
                    fill
                    className="object-contain"
                    unoptimized
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Henüz post-op fotoğraf yüklenmemiş.</p>
          )}
        </div>
      </main>

      {/* Feedback Dialog */}
      {feedbackDialogOpen && selectedFlapForFeedback && (
        <FeedbackDialog
          caseId={caseData.id}
          flapSuggestionId={`flap-${selectedFlapForFeedback.index}`}
          flapName={selectedFlapForFeedback.name}
          isOpen={feedbackDialogOpen}
          onClose={() => {
            setFeedbackDialogOpen(false);
            setSelectedFlapForFeedback(null);
          }}
          onFeedbackSubmitted={() => {
            success('Geri bildiriminiz kaydedildi. Teşekkürler!');
          }}
        />
      )}
    </div>
  );
}

