'use client';

import React, { useRef, useEffect } from 'react';
import type { AnatomicalOverlay as AnatomicalOverlayType } from '@/types/validation';

interface AnatomicalOverlayProps {
  imageUrl: string;
  overlayType: AnatomicalOverlayType['type'];
  visible: boolean;
  opacity: number;
  color?: string;
  imageWidth: number;
  imageHeight: number;
  displayedWidth: number;
  displayedHeight: number;
}

export default function AnatomicalOverlay({
  imageUrl,
  overlayType,
  visible,
  opacity,
  color = '#FFD700',
  imageWidth,
  imageHeight,
  displayedWidth,
  displayedHeight,
}: AnatomicalOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGuideLines = (
    ctx: CanvasRenderingContext2D,
    scale: (value: number, dimension: 'x' | 'y') => number
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    const centerX = scale(imageWidth / 2, 'x');
    const eyeLineY = scale(imageHeight * 0.3, 'y');
    const noseBaseY = scale(imageHeight * 0.5, 'y');
    const chinY = scale(imageHeight * 0.85, 'y');

    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, scale(imageHeight, 'y'));
    ctx.stroke();

    // Eye line
    ctx.beginPath();
    ctx.moveTo(0, eyeLineY);
    ctx.lineTo(scale(imageWidth, 'x'), eyeLineY);
    ctx.stroke();

    // Nose base line
    ctx.beginPath();
    ctx.moveTo(0, noseBaseY);
    ctx.lineTo(scale(imageWidth, 'x'), noseBaseY);
    ctx.stroke();

    // Chin line
    ctx.beginPath();
    ctx.moveTo(0, chinY);
    ctx.lineTo(scale(imageWidth, 'x'), chinY);
    ctx.stroke();
  };

  const drawGoldenRatio = (
    ctx: CanvasRenderingContext2D,
    scale: (value: number, dimension: 'x' | 'y') => number
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    const phi = 1.618; // Golden ratio
    const centerX = scale(imageWidth / 2, 'x');
    const centerY = scale(imageHeight / 2, 'y');

    // Draw golden ratio rectangles (simplified Marquardt mask)
    const rectWidth = scale(imageWidth / phi, 'x');
    const rectHeight = scale(imageHeight / phi, 'y');

    // Main golden rectangle
    ctx.strokeRect(
      centerX - rectWidth / 2,
      centerY - rectHeight / 2,
      rectWidth,
      rectHeight
    );

    // Nested rectangles
    const nestedWidth = rectWidth / phi;
    const nestedHeight = rectHeight / phi;
    ctx.strokeRect(
      centerX - nestedWidth / 2,
      centerY - nestedHeight / 2,
      nestedWidth,
      nestedHeight
    );
  };

  const drawMuscleMap = (
    ctx: CanvasRenderingContext2D,
    scale: (value: number, dimension: 'x' | 'y') => number
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Simplified muscle map - key facial muscles
    const centerX = scale(imageWidth / 2, 'x');
    const eyeY = scale(imageHeight * 0.3, 'y');
    const noseY = scale(imageHeight * 0.5, 'y');
    const mouthY = scale(imageHeight * 0.65, 'y');

    // Frontalis (forehead)
    ctx.beginPath();
    ctx.arc(centerX, scale(imageHeight * 0.2, 'y'), scale(imageWidth * 0.15, 'x'), 0, Math.PI * 2);
    ctx.stroke();

    // Orbicularis oculi (around eyes)
    ctx.beginPath();
    ctx.arc(scale(imageWidth * 0.35, 'x'), eyeY, scale(imageWidth * 0.08, 'x'), 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(scale(imageWidth * 0.65, 'x'), eyeY, scale(imageWidth * 0.08, 'x'), 0, Math.PI * 2);
    ctx.stroke();

    // Orbicularis oris (around mouth)
    ctx.beginPath();
    ctx.ellipse(centerX, mouthY, scale(imageWidth * 0.1, 'x'), scale(imageHeight * 0.05, 'y'), 0, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawBoneMap = (
    ctx: CanvasRenderingContext2D,
    scale: (value: number, dimension: 'x' | 'y') => number
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    const centerX = scale(imageWidth / 2, 'x');

    // Simplified bone structure
    // Orbital rim
    ctx.beginPath();
    ctx.ellipse(scale(imageWidth * 0.35, 'x'), scale(imageHeight * 0.3, 'y'),
      scale(imageWidth * 0.1, 'x'), scale(imageHeight * 0.08, 'y'), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(scale(imageWidth * 0.65, 'x'), scale(imageHeight * 0.3, 'y'),
      scale(imageWidth * 0.1, 'x'), scale(imageHeight * 0.08, 'y'), 0, 0, Math.PI * 2);
    ctx.stroke();

    // Nasal bone
    ctx.beginPath();
    ctx.moveTo(centerX, scale(imageHeight * 0.35, 'y'));
    ctx.lineTo(centerX, scale(imageHeight * 0.5, 'y'));
    ctx.stroke();

    // Zygomatic arch (simplified)
    ctx.beginPath();
    ctx.moveTo(scale(imageWidth * 0.25, 'x'), scale(imageHeight * 0.4, 'y'));
    ctx.lineTo(scale(imageWidth * 0.75, 'x'), scale(imageHeight * 0.4, 'y'));
    ctx.stroke();
  };

  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = displayedWidth;
    canvas.height = displayedHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = opacity;

    // Scale factor
    const scaleX = displayedWidth / imageWidth;
    const scaleY = displayedHeight / imageHeight;

    const scale = (value: number, dimension: 'x' | 'y') => {
      return dimension === 'x' ? value * scaleX : value * scaleY;
    };

    // Draw based on overlay type
    switch (overlayType) {
      case 'guide-lines':
        drawGuideLines(ctx, scale);
        break;
      case 'golden-ratio':
        drawGoldenRatio(ctx, scale);
        break;
      case 'muscle-map':
        drawMuscleMap(ctx, scale);
        break;
      case 'bone-map':
        drawBoneMap(ctx, scale);
        break;
    }
  }, [visible, opacity, overlayType, displayedWidth, displayedHeight, imageWidth, imageHeight]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}

