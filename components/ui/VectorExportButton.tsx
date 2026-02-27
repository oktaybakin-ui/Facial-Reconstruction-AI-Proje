'use client';

import React, { useState } from 'react';
import { exportFlapDrawingAsSVG, downloadSVG } from '@/lib/vectorization/svg-export';
import type { FlapSuggestion } from '@/types/ai';

interface VectorExportButtonProps {
  imageUrl: string;
  flapSuggestion: FlapSuggestion;
  disabled?: boolean;
}

export default function VectorExportButton({
  imageUrl,
  flapSuggestion,
  disabled = false,
}: VectorExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!flapSuggestion.flap_drawing) {
      setError('Çizim bulunamadı');
      return;
    }

    setExporting(true);
    setError(null);

    try {
      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context alınamadı');

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw flap drawing (simplified - would need proper coordinate conversion)
      if (flapSuggestion.flap_drawing) {
        const drawing = flapSuggestion.flap_drawing;
        const scaleX = canvas.width / 1000;
        const scaleY = canvas.height / 1000;

        // Draw defect area
        if (drawing.defect_area?.points) {
          ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.strokeStyle = '#FF0000';
          ctx.lineWidth = 3;
          ctx.beginPath();
          const points = drawing.defect_area.points;
          ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Draw flap areas
        if (drawing.flap_areas) {
          drawing.flap_areas.forEach((area) => {
            ctx.fillStyle = area.color + '40'; // Add opacity
            ctx.strokeStyle = area.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            const points = area.points;
            ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          });
        }

        // Draw incision lines
        if (drawing.incision_lines) {
          drawing.incision_lines.forEach((line) => {
            ctx.strokeStyle = line.color;
            ctx.lineWidth = line.lineWidth || 2;
            ctx.setLineDash(line.lineStyle === 'dashed' ? [5, 5] : []);
            ctx.beginPath();
            const points = line.points;
            ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
            }
            ctx.stroke();
          });
        }
      }

      // Convert to SVG
      const svg = await exportFlapDrawingAsSVG(imageUrl, flapSuggestion.flap_drawing, {
        includeImage: true,
        includeOverlays: true,
      });

      // Download
      const filename = `flap-${flapSuggestion.flap_name.replace(/\s+/g, '-')}-${Date.now()}.svg`;
      downloadSVG(svg, filename);

      setExporting(false);
    } catch (err: unknown) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'SVG export başarısız');
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleExport}
        disabled={disabled || exporting || !flapSuggestion.flap_drawing}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {exporting ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Dönüştürülüyor...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            SVG Olarak İndir
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      {!flapSuggestion.flap_drawing && (
        <p className="text-xs text-gray-500">Çizim mevcut değil</p>
      )}
    </div>
  );
}

