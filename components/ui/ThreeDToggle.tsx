'use client';

import { useState } from 'react';

interface ThreeDToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

export default function ThreeDToggle({ enabled, onChange, className = '' }: ThreeDToggleProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              3 Boyutlu Yüz Görselleştirme
            </span>
          </label>
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Bilgi"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info Modal/Alert */}
      {showInfo && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                3D Model Gereksinimleri
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p className="font-semibold">3D model oluşturmak için farklı açılardan çekilmiş toplam 9 adet yüz fotoğrafı yüklemelisiniz.</p>
                <p className="mt-2">Gerekli açı örnekleri:</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Ön cephe (0°)</li>
                  <li>Sağ 30°, Sol 30°</li>
                  <li>Sağ 45°, Sol 45°</li>
                  <li>Sağ 60°, Sol 60°</li>
                  <li>Sağ profil (90°), Sol profil (90°)</li>
                </ul>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning when enabled */}
      {enabled && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Not:</strong> 3D mod aktif. Analiz başlatmak için 9 adet fotoğraf yüklemeniz gerekmektedir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

