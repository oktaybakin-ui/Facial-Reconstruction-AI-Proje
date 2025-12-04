'use client';

import { useState, useRef, useEffect } from 'react';
import type { FlapSuggestion } from '@/types/ai';

export type AnnotationShape = 'rectangle' | 'circle' | 'polygon';

interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: AnnotationShape; // Default: rectangle
  points?: Array<{ x: number; y: number }>; // For polygon or circle center/radius
}

interface UnifiedImageOverlayProps {
  imageUrl: string;
  annotation?: Annotation | null;
  onAnnotationChange?: (annotation: Annotation | null, imageInfo?: { naturalWidth: number; naturalHeight: number; displayedWidth: number; displayedHeight: number }) => void;
  flapSuggestions?: FlapSuggestion[];
  selectedFlapIndex?: number;
  showAnnotationMode?: boolean;
  annotationShape?: AnnotationShape; // Current annotation shape type
  onShapeChange?: (shape: AnnotationShape) => void; // Callback when shape changes
}

export default function UnifiedImageOverlay({
  imageUrl,
  annotation,
  onAnnotationChange,
  flapSuggestions = [],
  selectedFlapIndex,
  showAnnotationMode = false,
  annotationShape = 'rectangle',
  onShapeChange,
}: UnifiedImageOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(annotation || null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [imageInfo, setImageInfo] = useState<{ naturalWidth: number; naturalHeight: number; displayedWidth: number; displayedHeight: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<AnnotationShape>(annotationShape);

  useEffect(() => {
    setCurrentAnnotation(annotation || null);
  }, [annotation]);

  useEffect(() => {
    drawCanvas();
  }, [imageUrl, currentAnnotation, flapSuggestions, selectedFlapIndex, showAnnotationMode]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageInfo) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If annotation mode, draw annotation based on shape
    if (showAnnotationMode && currentAnnotation) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      
      const shape = currentAnnotation.shape || currentShape;
      
      if (shape === 'circle') {
        // Draw circle: use center and radius
        const centerX = currentAnnotation.x + currentAnnotation.width / 2;
        const centerY = currentAnnotation.y + currentAnnotation.height / 2;
        const radius = Math.max(
          Math.abs(currentAnnotation.width) / 2,
          Math.abs(currentAnnotation.height) / 2
        );
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (shape === 'polygon' && currentAnnotation.points && currentAnnotation.points.length >= 3) {
        // Draw polygon
        ctx.beginPath();
        ctx.moveTo(currentAnnotation.points[0].x, currentAnnotation.points[0].y);
        for (let i = 1; i < currentAnnotation.points.length; i++) {
          ctx.lineTo(currentAnnotation.points[i].x, currentAnnotation.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Default: rectangle
        ctx.strokeRect(currentAnnotation.x, currentAnnotation.y, currentAnnotation.width, currentAnnotation.height);
        ctx.fillRect(currentAnnotation.x, currentAnnotation.y, currentAnnotation.width, currentAnnotation.height);
      }
    }

    // If flap drawing mode, draw flaps
    if (!showAnnotationMode && flapSuggestions.length > 0) {
      drawFlapDrawings(ctx);
    }
  };

  const drawFlapDrawings = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageInfo) return;

    const { naturalWidth, naturalHeight, displayedWidth, displayedHeight } = imageInfo;

    // Helper to convert normalized (0-1000) to canvas coordinates
    // Normalized coordinates are based on DISPLAYED dimensions (what user sees)
    // So we can convert directly without natural width/height conversion
    const toCanvasCoords = (point: { x: number; y: number }) => {
      // Direct conversion: normalized (0-1000) -> displayed (canvas) coordinates
      return {
        x: (point.x / 1000) * displayedWidth,
        y: (point.y / 1000) * displayedHeight,
      };
    };
    
    console.log('🎨 Drawing flaps with coordinate conversion:', {
      normalized: '0-1000 (based on displayed size)',
      canvas: { width: displayedWidth, height: displayedHeight },
      natural: { width: naturalWidth, height: naturalHeight },
    });

    flapSuggestions.forEach((flap, index) => {
      if (!flap.flap_drawing) return;
      if (selectedFlapIndex !== undefined && selectedFlapIndex !== index) return;

      const isSelected = selectedFlapIndex === index;
      const baseOpacity = isSelected ? 0.8 : 0.5;
      const lineWidthMultiplier = isSelected ? 1.5 : 1;
      const drawing = flap.flap_drawing;

      // Draw defect area
      if (drawing.defect_area?.points) {
        const points = drawing.defect_area.points.map(toCanvasCoords);
        ctx.fillStyle = `rgba(255, 0, 0, ${baseOpacity * 0.4})`;
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3 * lineWidthMultiplier;
        drawPolygon(ctx, points, true, true);
      }

      // Draw donor area
      if (drawing.donor_area?.points) {
        const points = drawing.donor_area.points.map(toCanvasCoords);
        ctx.fillStyle = `rgba(255, 165, 0, ${baseOpacity * 0.3})`;
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2 * lineWidthMultiplier;
        ctx.setLineDash([]);
        drawPolygon(ctx, points, true, true);
      }

      // Draw flap areas
      if (drawing.flap_areas) {
        drawing.flap_areas.forEach((flapArea) => {
          const points = flapArea.points.map(toCanvasCoords);
          const opacity = flapArea.fillOpacity ?? 0.3;
          ctx.fillStyle = `${flapArea.color}${Math.floor(opacity * baseOpacity * 255).toString(16).padStart(2, '0')}`;
          ctx.strokeStyle = flapArea.color;
          ctx.lineWidth = 3 * lineWidthMultiplier;
          ctx.setLineDash([]);
          drawPolygon(ctx, points, true, true);
        });
      }

      // Draw incision lines
      if (drawing.incision_lines) {
        drawing.incision_lines.forEach((incision) => {
          ctx.strokeStyle = incision.color;
          ctx.lineWidth = (incision.lineWidth || 3) * lineWidthMultiplier;
          
          if (incision.lineStyle === 'dashed') {
            ctx.setLineDash([8, 5]);
          } else {
            ctx.setLineDash([]);
          }
          
          const points = incision.points.map(toCanvasCoords);
          if (points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
          }
        });
      }

      // Draw arrows
      if (drawing.arrows) {
        drawing.arrows.forEach((arrow) => {
          ctx.strokeStyle = arrow.color;
          ctx.fillStyle = arrow.color;
          ctx.lineWidth = 2 * lineWidthMultiplier;
          ctx.setLineDash([]);
          
          const from = toCanvasCoords(arrow.from);
          const to = toCanvasCoords(arrow.to);
          
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
          
          // Draw arrowhead
          const angle = Math.atan2(to.y - from.y, to.x - from.x);
          const arrowLength = 15;
          const arrowAngle = Math.PI / 6;
          
          ctx.beginPath();
          ctx.moveTo(to.x, to.y);
          ctx.lineTo(to.x - arrowLength * Math.cos(angle - arrowAngle), to.y - arrowLength * Math.sin(angle - arrowAngle));
          ctx.moveTo(to.x, to.y);
          ctx.lineTo(to.x - arrowLength * Math.cos(angle + arrowAngle), to.y - arrowLength * Math.sin(angle + arrowAngle));
          ctx.stroke();
          ctx.fill();
        });
      }
    });
  };

  const drawPolygon = (ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number }>, fill: boolean, stroke: boolean) => {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };

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
    if (!showAnnotationMode) return;
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);
    setCurrentAnnotation(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showAnnotationMode || !isDrawing || !startPos) return;
    const pos = getMousePos(e);
    
    const newAnnotation: Annotation = {
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
      shape: currentShape,
    };
    
    setCurrentAnnotation(newAnnotation);
    drawCanvas();
  };

  const handleMouseUp = () => {
    if (showAnnotationMode && isDrawing && currentAnnotation) {
      onAnnotationChange?.(currentAnnotation, imageInfo || undefined);
    }
    setIsDrawing(false);
  };

  const clearAnnotation = () => {
    setCurrentAnnotation(null);
    setStartPos(null);
    onAnnotationChange?.(null, imageInfo || undefined);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative inline-block max-w-full">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Pre-op"
          className="max-w-full h-auto rounded-lg"
          style={{ display: 'block', maxHeight: '600px' }}
          onLoad={() => {
            const canvas = canvasRef.current;
            const image = imageRef.current;
            if (canvas && image) {
              const rect = image.getBoundingClientRect();
              const info = {
                naturalWidth: image.naturalWidth || rect.width,
                naturalHeight: image.naturalHeight || rect.height,
                displayedWidth: rect.width,
                displayedHeight: rect.height,
              };
              setImageInfo(info);
              
              canvas.width = rect.width;
              canvas.height = rect.height;
              canvas.style.width = `${rect.width}px`;
              canvas.style.height = `${rect.height}px`;
              
              console.log('UnifiedImageOverlay - Image loaded:', info);
              drawCanvas();
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 ${showAnnotationMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
          style={{ touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      {showAnnotationMode && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Şekil Seçimi:</span>
            <button
              onClick={() => {
                setCurrentShape('rectangle');
                onShapeChange?.('rectangle');
                clearAnnotation();
              }}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                currentShape === 'rectangle'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⬜ Kare
            </button>
            <button
              onClick={() => {
                setCurrentShape('circle');
                onShapeChange?.('circle');
                clearAnnotation();
              }}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                currentShape === 'circle'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⭕ Yuvarlak
            </button>
          </div>
          {currentAnnotation ? (
            <div className="flex gap-2 items-center">
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                ✅ Lezyon işaretlendi ({currentShape === 'circle' ? 'Yuvarlak' : 'Kare'}): {Math.round(currentAnnotation.width)}px × {Math.round(currentAnnotation.height)}px
              </div>
              <button
                onClick={clearAnnotation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                ✕ İşareti Temizle
              </button>
            </div>
          ) : (
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              💡 Fotoğrafın üzerinde sürükle-bırak ile lezyon bölgesini işaretleyin ({currentShape === 'circle' ? 'yuvarlak' : 'kare'} şeklinde)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

