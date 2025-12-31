'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface MultiPhotoUploadProps {
  caseId: string;
  onUploadComplete: (urls: string[]) => void;
  maxPhotos?: number;
  requiredPhotos?: number;
  className?: string;
}

export default function MultiPhotoUpload({
  caseId,
  onUploadComplete,
  maxPhotos = 9,
  requiredPhotos = 9,
  className = '',
}: MultiPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file count
    if (files.length > maxPhotos) {
      setErrors([`Maksimum ${maxPhotos} adet fotoğraf seçebilirsiniz.`]);
      return;
    }

    if (files.length < requiredPhotos) {
      setErrors([`En az ${requiredPhotos} adet fotoğraf seçmelisiniz. Şu an seçilen: ${files.length} adet.`]);
      return;
    }

    setErrors([]);
    setUploading(true);
    setUploadProgress({});

    const uploadedUrls: string[] = [];
    const uploadPromises: Promise<void>[] = [];

    // Upload each file
    Array.from(files).forEach((file, index) => {
      const uploadPromise = uploadPhoto(file, index, caseId)
        .then((url) => {
          uploadedUrls.push(url);
          setUploadedPhotos((prev) => [...prev, url]);
        })
        .catch((error) => {
          console.error(`Photo ${index + 1} upload failed:`, error);
          setErrors((prev) => [...prev, `Fotoğraf ${index + 1} yüklenemedi: ${error.message}`]);
        });

      uploadPromises.push(uploadPromise);
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    setUploading(false);
    
    if (uploadedUrls.length === files.length) {
      onUploadComplete(uploadedUrls);
    }
  };

  const uploadPhoto = async (
    file: File,
    index: number,
    caseId: string
  ): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Sadece görüntü dosyaları yüklenebilir');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Dosya boyutu 10MB\'dan küçük olmalıdır');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${caseId}-3d-${Date.now()}-${index}.${fileExt}`;
    const filePath = `case-photos/${caseId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('case-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('case-photos')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Fotoğraf URL\'si alınamadı');
    }

    return urlData.publicUrl;
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    onUploadComplete(newPhotos);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <label
              htmlFor="multi-photo-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {uploading ? 'Yükleniyor...' : 'Fotoğrafları Seç'}
            </label>
            <input
              id="multi-photo-upload"
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {requiredPhotos} adet fotoğraf seçin (farklı açılardan)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Maksimum dosya boyutu: 10MB
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Fotoğraflar yükleniyor... Lütfen bekleyin.
          </p>
        </div>
      )}

      {/* Uploaded Photos Grid */}
      {uploadedPhotos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              Yüklenen Fotoğraflar: {uploadedPhotos.length} / {requiredPhotos}
            </p>
            {uploadedPhotos.length < requiredPhotos && (
              <p className="text-sm text-red-600 font-medium">
                Eksik: {requiredPhotos - uploadedPhotos.length} fotoğraf
              </p>
            )}
            {uploadedPhotos.length === requiredPhotos && (
              <p className="text-sm text-green-600 font-medium">
                ✓ Tüm fotoğraflar yüklendi
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {uploadedPhotos.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Fotoğraf ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Kaldır"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hatalar</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

