'use client';

import { useEffect, useRef } from 'react';
import type { FlapSuggestion } from '@/types/ai';

interface FlapDrawingOverlayProps {
  imageUrl: string;
  flapSuggestions: FlapSuggestion[];
  selectedFlapIndex?: number;
}

export default function FlapDrawingOverlay({
  imageUrl,
  flapSuggestions,
  selectedFlapIndex,
}: FlapDrawingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    drawFlaps();
  }, [imageUrl, flapSuggestions, selectedFlapIndex]);

  const drawFlaps = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get natural and displayed dimensions
    const naturalWidth = image.naturalWidth || canvas.width;
    const naturalHeight = image.naturalHeight || canvas.height;
    const displayedWidth = canvas.width;
    const displayedHeight = canvas.height;
    
    console.log('Drawing flaps with dimensions:', {
      natural: { width: naturalWidth, height: naturalHeight },
      displayed: { width: displayedWidth, height: displayedHeight },
      scale: { x: displayedWidth / naturalWidth, y: displayedHeight / naturalHeight },
    });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Helper function to convert normalized coordinates (0-1000) to canvas coordinates
    // Normalized coordinates are based on natural image size
    // We need to scale them to displayed (canvas) size
    const toCanvasCoords = (point: { x: number; y: number }) => {
      // Normalized coordinates (0-1000) represent position in natural image
      // Convert to natural image coordinates first
      const naturalX = (point.x / 1000) * naturalWidth;
      const naturalY = (point.y / 1000) * naturalHeight;
      
      // Then scale to displayed (canvas) coordinates
      const scaleX = displayedWidth / naturalWidth;
      const scaleY = displayedHeight / naturalHeight;
      
      return {
        x: naturalX * scaleX,
        y: naturalY * scaleY,
      };
    };

    // Draw each flap suggestion
    flapSuggestions.forEach((flap, index) => {
      if (!flap.flap_drawing) return;

      // Only draw selected flap if a selection is made, otherwise draw all
      if (selectedFlapIndex !== undefined && selectedFlapIndex !== index) return;

      const isSelected = selectedFlapIndex === index;
      const baseOpacity = isSelected ? 0.8 : 0.5;
      const lineWidthMultiplier = isSelected ? 1.5 : 1;

      const drawing = flap.flap_drawing;

      // Helper function to draw polygon
      const drawPolygon = (points: Array<{ x: number; y: number }>, fill: boolean, stroke: boolean) => {
        if (points.length < 2) return;

        const canvasPoints = points.map(toCanvasCoords);
        
        ctx.beginPath();
        ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
        for (let i = 1; i < canvasPoints.length; i++) {
          ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y);
        }
        ctx.closePath();

        if (fill) {
          ctx.fill();
        }
        if (stroke) {
          ctx.stroke();
        }
      };

      // Helper function to draw dashed line
      const drawDashedLine = (points: Array<{ x: number; y: number }>, dashLength: number = 5, gapLength: number = 3) => {
        if (points.length < 2) return;

        const canvasPoints = points.map(toCanvasCoords);
        
        for (let i = 0; i < canvasPoints.length - 1; i++) {
          const start = canvasPoints[i];
          const end = canvasPoints[i + 1];
          
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const unitX = dx / dist;
          const unitY = dy / dist;

          let drawn = 0;
          ctx.beginPath();
          
          while (drawn < dist) {
            const segmentEnd = Math.min(drawn + dashLength, dist);
            ctx.moveTo(start.x + unitX * drawn, start.y + unitY * drawn);
            ctx.lineTo(start.x + unitX * segmentEnd, start.y + unitY * segmentEnd);
            drawn = segmentEnd + gapLength;
          }
          
          ctx.stroke();
        }
      };

      // 1. Draw defect area first (background)
      if (drawing.defect_area && drawing.defect_area.points) {
        ctx.fillStyle = `rgba(255, 0, 0, ${baseOpacity * 0.4})`;
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3 * lineWidthMultiplier;
        drawPolygon(drawing.defect_area.points, true, true);
        
        // Draw label
        const centerX = drawing.defect_area.points.reduce((sum, p) => sum + p.x, 0) / drawing.defect_area.points.length;
        const centerY = drawing.defect_area.points.reduce((sum, p) => sum + p.y, 0) / drawing.defect_area.points.length;
        drawLabel(ctx, toCanvasCoords({ x: centerX, y: centerY }), drawing.defect_area.label, '#FF0000');
      }

      // 2. Draw donor area
      if (drawing.donor_area && drawing.donor_area.points) {
        ctx.fillStyle = `rgba(255, 165, 0, ${baseOpacity * 0.3})`;
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2 * lineWidthMultiplier;
        ctx.setLineDash([]);
        drawPolygon(drawing.donor_area.points, true, true);
        
        const centerX = drawing.donor_area.points.reduce((sum, p) => sum + p.x, 0) / drawing.donor_area.points.length;
        const centerY = drawing.donor_area.points.reduce((sum, p) => sum + p.y, 0) / drawing.donor_area.points.length;
        drawLabel(ctx, toCanvasCoords({ x: centerX, y: centerY }), drawing.donor_area.label, '#FFA500');
      }

      // 3. Draw flap areas
      if (drawing.flap_areas) {
        drawing.flap_areas.forEach((flapArea) => {
          const opacity = flapArea.fillOpacity ?? 0.3;
          ctx.fillStyle = `${flapArea.color}${Math.floor(opacity * baseOpacity * 255).toString(16).padStart(2, '0')}`;
          ctx.strokeStyle = flapArea.color;
          ctx.lineWidth = 3 * lineWidthMultiplier;
          ctx.setLineDash([]);
          drawPolygon(flapArea.points, true, true);
          
          const centerX = flapArea.points.reduce((sum, p) => sum + p.x, 0) / flapArea.points.length;
          const centerY = flapArea.points.reduce((sum, p) => sum + p.y, 0) / flapArea.points.length;
          drawLabel(ctx, toCanvasCoords({ x: centerX, y: centerY }), flapArea.label, flapArea.color);
        });
      }

      // 4. Draw incision lines (most visible - dashed lines)
      if (drawing.incision_lines) {
        drawing.incision_lines.forEach((incision) => {
          ctx.strokeStyle = incision.color;
          ctx.lineWidth = (incision.lineWidth || 3) * lineWidthMultiplier;
          
          if (incision.lineStyle === 'dashed') {
            ctx.setLineDash([8, 5]);
            drawDashedLine(incision.points);
          } else {
            ctx.setLineDash([]);
            drawPolygon(incision.points, false, true);
          }
          
          // Draw label at the midpoint of the incision line
          if (incision.points.length >= 2) {
            const midPoint = {
              x: (incision.points[0].x + incision.points[incision.points.length - 1].x) / 2,
              y: (incision.points[0].y + incision.points[incision.points.length - 1].y) / 2,
            };
            drawLabel(ctx, toCanvasCoords(midPoint), incision.label, incision.color, true);
          }
        });
      }

      // 5. Draw arrows (movement direction)
      if (drawing.arrows) {
        drawing.arrows.forEach((arrow) => {
          ctx.strokeStyle = arrow.color;
          ctx.fillStyle = arrow.color;
          ctx.lineWidth = 2 * lineWidthMultiplier;
          ctx.setLineDash([]);
          
          const from = toCanvasCoords(arrow.from);
          const to = toCanvasCoords(arrow.to);
          
          // Draw arrow line
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
          ctx.lineTo(
            to.x - arrowLength * Math.cos(angle - arrowAngle),
            to.y - arrowLength * Math.sin(angle - arrowAngle)
          );
          ctx.moveTo(to.x, to.y);
          ctx.lineTo(
            to.x - arrowLength * Math.cos(angle + arrowAngle),
            to.y - arrowLength * Math.sin(angle + arrowAngle)
          );
          ctx.stroke();
          ctx.fill();
          
          // Draw label
          if (arrow.label) {
            const midPoint = {
              x: (from.x + to.x) / 2,
              y: (from.y + to.y) / 2 - 20,
            };
            drawLabel(ctx, midPoint, arrow.label, arrow.color);
          }
        });
      }
    });
  };

  // Helper function to draw labels with background
  const drawLabel = (
    ctx: CanvasRenderingContext2D,
    position: { x: number; y: number },
    text: string,
    color: string,
    small: boolean = false
  ) => {
    ctx.font = small ? 'bold 12px Arial' : 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = small ? 16 : 18;
    const padding = 6;
    
    // Draw text background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      position.x - textWidth / 2 - padding,
      position.y - textHeight / 2 - padding,
      textWidth + padding * 2,
      textHeight + padding * 2
    );
    
    // Draw border
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(
      position.x - textWidth / 2 - padding,
      position.y - textHeight / 2 - padding,
      textWidth + padding * 2,
      textHeight + padding * 2
    );
    
    // Draw text
    ctx.fillStyle = color;
    ctx.fillText(text, position.x, position.y);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative inline-block max-w-full">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Pre-op with flap drawings"
          className="max-w-full h-auto rounded-lg"
          style={{ display: 'block', maxHeight: '600px' }}
          onLoad={() => {
            const canvas = canvasRef.current;
            const image = imageRef.current;
            if (canvas && image) {
              const rect = image.getBoundingClientRect();
              // Canvas size must match displayed image size exactly
              canvas.width = rect.width;
              canvas.height = rect.height;
              canvas.style.width = `${rect.width}px`;
              canvas.style.height = `${rect.height}px`;
              
              console.log('🎨 FlapDrawingOverlay image loaded:', {
                natural: { width: image.naturalWidth, height: image.naturalHeight },
                displayed: { width: rect.width, height: rect.height },
                canvas: { width: canvas.width, height: canvas.height },
                scale: {
                  x: rect.width / image.naturalWidth,
                  y: rect.height / image.naturalHeight,
                },
              });
              
              drawFlaps();
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ touchAction: 'none' }}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-700"></div>
          <span>Defekt Alanı</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-dashed"></div>
          <span>Kesi Çizgileri</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded bg-opacity-30 border-2 border-green-700"></div>
          <span>Flep Alanı</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded bg-opacity-30 border-2 border-orange-700"></div>
          <span>Donor Alan</span>
        </div>
      </div>
    </div>
  );
}
