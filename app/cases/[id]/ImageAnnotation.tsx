'use client';

import { useState, useRef, useEffect } from 'react';

interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageAnnotationProps {
  imageUrl: string;
  onAnnotationChange?: (annotation: Annotation | null, imageInfo?: { naturalWidth: number; naturalHeight: number; displayedWidth: number; displayedHeight: number }) => void;
}

export default function ImageAnnotation({ imageUrl, onAnnotationChange }: ImageAnnotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotation, setAnnotation] = useState<Annotation | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [imageInfo, setImageInfo] = useState<{ naturalWidth: number; naturalHeight: number; displayedWidth: number; displayedHeight: number } | null>(null);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw annotation if exists
    if (annotation) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);

      // Fill with semi-transparent red
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [imageUrl, annotation]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);
    setAnnotation(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos) return;

    const pos = getMousePos(e);
    const newAnnotation: Annotation = {
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    };

    setAnnotation(newAnnotation);
    drawCanvas();
  };

  const handleMouseUp = () => {
    if (isDrawing && annotation) {
      // Pass annotation along with image info for proper normalization
      onAnnotationChange?.(annotation, imageInfo || undefined);
    }
    setIsDrawing(false);
  };

  const clearAnnotation = () => {
    setAnnotation(null);
    setStartPos(null);
    onAnnotationChange?.(null, imageInfo || undefined);
  };

  useEffect(() => {
    const handleResize = () => {
      drawCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center">
      <div className="relative inline-block max-w-full">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Pre-op with annotation"
          className="max-w-full h-auto rounded-lg"
          style={{ display: 'block', maxHeight: '600px' }}
          onLoad={() => {
            const canvas = canvasRef.current;
            const image = imageRef.current;
            if (canvas && image) {
              // Store both natural and displayed dimensions
              const rect = image.getBoundingClientRect();
              const info = {
                naturalWidth: image.naturalWidth || rect.width,
                naturalHeight: image.naturalHeight || rect.height,
                displayedWidth: rect.width,
                displayedHeight: rect.height,
              };
              setImageInfo(info);
              
              // Set canvas to displayed size (for drawing)
              canvas.width = rect.width;
              canvas.height = rect.height;
              canvas.style.width = `${rect.width}px`;
              canvas.style.height = `${rect.height}px`;
              
              console.log('Image loaded with dimensions:', info);
              drawCanvas();
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 cursor-crosshair"
          style={{ 
            touchAction: 'none',
            pointerEvents: 'auto'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      <div className="mt-4 flex gap-2 items-center">
        {annotation ? (
          <>
            <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✅ Lezyon işaretlendi: {Math.round(annotation.width)}px × {Math.round(annotation.height)}px
            </div>
            <button
              onClick={clearAnnotation}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              ✕ İşareti Temizle
            </button>
          </>
        ) : (
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            💡 Fotoğrafın üzerinde sürükle-bırak ile lezyon bölgesini işaretleyin
          </div>
        )}
      </div>
    </div>
  );
}

