'use client';

import React, { useState } from 'react';
import { requestRegeneration } from '@/lib/ai/feedback';
import type { ValidationFeedback } from '@/types/validation';

interface FeedbackDialogProps {
  caseId: string;
  flapSuggestionId: string;
  flapName: string;
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSubmitted?: () => void;
}

export default function FeedbackDialog({
  caseId,
  flapSuggestionId,
  flapName,
  isOpen,
  onClose,
  onFeedbackSubmitted,
}: FeedbackDialogProps) {
  const [rating, setRating] = useState<ValidationFeedback['userRating']>('orta');
  const [comments, setComments] = useState('');
  const [specificIssues, setSpecificIssues] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const issueOptions = [
    'Simetri sorunları',
    'Oran hataları',
    'Pozisyon hatası',
    'Defekt kapsama yetersiz',
    'Donör alan hatalı',
    'Kritik yapılarla çakışma',
    'Genel görsel kalite düşük',
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const feedback: ValidationFeedback = {
        flapSuggestionId,
        userRating: rating,
        userComments: comments || undefined,
        specificIssues: specificIssues.length > 0 ? specificIssues : undefined,
        timestamp: new Date().toISOString(),
      };

      const result = await requestRegeneration(caseId, flapSuggestionId, feedback);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onFeedbackSubmitted?.();
          onClose();
          // Reset form
          setRating('orta');
          setComments('');
          setSpecificIssues([]);
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Geri bildirim gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Geri Bildirim</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Flep:</strong> {flapName}
            </p>
          </div>

          {success ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
              ✅ Geri bildiriminiz kaydedildi. Teşekkürler!
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Değerlendirme
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['yetersiz', 'orta', 'iyi', 'mükemmel'] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        rating === value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {value === 'yetersiz' ? '❌ Yetersiz' :
                       value === 'orta' ? '⚠️ Orta' :
                       value === 'iyi' ? '✅ İyi' : '⭐ Mükemmel'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tespit Edilen Sorunlar (Birden fazla seçebilirsiniz)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {issueOptions.map((issue) => (
                    <label
                      key={issue}
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={specificIssues.includes(issue)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSpecificIssues([...specificIssues, issue]);
                          } else {
                            setSpecificIssues(specificIssues.filter(i => i !== issue));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{issue}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yorumlar (Opsiyonel)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ek açıklamalarınızı buraya yazabilirsiniz..."
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  İptal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

