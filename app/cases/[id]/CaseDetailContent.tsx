'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import UnifiedImageOverlay from './UnifiedImageOverlay';
import type { Case, CasePhoto } from '@/types/cases';
import type { AIResult, FlapSuggestion } from '@/types/ai';

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
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIResult | null>(aiResult);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPostop, setUploadingPostop] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [annotation, setAnnotation] = useState<{ x: number; y: number; width: number; height: number; shape?: 'rectangle' | 'circle' } | null>(null);
  const [annotationShape, setAnnotationShape] = useState<'rectangle' | 'circle'>('rectangle');
  const [imageInfo, setImageInfo] = useState<{ naturalWidth: number; naturalHeight: number; displayedWidth: number; displayedHeight: number } | null>(null);
  const [showFlapDrawings, setShowFlapDrawings] = useState(true);
  const [selectedFlapIndex, setSelectedFlapIndex] = useState<number | undefined>(undefined);

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

      const requestBody = { 
        user_id: userId,
        manual_annotation: normalizedAnnotation,
      };
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
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setError(err.message || 'Analiz sırasında hata oluştu. Konsolu kontrol edin (F12).');
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

      const { data: urlData } = supabase.storage
        .from('case-photos')
        .getPublicUrl(uploadData.path);

      // Insert photo record
      const { error: insertError } = await supabase
        .from('case_photos')
        .insert({
          case_id: caseData.id,
          type: 'postop',
          url: urlData.publicUrl,
        });

      if (insertError) throw insertError;

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Fotoğraf yükleme hatası');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <nav className="glass shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/dashboard" className="text-2xl font-bold gradient-text">
              AI Yüz Rekonstrüksiyon Platformu
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-gray-700 hover:text-blue-600 font-medium rounded-xl hover:bg-white/50 transition-all duration-300"
            >
              ← Dashboard'a Dön
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Case Summary Card */}
        <div className="glass rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Olgu: <span className="gradient-text">{caseData.case_code}</span>
            </h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Bölge:</span>
              <span className="ml-2 font-medium">{caseData.region}</span>
            </div>
            {caseData.age && (
              <div>
                <span className="text-gray-600">Yaş:</span>
                <span className="ml-2 font-medium">{caseData.age}</span>
              </div>
            )}
            {caseData.sex && (
              <div>
                <span className="text-gray-600">Cinsiyet:</span>
                <span className="ml-2 font-medium">{caseData.sex}</span>
              </div>
            )}
            {caseData.width_mm && caseData.height_mm && (
              <div>
                <span className="text-gray-600">Boyut:</span>
                <span className="ml-2 font-medium">
                  {caseData.width_mm} x {caseData.height_mm} mm
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pre-op Photo */}
        {preopPhoto ? (
          <div className="glass rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">📸 Pre-op Fotoğraf</h2>
              <div className="flex gap-2">
                {analysisResult && analysisResult.flap_suggestions.some(f => f.flap_drawing) && (
                  <button
                    onClick={() => {
                      setShowFlapDrawings(!showFlapDrawings);
                      if (!showFlapDrawings) setShowAnnotation(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    {showFlapDrawings ? '👁️ Flep Çizimlerini Gizle' : '📐 Flep Çizimlerini Göster'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAnnotation(!showAnnotation);
                    if (!showAnnotation) setShowFlapDrawings(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  {showAnnotation ? '✕ İşaretlemeyi Kapat' : '✏️ Lezyonu İşaretle'}
                </button>
              </div>
            </div>
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg mb-4 p-4">
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
              {annotation && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  ✅ Lezyon işaretlendi: {Math.round(annotation.width)}px x {Math.round(annotation.height)}px
                </div>
              )}
            </div>
              {!analysisResult ? (
                <div className="space-y-3">
                  {!annotation ? (
                    <>
                      <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-sm text-yellow-900">
                        <div className="flex items-start">
                          <span className="text-xl mr-2">⚠️</span>
                          <div>
                            <strong>Önemli:</strong> AI analizi çalıştırmadan önce lezyon bölgesini işaretlemelisiniz!
                            <br />
                            <span className="text-xs mt-1 block">"Lezyonu İşaretle" butonuna tıklayın ve fotoğraf üzerinde lezyon alanını sürükle-bırak ile çizin. AI çizimleri sadece bu manuel işaretlediğiniz konuma göre yapılacak.</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAnnotation(true)}
                        className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        📝 Önce Lezyonu İşaretle
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg text-sm text-green-900">
                        <div className="flex items-start">
                          <span className="text-xl mr-2">✅</span>
                          <div>
                            <strong>Lezyon işaretlendi!</strong> AI çizimleri SADECE bu manuel işaretlediğiniz konuma göre yapılacak.
                            <br />
                            <span className="text-xs mt-1 block">Kesi çizgileri, flep alanları ve tüm cerrahi detaylar bu işaretlediğiniz alana göre planlanacak.</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        {analyzing ? '🤖 Analiz ediliyor...' : '🚀 AI Analizi Çalıştır →'}
                      </button>
                    </>
                  )}
                </div>
              ) : (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                ✅ AI analizi tamamlandı. Sonuçlar aşağıda görüntüleniyor.
              </div>
            )}
          </div>
        ) : (
          <div className="glass rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📸 Pre-op Fotoğraf</h2>
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
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
                      <li>API key'inizin aktif olduğundan emin olun</li>
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

        {/* AI Results */}
        {analysisResult && (
          <div className="space-y-8">
            {/* Vision Summary */}
            <div className="glass rounded-2xl shadow-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Görüntü Analizi Özeti</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Tespit Edilen Bölge:</span>
                  <span className="ml-2 font-medium">{analysisResult.vision_summary.detected_region}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tahmini Boyut:</span>
                  <span className="ml-2 font-medium">
                    {analysisResult.vision_summary.estimated_width_mm} x{' '}
                    {analysisResult.vision_summary.estimated_height_mm} mm
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Derinlik:</span>
                  <span className="ml-2 font-medium">{analysisResult.vision_summary.depth_estimation}</span>
                </div>
                <div>
                  <span className="text-gray-600">Estetik Zon:</span>
                  <span className="ml-2 font-medium">
                    {analysisResult.vision_summary.aesthetic_zone ? 'Evet' : 'Hayır'}
                  </span>
                </div>
                {analysisResult.vision_summary.critical_structures.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Kritik Yapılar:</span>
                    <span className="ml-2 font-medium">
                      {analysisResult.vision_summary.critical_structures.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Flap Suggestions */}
            <div className="glass rounded-2xl shadow-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 Flep Önerileri</h2>
              <div className="space-y-6">
                {analysisResult.flap_suggestions.map((flap: FlapSuggestion, index: number) => (
                  <div
                    key={index}
                    className="glass border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold">{flap.flap_name}</h3>
                      {flap.flap_drawing && (
                        <button
                          onClick={() => {
                            setSelectedFlapIndex(selectedFlapIndex === index ? undefined : index);
                            setShowFlapDrawings(true);
                            setShowAnnotation(false);
                          }}
                          className="px-3 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          {selectedFlapIndex === index ? '✕ Çizimi Kapat' : '📐 Fotoğrafta Göster'}
                        </button>
                      )}
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(
                            flap.category
                          )}`}
                        >
                          {getCategoryText(flap.category)}
                        </span>
                        <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                          Uygunluk: {flap.suitability_score}/100
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Neden uygun?</h4>
                        <p className="text-gray-600">{flap.why}</p>
                      </div>

                      {flap.advantages.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Avantajlar:</h4>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {flap.advantages.map((adv, i) => (
                              <li key={i}>{adv}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {flap.cautions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Dikkat Edilmesi Gerekenler:</h4>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {flap.cautions.map((caution, i) => (
                              <li key={i}>{caution}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                        {flap.alternatives.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-1">Alternatifler:</h4>
                            <p className="text-gray-600">{flap.alternatives.join(', ')}</p>
                          </div>
                        )}

                        <div>
                          <span className="text-gray-600">Estetik Risk:</span>
                          <span className="ml-2 font-medium capitalize">{flap.aesthetic_risk}</span>
                        </div>

                        {flap.surgical_technique && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                              🔪 Cerrahi Teknik
                            </h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                              {flap.surgical_technique}
                            </div>
                          </div>
                        )}
                        
                        {flap.video_link && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                              🎥 Uygulama Videosu
                            </h4>
                            <a
                              href={flap.video_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                              YouTube'da İzle
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            {/* Safety Review */}
            {analysisResult.safety_review && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Güvenlik İncelemesi</h3>
                <p className="text-sm text-gray-700 mb-4">{analysisResult.safety_review.legal_disclaimer}</p>
                {analysisResult.safety_review.comments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Notlar:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {analysisResult.safety_review.comments.map((comment, i) => (
                        <li key={i}>{comment}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Legal Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
              <p>
                <strong>Önemli:</strong> Bu öneriler yalnızca karar destek amaçlıdır; nihai karar, hastayı 
                değerlendiren klinik ekibe aittir.
              </p>
            </div>
          </div>
        )}

        {/* Post-op Photos */}
        <div className="glass rounded-2xl shadow-xl p-6 mt-8 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📷 Post-op Fotoğraflar</h2>
          
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handlePostopUpload}
              disabled={uploadingPostop}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            {uploadingPostop && <p className="mt-2 text-sm text-gray-600">Yükleniyor...</p>}
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
    </div>
  );
}

