'use client';

// html2canvas and canvg are optional dependencies for SVG export
// They are dynamically used when needed

/**
 * Vectorization Service
 * Converts raster images to SVG format
 */

/**
 * Convert canvas to SVG using trace-based approach
 */
export async function canvasToSVG(
  canvas: HTMLCanvasElement,
  options: {
    simplify?: boolean;
    precision?: number;
  } = {}
): Promise<string> {
  const { simplify = true, precision = 2 } = options;
  
  // Get image data
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Simple SVG conversion: Create paths from image data
  // This is a simplified approach - for production, use Potrace or similar
  const svgPaths: string[] = [];
  const width = canvas.width;
  const height = canvas.height;
  
  // Convert to grayscale and create paths
  // This is a basic implementation - for better results, use Potrace
  const threshold = 128;
  const paths: Array<{ d: string; fill: string }> = [];
  
  // Simple edge detection and path creation
  for (let y = 0; y < height; y += 5) { // Sample every 5 pixels for performance
    let pathStart: { x: number; y: number } | null = null;
    for (let x = 0; x < width; x += 5) {
      const idx = (y * width + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      const gray = (r + g + b) / 3;
      
      if (gray < threshold) {
        if (!pathStart) {
          pathStart = { x, y };
        }
      } else {
        if (pathStart) {
          // Create a simple path
          const d = `M ${pathStart.x} ${pathStart.y} L ${x} ${y}`;
          paths.push({ d, fill: '#000000' });
          pathStart = null;
        }
      }
    }
  }
  
  // Build SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${paths.map(p => `<path d="${p.d}" fill="${p.fill}" stroke="none"/>`).join('\n')}
    </svg>
  `.trim();
  
  return svg;
}

/**
 * Export flap drawing as SVG
 */
export async function exportFlapDrawingAsSVG(
  imageUrl: string,
  flapDrawing: unknown,
  options: {
    includeImage?: boolean;
    includeOverlays?: boolean;
  } = {}
): Promise<string> {
  const { includeImage = true, includeOverlays = true } = options;
  
  // Create a temporary canvas
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  return new Promise((resolve, reject) => {
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw image
        if (includeImage) {
          ctx.drawImage(img, 0, 0);
        }
        
        // Draw flap drawing (simplified - would need proper coordinate conversion)
        if (includeOverlays && flapDrawing) {
          // This is a placeholder - actual implementation would draw flap paths
          ctx.strokeStyle = '#FF0000';
          ctx.lineWidth = 2;
          // Draw defect, flap, etc. based on flapDrawing data
        }
        
        // Convert to SVG
        const svg = await canvasToSVG(canvas);
        resolve(svg);
      } catch (error: unknown) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

/**
 * Download SVG file
 */
export function downloadSVG(svgContent: string, filename: string = 'flap-drawing.svg'): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

