'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { FlapSuggestion, AnatomicalLandmarks } from '@/types/ai';

export type AnnotationShape = 'rectangle' | 'circle' | 'polygon';

export interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
  shape?: AnnotationShape;
  points?: Array<{ x: number; y: number }>;
}

// Professional surgical illustration color palette
const COLORS = {
  defect: { stroke: '#DC2626', fill: 'rgba(220,38,38,0.30)', hatch: 'rgba(220,38,38,0.45)' },
  flap: { stroke: '#2563EB', fill: 'rgba(37,99,235,0.22)' },
  flapSecondary: { stroke: '#0891B2', fill: 'rgba(8,145,178,0.22)' },
  donor: { stroke: '#16A34A', fill: 'rgba(22,163,74,0.18)', hatch: 'rgba(22,163,74,0.30)' },
  burow: { stroke: '#7C3AED', fill: 'rgba(124,58,237,0.22)', hatch: 'rgba(124,58,237,0.40)' },
  incision: '#1E40AF',
  suture: '#6B7280',
  arrow: '#15803D',
  pivot: '#111827',
  undermining: { stroke: '#D97706', fill: 'rgba(217,119,6,0.10)' },
};

const LANDMARK_COLORS = {
  point: 'rgba(255, 165, 0, 0.7)',
  referenceLine: 'rgba(255, 165, 0, 0.25)',
  label: 'rgba(255, 165, 0, 0.85)',
};

const DASH_PATTERNS: Record<string, number[]> = {
  solid: [],
  dashed: [10, 6],
  dotted: [2, 4],
  'dash-dot': [10, 4, 2, 4],
};

interface UnifiedImageOverlayProps {
  imageUrl: string;
  annotation?: Annotation | null;
  onAnnotationChange?: (annotation: Annotation | null, imageInfo?: { naturalWidth: number; naturalHeight: number; displayedWidth: number; displayedHeight: number }) => void;
  flapSuggestions?: FlapSuggestion[];
  selectedFlapIndex?: number;
  showAnnotationMode?: boolean;
  annotationShape?: AnnotationShape;
  onShapeChange?: (shape: AnnotationShape) => void;
  anatomicalLandmarks?: AnatomicalLandmarks;
  showLandmarks?: boolean;
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
  anatomicalLandmarks,
  showLandmarks = false,
}: UnifiedImageOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(annotation || null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [imageInfo, setImageInfo] = useState<{ naturalWidth: number; naturalHeight: number; displayedWidth: number; displayedHeight: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<AnnotationShape>(annotationShape);

  // Sync local state with prop changes
  useEffect(() => {
    setCurrentAnnotation(annotation || null);
  }, [annotation]);

  // ─── Drawing Utilities ───

  const drawHatching = useCallback((
    ctx: CanvasRenderingContext2D,
    points: Array<{ x: number; y: number }>,
    type: 'cross' | 'single',
    color: string,
    spacing: number = 8
  ) => {
    if (points.length < 3) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([]);

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    const range = maxY - minY;

    // Diagonal hatching (45 degrees)
    for (let i = minX - range; i < maxX + range; i += spacing) {
      ctx.beginPath();
      ctx.moveTo(i, minY);
      ctx.lineTo(i + range, maxY);
      ctx.stroke();
    }

    // Cross-hatching (135 degrees)
    if (type === 'cross') {
      for (let i = minX - range; i < maxX + range; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i + range, minY);
        ctx.lineTo(i, maxY);
        ctx.stroke();
      }
    }
    ctx.restore();
  }, []);

  const drawLabel = useCallback((
    ctx: CanvasRenderingContext2D,
    position: { x: number; y: number },
    text: string,
    color: string,
    fontSize: number = 12
  ) => {
    if (!text) return;
    const paddingH = 7;
    const paddingV = 3;

    ctx.font = `600 ${fontSize}px -apple-system, "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const metrics = ctx.measureText(text);
    const labelW = metrics.width + paddingH * 2;
    const labelH = fontSize + paddingV * 2;
    const cornerRadius = 4;

    // Rounded rectangle background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.roundRect(position.x - labelW / 2, position.y - labelH / 2, labelW, labelH, cornerRadius);
    ctx.fill();

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.stroke();

    // Text
    ctx.fillStyle = color;
    ctx.fillText(text, position.x, position.y);
  }, []);

  const drawLeaderLine = useCallback((
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    color: string
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Small dot at element anchor
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(from.x, from.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawFilledArrowhead = useCallback((
    ctx: CanvasRenderingContext2D,
    tipX: number, tipY: number,
    angle: number,
    color: string,
    headLength: number = 14
  ) => {
    const headAngle = Math.PI / 7;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - headLength * Math.cos(angle - headAngle), tipY - headLength * Math.sin(angle - headAngle));
    ctx.lineTo(tipX - headLength * Math.cos(angle + headAngle), tipY - headLength * Math.sin(angle + headAngle));
    ctx.closePath();
    ctx.fill();
  }, []);

  const drawPivotPoint = useCallback((ctx: CanvasRenderingContext2D, point: { x: number; y: number }, label?: string) => {
    // Outer white halo
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Black circle
    ctx.fillStyle = COLORS.pivot;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Inner white dot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
    ctx.fill();

    if (label) {
      drawLabel(ctx, { x: point.x, y: point.y - 18 }, label, COLORS.pivot, 11);
    }
  }, [drawLabel]);

  const drawLandmarkPoint = useCallback((
    ctx: CanvasRenderingContext2D,
    point: { x: number; y: number },
    label?: string,
    size: number = 4
  ) => {
    // Dotted circle
    ctx.strokeStyle = LANDMARK_COLORS.point;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(point.x, point.y, size + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center dot
    ctx.fillStyle = LANDMARK_COLORS.point;
    ctx.beginPath();
    ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Optional label
    if (label) {
      ctx.font = '500 10px -apple-system, "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = LANDMARK_COLORS.label;
      ctx.fillText(label, point.x, point.y + size + 6);
    }
  }, []);

  const drawReferenceLine = useCallback((
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    label?: string
  ) => {
    ctx.strokeStyle = LANDMARK_COLORS.referenceLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.setLineDash([]);

    if (label) {
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      ctx.font = '500 9px -apple-system, "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(label);
      const padding = 3;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(midX - metrics.width / 2 - padding, midY - 6 - padding, metrics.width + padding * 2, 12 + padding * 2);

      ctx.fillStyle = LANDMARK_COLORS.label;
      ctx.fillText(label, midX, midY);
    }
  }, []);

  // ─── Professional Flap Drawing ───

  const drawFlapDrawings = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!imageInfo) return;
    const { displayedWidth, displayedHeight } = imageInfo;

    const toCanvasCoords = (point: { x: number; y: number }) => ({
      x: (point.x / 1000) * displayedWidth,
      y: (point.y / 1000) * displayedHeight,
    });

    const drawPolygon = (points: Array<{ x: number; y: number }>, fill: boolean, stroke: boolean) => {
      if (points.length < 2) return;
      const canvasPoints = points.map(toCanvasCoords);
      ctx.beginPath();
      ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
      for (let i = 1; i < canvasPoints.length; i++) {
        ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y);
      }
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    };

    // Smooth curve through points using cubic bezier
    const drawSmoothCurve = (points: Array<{ x: number; y: number }>) => {
      if (points.length < 2) return;
      const cp = points.map(toCanvasCoords);
      ctx.beginPath();
      ctx.moveTo(cp[0].x, cp[0].y);

      if (cp.length === 2) {
        ctx.lineTo(cp[1].x, cp[1].y);
      } else {
        for (let i = 0; i < cp.length - 1; i++) {
          const xc = (cp[i].x + cp[i + 1].x) / 2;
          const yc = (cp[i].y + cp[i + 1].y) / 2;
          ctx.quadraticCurveTo(cp[i].x, cp[i].y, xc, yc);
        }
        ctx.lineTo(cp[cp.length - 1].x, cp[cp.length - 1].y);
      }
      ctx.stroke();
    };

    const getCentroid = (points: Array<{ x: number; y: number }>) => {
      const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
      return { x: cx, y: cy };
    };

    flapSuggestions.forEach((flap, index) => {
      if (!flap.flap_drawing) return;
      if (selectedFlapIndex !== undefined && selectedFlapIndex !== index) return;

      const isSelected = selectedFlapIndex === index;
      const baseOpacity = isSelected ? 1.0 : 0.7;
      const lineWidthMultiplier = isSelected ? 1.3 : 1;
      const drawing = flap.flap_drawing;

      // === LAYER 1: Undermining zone ===
      if (drawing.undermining_zone?.points) {
        ctx.fillStyle = COLORS.undermining.fill;
        ctx.strokeStyle = COLORS.undermining.stroke;
        ctx.lineWidth = 1.5 * lineWidthMultiplier;
        ctx.setLineDash([4, 4]);
        drawPolygon(drawing.undermining_zone.points, true, true);
        ctx.setLineDash([]);
      }

      // === LAYER 2: Donor area ===
      if (drawing.donor_area?.points) {
        const donor = drawing.donor_area;
        ctx.fillStyle = COLORS.donor.fill;
        ctx.strokeStyle = COLORS.donor.stroke;
        ctx.lineWidth = 2 * lineWidthMultiplier;
        ctx.setLineDash([]);
        drawPolygon(donor.points, true, true);

        // Single-direction hatching
        if (donor.hatching !== 'none') {
          const canvasPoints = donor.points.map(toCanvasCoords);
          drawHatching(ctx, canvasPoints, 'single', COLORS.donor.hatch, 10);
        }
      }

      // === LAYER 3: Flap areas ===
      if (drawing.flap_areas) {
        drawing.flap_areas.forEach((flapArea, areaIdx) => {
          const colorSet = areaIdx === 0 ? COLORS.flap : COLORS.flapSecondary;
          const opacity = (flapArea.fillOpacity ?? 0.22) * baseOpacity;
          ctx.fillStyle = flapArea.color
            ? `${flapArea.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
            : colorSet.fill;
          ctx.strokeStyle = flapArea.color || colorSet.stroke;
          ctx.lineWidth = 2.5 * lineWidthMultiplier;
          ctx.setLineDash([]);
          drawPolygon(flapArea.points, true, true);
        });
      }

      // === LAYER 4: Burow triangles ===
      if (drawing.burow_triangles) {
        drawing.burow_triangles.forEach(triangle => {
          ctx.fillStyle = COLORS.burow.fill;
          ctx.strokeStyle = triangle.color || COLORS.burow.stroke;
          ctx.lineWidth = 2 * lineWidthMultiplier;
          ctx.setLineDash([]);
          drawPolygon(triangle.points, true, true);

          // Dense cross-hatching
          const canvasPoints = triangle.points.map(toCanvasCoords);
          drawHatching(ctx, canvasPoints, 'cross', COLORS.burow.hatch, 5);
        });
      }

      // === LAYER 5: Defect area ===
      if (drawing.defect_area?.points) {
        const defect = drawing.defect_area;
        // Semi-transparent fill
        ctx.fillStyle = COLORS.defect.fill;
        drawPolygon(defect.points, true, false);

        // Cross-hatching
        if (defect.hatching !== 'none') {
          const canvasPoints = defect.points.map(toCanvasCoords);
          drawHatching(ctx, canvasPoints, 'cross', COLORS.defect.hatch, 8);
        }

        // Solid red border
        ctx.strokeStyle = COLORS.defect.stroke;
        ctx.lineWidth = 3 * lineWidthMultiplier;
        ctx.setLineDash([]);
        ctx.lineJoin = 'round';
        drawPolygon(defect.points, false, true);
      }

      // === LAYER 6: Incision lines (smooth curves) ===
      if (drawing.incision_lines) {
        drawing.incision_lines.forEach(incision => {
          const purpose = incision.purpose || 'planned_incision';
          let strokeColor = incision.color || COLORS.incision;
          let dashPattern = DASH_PATTERNS[incision.lineStyle] || DASH_PATTERNS.dashed;
          let lw = (incision.lineWidth || 2.5) * lineWidthMultiplier;

          if (purpose === 'wound_edge') {
            strokeColor = COLORS.defect.stroke;
            dashPattern = DASH_PATTERNS.solid;
            lw = 3 * lineWidthMultiplier;
          } else if (purpose === 'suture_line') {
            strokeColor = COLORS.suture;
            dashPattern = DASH_PATTERNS.dotted;
            lw = 1.5 * lineWidthMultiplier;
          }

          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = lw;
          ctx.setLineDash(dashPattern);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          if (incision.points.length >= 2) {
            drawSmoothCurve(incision.points);
          }
          ctx.setLineDash([]);
        });
      }

      // === LAYER 7: Arrows (movement direction) ===
      if (drawing.arrows) {
        drawing.arrows.forEach(arrow => {
          const color = arrow.color || COLORS.arrow;
          const from = toCanvasCoords(arrow.from);
          const to = toCanvasCoords(arrow.to);
          const arrowType = arrow.type || 'straight';

          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = 2.5 * lineWidthMultiplier;
          ctx.setLineDash([]);
          ctx.lineCap = 'round';

          if (arrowType === 'curved' && arrow.pivotPoint) {
            // Curved rotation arrow
            const pivot = toCanvasCoords(arrow.pivotPoint);
            const radius = Math.sqrt((from.x - pivot.x) ** 2 + (from.y - pivot.y) ** 2);
            const startAngle = Math.atan2(from.y - pivot.y, from.x - pivot.x);
            const endAngle = Math.atan2(to.y - pivot.y, to.x - pivot.x);

            ctx.beginPath();
            ctx.arc(pivot.x, pivot.y, radius, startAngle, endAngle, false);
            ctx.stroke();

            const tangentAngle = endAngle + Math.PI / 2;
            drawFilledArrowhead(ctx, to.x, to.y, tangentAngle, color, 12);
          } else if (arrowType === 'transposition') {
            // Bezier curve with lift
            const midX = (from.x + to.x) / 2;
            const midY = Math.min(from.y, to.y) - 30;

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.quadraticCurveTo(midX, midY, to.x, to.y);
            ctx.stroke();

            const t = 0.98;
            const tangentX = 2 * (1 - t) * (midX - from.x) + 2 * t * (to.x - midX);
            const tangentY = 2 * (1 - t) * (midY - from.y) + 2 * t * (to.y - midY);
            const angle = Math.atan2(tangentY, tangentX);
            drawFilledArrowhead(ctx, to.x, to.y, angle, color, 14);
          } else {
            // Straight advancement arrow
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();

            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            drawFilledArrowhead(ctx, to.x, to.y, angle, color, 14);
          }
        });
      }

      // === LAYER 8: Pivot point ===
      if (drawing.pivot_point) {
        const pt = toCanvasCoords(drawing.pivot_point.position);
        drawPivotPoint(ctx, pt, drawing.pivot_point.label || 'Pivot');
      }

      // === LAYER 9: Labels ===
      const labels: Array<{ centroid: { x: number; y: number }; labelPos: { x: number; y: number }; text: string; color: string }> = [];

      if (drawing.defect_area?.points) {
        const c = getCentroid(drawing.defect_area.points);
        const cc = toCanvasCoords(c);
        labels.push({ centroid: cc, labelPos: cc, text: drawing.defect_area.label || 'Defekt', color: COLORS.defect.stroke });
      }

      if (drawing.donor_area?.points) {
        const c = getCentroid(drawing.donor_area.points);
        const cc = toCanvasCoords(c);
        labels.push({ centroid: cc, labelPos: cc, text: drawing.donor_area.label || 'Donor', color: COLORS.donor.stroke });
      }

      if (drawing.flap_areas) {
        drawing.flap_areas.forEach((fa, i) => {
          const c = getCentroid(fa.points);
          const cc = toCanvasCoords(c);
          const colorSet = i === 0 ? COLORS.flap : COLORS.flapSecondary;
          labels.push({ centroid: cc, labelPos: cc, text: fa.label || `Flep ${i + 1}`, color: fa.color || colorSet.stroke });
        });
      }

      if (drawing.incision_lines) {
        drawing.incision_lines.forEach(inc => {
          if (inc.label && inc.points.length >= 2) {
            const midIdx = Math.floor(inc.points.length / 2);
            const midPt = toCanvasCoords(inc.points[midIdx]);
            labels.push({ centroid: midPt, labelPos: { x: midPt.x, y: midPt.y - 16 }, text: inc.label, color: inc.color || COLORS.incision });
          }
        });
      }

      if (drawing.burow_triangles) {
        drawing.burow_triangles.forEach(tri => {
          if (tri.label) {
            const c = getCentroid(tri.points);
            const cc = toCanvasCoords(c);
            labels.push({ centroid: cc, labelPos: cc, text: tri.label, color: COLORS.burow.stroke });
          }
        });
      }

      if (drawing.arrows) {
        drawing.arrows.forEach(arrow => {
          if (arrow.label) {
            const from = toCanvasCoords(arrow.from);
            const to = toCanvasCoords(arrow.to);
            const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - 18 };
            labels.push({ centroid: mid, labelPos: mid, text: arrow.label, color: arrow.color || COLORS.arrow });
          }
        });
      }

      // Draw leader lines and labels
      labels.forEach(({ centroid, labelPos, text, color }) => {
        if (Math.abs(centroid.x - labelPos.x) > 5 || Math.abs(centroid.y - labelPos.y) > 5) {
          drawLeaderLine(ctx, centroid, labelPos, color);
        }
        drawLabel(ctx, labelPos, text, color, 12);
      });
    });

    // === LAYER 10: Anatomical Landmarks ===
    if (showLandmarks && anatomicalLandmarks) {
      const lm = anatomicalLandmarks;

      // Key landmark points
      drawLandmarkPoint(ctx, toCanvasCoords(lm.leftEye), 'Sol Göz', 4);
      drawLandmarkPoint(ctx, toCanvasCoords(lm.rightEye), 'Sağ Göz', 4);
      drawLandmarkPoint(ctx, toCanvasCoords(lm.noseTip), 'Burun', 4);
      drawLandmarkPoint(ctx, toCanvasCoords(lm.noseBase), undefined, 3);
      drawLandmarkPoint(ctx, toCanvasCoords(lm.chin), 'Çene', 4);
      drawLandmarkPoint(ctx, toCanvasCoords(lm.leftMouthCorner), undefined, 3);
      drawLandmarkPoint(ctx, toCanvasCoords(lm.rightMouthCorner), undefined, 3);

      if (lm.foreheadCenter) {
        drawLandmarkPoint(ctx, toCanvasCoords(lm.foreheadCenter), 'Alın', 3);
      }
      if (lm.leftEyebrow) {
        drawLandmarkPoint(ctx, toCanvasCoords(lm.leftEyebrow), undefined, 3);
      }
      if (lm.rightEyebrow) {
        drawLandmarkPoint(ctx, toCanvasCoords(lm.rightEyebrow), undefined, 3);
      }

      // Eye line (horizontal)
      const eyeLineFrom = toCanvasCoords({ x: 50, y: lm.eyeLine.y });
      const eyeLineTo = toCanvasCoords({ x: 950, y: lm.eyeLine.y });
      drawReferenceLine(ctx, eyeLineFrom, eyeLineTo, 'Göz Hattı');

      // Mouth line (horizontal)
      const mouthLineFrom = toCanvasCoords({ x: 50, y: lm.mouthLine.y });
      const mouthLineTo = toCanvasCoords({ x: 950, y: lm.mouthLine.y });
      drawReferenceLine(ctx, mouthLineFrom, mouthLineTo, 'Ağız Hattı');

      // Facial midline (vertical)
      const midlineFrom = toCanvasCoords({ x: lm.facialMidline.topX, y: 50 });
      const midlineTo = toCanvasCoords({ x: lm.facialMidline.bottomX, y: 950 });
      drawReferenceLine(ctx, midlineFrom, midlineTo, 'Yüz Orta Hattı');
    }
  }, [imageInfo, flapSuggestions, selectedFlapIndex, showLandmarks, anatomicalLandmarks, drawHatching, drawLabel, drawLeaderLine, drawFilledArrowhead, drawPivotPoint, drawLandmarkPoint, drawReferenceLine]);

  // ─── Main Canvas Draw ───

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageInfo) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw annotation in annotation mode
    if (showAnnotationMode && currentAnnotation) {
      const shape = currentAnnotation.shape || currentShape;

      if (shape === 'circle') {
        const centerX = currentAnnotation.x + currentAnnotation.width / 2;
        const centerY = currentAnnotation.y + currentAnnotation.height / 2;
        const radius = Math.max(Math.abs(currentAnnotation.width), Math.abs(currentAnnotation.height)) / 2;

        // Fill with cross-hatching
        ctx.fillStyle = 'rgba(220, 38, 38, 0.15)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Cross-hatching inside circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.clip();
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
        ctx.lineWidth = 0.8;
        for (let i = centerX - radius * 2; i < centerX + radius * 2; i += 8) {
          ctx.beginPath();
          ctx.moveTo(i, centerY - radius);
          ctx.lineTo(i + radius * 2, centerY + radius);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(i + radius * 2, centerY - radius);
          ctx.lineTo(i, centerY + radius);
          ctx.stroke();
        }
        ctx.restore();

        // Red border with dashes
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        drawLabel(ctx, { x: centerX, y: centerY }, 'Defekt', '#DC2626', 11);
      } else if (shape === 'polygon' && currentAnnotation.points && currentAnnotation.points.length >= 3) {
        const pts = currentAnnotation.points;

        // Fill
        ctx.fillStyle = 'rgba(220, 38, 38, 0.15)';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();

        // Cross-hatching
        drawHatching(ctx, pts, 'cross', 'rgba(220, 38, 38, 0.3)', 8);

        // Border
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);

        // Label at centroid
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        drawLabel(ctx, { x: cx, y: cy }, 'Defekt', '#DC2626', 11);
      } else {
        // Rectangle with professional styling
        const { x, y, width, height } = currentAnnotation;

        // Fill
        ctx.fillStyle = 'rgba(220, 38, 38, 0.15)';
        ctx.fillRect(x, y, width, height);

        // Cross-hatching
        const rectPoints = [
          { x, y },
          { x: x + width, y },
          { x: x + width, y: y + height },
          { x, y: y + height },
        ];
        drawHatching(ctx, rectPoints, 'cross', 'rgba(220, 38, 38, 0.3)', 8);

        // Dashed border
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);

        // Label
        drawLabel(ctx, { x: x + width / 2, y: y + height / 2 }, 'Defekt', '#DC2626', 11);
      }
    }

    // Draw flap drawings when not in annotation mode
    if (!showAnnotationMode && flapSuggestions.length > 0) {
      drawFlapDrawings(ctx);
    }

    // Draw landmarks even in non-annotation mode (on top of flaps)
    if (!showAnnotationMode && showLandmarks && anatomicalLandmarks && flapSuggestions.length === 0) {
      // If no flaps but landmarks requested, draw them standalone
      drawFlapDrawings(ctx);
    }
  }, [imageInfo, showAnnotationMode, currentAnnotation, currentShape, flapSuggestions, selectedFlapIndex, showLandmarks, anatomicalLandmarks, drawFlapDrawings, drawHatching, drawLabel]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // ─── Mouse Event Handlers ───

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
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

              // Report imageInfo to parent
              onAnnotationChange?.(currentAnnotation, info);
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

      {/* Annotation controls */}
      {showAnnotationMode && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Şekil Seçimi:</span>
            <button
              onClick={() => { setCurrentShape('rectangle'); onShapeChange?.('rectangle'); clearAnnotation(); }}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${currentShape === 'rectangle' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Kare
            </button>
            <button
              onClick={() => { setCurrentShape('circle'); onShapeChange?.('circle'); clearAnnotation(); }}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${currentShape === 'circle' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Yuvarlak
            </button>
          </div>
          {currentAnnotation ? (
            <div className="flex gap-2 items-center">
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                Lezyon işaretlendi ({currentShape === 'circle' ? 'Yuvarlak' : 'Kare'}): {Math.round(currentAnnotation.width)}px x {Math.round(currentAnnotation.height)}px
              </div>
              <button onClick={clearAnnotation} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                Temizle
              </button>
            </div>
          ) : (
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Fotoğrafın üzerinde sürükle-bırak ile lezyon bölgesini işaretleyin ({currentShape === 'circle' ? 'yuvarlak' : 'kare'} şeklinde)
            </div>
          )}
        </div>
      )}

      {/* Professional Legend - shown when flap drawings are visible */}
      {!showAnnotationMode && flapSuggestions.some(f => f.flap_drawing) && (
        <div className="mt-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
          <div className="flex flex-wrap gap-4 justify-center text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="w-5 h-4 rounded-sm border-2" style={{ borderColor: COLORS.defect.stroke, background: `repeating-linear-gradient(45deg, transparent, transparent 2px, ${COLORS.defect.hatch} 2px, ${COLORS.defect.hatch} 3px), repeating-linear-gradient(-45deg, transparent, transparent 2px, ${COLORS.defect.hatch} 2px, ${COLORS.defect.hatch} 3px)` }} />
              <span className="text-gray-700">Defekt Alanı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-0.5" style={{ borderTop: `2.5px dashed ${COLORS.incision}` }} />
              <span className="text-gray-700">Planlanan Kesi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-4 rounded-sm border-2" style={{ borderColor: COLORS.flap.stroke, backgroundColor: COLORS.flap.fill }} />
              <span className="text-gray-700">Flep Alanı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-4 rounded-sm border-2" style={{ borderColor: COLORS.donor.stroke, background: `repeating-linear-gradient(45deg, transparent, transparent 3px, ${COLORS.donor.hatch} 3px, ${COLORS.donor.hatch} 4px)` }} />
              <span className="text-gray-700">Donor Alan</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="12" viewBox="0 0 20 12">
                <line x1="2" y1="6" x2="14" y2="6" stroke={COLORS.arrow} strokeWidth="2.5" />
                <polygon points="14,2 20,6 14,10" fill={COLORS.arrow} />
              </svg>
              <span className="text-gray-700">Hareket Yönü</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-gray-900 ring-2 ring-white" />
              </div>
              <span className="text-gray-700">Pivot Noktası</span>
            </div>
            {showLandmarks && anatomicalLandmarks && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ border: '1.5px dashed rgba(255,165,0,0.6)', backgroundColor: 'rgba(255,165,0,0.2)' }} />
                <span className="text-gray-700">Anatomik Referans</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
