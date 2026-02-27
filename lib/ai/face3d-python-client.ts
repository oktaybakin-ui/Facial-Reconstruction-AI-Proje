/**
 * Python Face 3D Reconstruction Service Client
 * Communicates with the Python microservice for face landmarks detection and reconstruction
 */

const PYTHON_SERVICE_URL = process.env.PYTHON_FACE_3D_SERVICE_URL || 'http://localhost:8000';

export interface FaceLandmark {
  x: number;
  y: number;
  z: number;
}

export interface FaceLandmarksResponse {
  landmarks: FaceLandmark[];
  confidence: number;
  bounding_box: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
    width: number;
    height: number;
  };
  pose_angles: {
    yaw: number;
    pitch: number;
    roll: number;
  };
}

export interface MultiViewReconstructionResponse {
  landmarks_list: FaceLandmarksResponse[];
  reconstruction_quality: number;
  estimated_3d_points?: number[][];
  mesh_vertices?: number[][];
  mesh_faces?: number[][];
  texture_data?: string; // Base64 encoded texture
  warnings: string[];
  gpu_accelerated: boolean;
}

/**
 * Check if Python service is available
 */
export async function checkPythonService(): Promise<boolean> {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('Python service not available:', error);
    return false;
  }
}

/**
 * Detect face landmarks from a single image
 */
export async function detectFaceLandmarksPython(imageUrl: string): Promise<FaceLandmarksResponse | null> {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/detect-landmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url: imageUrl }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Python service error:', errorData.detail || response.statusText);
      return null;
    }

    const data = await response.json();
    return data as FaceLandmarksResponse;
  } catch (error: unknown) {
    console.error('Error calling Python service:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Multi-view reconstruction from multiple images
 */
export async function multiViewReconstructionPython(
  imageUrls: string[]
): Promise<MultiViewReconstructionResponse | null> {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/multi-view-reconstruction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_urls: imageUrls }),
      signal: AbortSignal.timeout(60000), // 60 second timeout for multiple images
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('Python service error:', errorData.detail || response.statusText);
      return null;
    }

    const data = await response.json();
    return data as MultiViewReconstructionResponse;
  } catch (error: unknown) {
    console.error('Error calling Python service for multi-view reconstruction:', error instanceof Error ? error.message : String(error));
    return null;
  }
}
