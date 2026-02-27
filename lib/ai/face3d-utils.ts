/**
 * Utility functions for 3D face reconstruction
 */

import sharp from 'sharp';
import { getOpenAIClient } from '@/lib/openai';

/**
 * Downloads and preprocesses an image from URL
 */
export async function downloadAndPreprocessImage(imageUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Resize and normalize image using sharp
    const processedBuffer = await sharp(buffer)
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();
    
    return processedBuffer;
  } catch (error: unknown) {
    throw new Error(`Image preprocessing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Face landmarks detection using Python service (MediaPipe)
 * Falls back to null if Python service is unavailable
 */
import { detectFaceLandmarksPython, type FaceLandmarksResponse } from './face3d-python-client';

export interface FaceLandmarks {
  keypoints: Array<{ x: number; y: number; z?: number; name?: string }>;
  confidence: number;
  bounding_box?: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
    width: number;
    height: number;
  };
  pose_angles?: {
    yaw: number;
    pitch: number;
    roll: number;
  };
}

/**
 * GPT-4o Vision-based face landmark detection fallback
 * Used when the Python MediaPipe service is unavailable.
 * Asks GPT-4o to estimate ~30 facial landmark positions from the image.
 *
 * @param imageUrl Public URL of the face image
 * @returns FaceLandmarks or null on failure
 */
export async function detectFaceLandmarksFromVision(
  imageUrl: string
): Promise<FaceLandmarks | null> {
  try {
    // Fetch image and convert to base64 for the vision API
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn('Failed to fetch image for vision landmark detection:', response.statusText);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Determine MIME type from content-type header or default to jpeg
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64Image}`;

    const openai = getOpenAIClient();

    const prompt = `You are a facial landmark detection system. Analyze this face image and detect approximately 30 key facial landmarks.

For each landmark, provide:
- x: horizontal position (0=left edge, 512=right edge)
- y: vertical position (0=top edge, 512=bottom edge)
- z: estimated depth (0.0=deepest/furthest from camera, 1.0=most protruding/closest to camera)
- name: anatomical name of the landmark

Include these landmarks (use exact names):
jaw_0, jaw_1, jaw_2, jaw_3, jaw_4, jaw_5, jaw_6, jaw_7, jaw_8,
left_eyebrow_0, left_eyebrow_1, left_eyebrow_2,
right_eyebrow_0, right_eyebrow_1, right_eyebrow_2,
left_eye_outer, left_eye_inner, left_eye_top, left_eye_bottom,
right_eye_outer, right_eye_inner, right_eye_top, right_eye_bottom,
nose_bridge, nose_tip, nose_left, nose_right,
mouth_left, mouth_right, mouth_top, mouth_bottom,
forehead_center, chin_tip

Also estimate:
- confidence: 0.0-1.0 (how confident you are in the detection)
- bounding_box: { x_min, y_min, x_max, y_max, width, height } in 0-512 coordinates

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "keypoints": [{"x": 100, "y": 200, "z": 0.5, "name": "jaw_0"}, ...],
  "confidence": 0.75,
  "bounding_box": {"x_min": 50, "y_min": 30, "x_max": 460, "y_max": 490, "width": 410, "height": 460}
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.warn('GPT-4o vision returned empty content for landmark detection');
      return null;
    }

    // Extract JSON from the response (handle possible markdown code blocks)
    let jsonString = content.trim();
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonString) as {
      keypoints: Array<{ x: number; y: number; z: number; name: string }>;
      confidence: number;
      bounding_box?: {
        x_min: number;
        y_min: number;
        x_max: number;
        y_max: number;
        width: number;
        height: number;
      };
    };

    // Validate basic structure
    if (
      !parsed.keypoints ||
      !Array.isArray(parsed.keypoints) ||
      parsed.keypoints.length === 0
    ) {
      console.warn('GPT-4o vision returned invalid keypoints structure');
      return null;
    }

    // Validate and clamp keypoint values
    const validatedKeypoints = parsed.keypoints
      .filter(
        (kp) =>
          typeof kp.x === 'number' &&
          typeof kp.y === 'number' &&
          typeof kp.z === 'number' &&
          typeof kp.name === 'string'
      )
      .map((kp) => ({
        x: Math.max(0, Math.min(512, kp.x)),
        y: Math.max(0, Math.min(512, kp.y)),
        z: Math.max(0, Math.min(1, kp.z)),
        name: kp.name,
      }));

    if (validatedKeypoints.length < 5) {
      console.warn(`GPT-4o vision returned too few valid keypoints: ${validatedKeypoints.length}`);
      return null;
    }

    return {
      keypoints: validatedKeypoints,
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.6)),
      bounding_box: parsed.bounding_box
        ? {
            x_min: parsed.bounding_box.x_min,
            y_min: parsed.bounding_box.y_min,
            x_max: parsed.bounding_box.x_max,
            y_max: parsed.bounding_box.y_max,
            width: parsed.bounding_box.width,
            height: parsed.bounding_box.height,
          }
        : undefined,
    };
  } catch (error: unknown) {
    console.warn(
      'GPT-4o vision landmark detection failed:',
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

/**
 * Detect face landmarks from image URL using Python service
 * Note: imageBuffer parameter is kept for backward compatibility but not used
 * The Python service needs image URLs, not buffers
 */
export async function detectFaceLandmarks(
  imageBuffer: Buffer,
  imageUrl?: string
): Promise<FaceLandmarks | null> {
  // Attempt 1: Python MediaPipe service (fastest and most accurate)
  if (imageUrl) {
    try {
      const result = await detectFaceLandmarksPython(imageUrl);
      if (result) {
        // Convert Python service response to our format
        return {
          keypoints: result.landmarks.map((lm, idx) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            name: `landmark_${idx}`,
          })),
          confidence: result.confidence,
          bounding_box: result.bounding_box,
          pose_angles: result.pose_angles,
        };
      }
    } catch (error: unknown) {
      console.warn('Python service face detection failed, trying GPT-4o vision fallback:', error instanceof Error ? error.message : String(error));
    }

    // Attempt 2: GPT-4o Vision fallback (works without Python service)
    try {
      const visionResult = await detectFaceLandmarksFromVision(imageUrl);
      if (visionResult) {
        console.info('Face landmarks detected via GPT-4o vision fallback');
        return visionResult;
      }
    } catch (error: unknown) {
      console.warn('GPT-4o vision fallback also failed:', error instanceof Error ? error.message : String(error));
    }
  }

  // Attempt 3: Return null - mesh generator will create a basic ellipsoid
  return null;
}

/**
 * Generates a higher-quality 3D mesh from detected face landmarks.
 * Centers and normalizes the landmarks, then triangulates them in horizontal strips.
 *
 * Only used when there are enough landmarks (>10 keypoints) to produce
 * a meaningful face surface.
 */
function generateMeshFromLandmarks(landmarks: FaceLandmarks): {
  vertices: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
} {
  const keypoints = landmarks.keypoints;

  // -- Step 1: Compute bounding box and center --
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const kp of keypoints) {
    const z = kp.z ?? 0.5;
    if (kp.x < minX) minX = kp.x;
    if (kp.x > maxX) maxX = kp.x;
    if (kp.y < minY) minY = kp.y;
    if (kp.y > maxY) maxY = kp.y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const rangeZ = maxZ - minZ || 1;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  // Normalize to roughly -1..+1
  const scale = 2 / Math.max(rangeX, rangeY);

  // -- Step 2: Build vertices (centered and scaled) --
  const vertices: number[] = [];
  for (const kp of keypoints) {
    const z = kp.z ?? 0.5;
    vertices.push(
      (kp.x - centerX) * scale,
      -(kp.y - centerY) * scale, // Flip Y so up is positive
      (z - centerZ) * (2 / rangeZ) * 0.5 // Depth scaled more subtly
    );
  }

  // -- Step 3: Sort keypoints by Y then X for strip-based triangulation --
  const sortedIndices = Array.from({ length: keypoints.length }, (_, i) => i);
  sortedIndices.sort((a, b) => {
    const dy = keypoints[a].y - keypoints[b].y;
    if (Math.abs(dy) > 5) return dy; // 5-pixel tolerance for same row
    return keypoints[a].x - keypoints[b].x;
  });

  // -- Step 4: Group into horizontal strips --
  const strips: number[][] = [];
  let currentStrip: number[] = [sortedIndices[0]];
  const stripTolerance = rangeY / 6; // ~6 horizontal bands

  for (let i = 1; i < sortedIndices.length; i++) {
    const prevY = keypoints[sortedIndices[i - 1]].y;
    const currY = keypoints[sortedIndices[i]].y;
    if (currY - prevY > stripTolerance && currentStrip.length > 0) {
      strips.push(currentStrip);
      currentStrip = [];
    }
    currentStrip.push(sortedIndices[i]);
  }
  if (currentStrip.length > 0) {
    strips.push(currentStrip);
  }

  // -- Step 5: Triangulate between adjacent strips --
  const indices: number[] = [];
  for (let s = 0; s < strips.length - 1; s++) {
    const upper = strips[s];
    const lower = strips[s + 1];
    if (upper.length === 0 || lower.length === 0) continue;

    let ui = 0;
    let li = 0;

    // Walk along both strips creating triangles
    while (ui < upper.length - 1 || li < lower.length - 1) {
      if (ui >= upper.length - 1) {
        // Only lower strip has more points
        indices.push(upper[Math.min(ui, upper.length - 1)], lower[li], lower[li + 1]);
        li++;
      } else if (li >= lower.length - 1) {
        // Only upper strip has more points
        indices.push(upper[ui], lower[Math.min(li, lower.length - 1)], upper[ui + 1]);
        ui++;
      } else {
        // Both strips have more points - create quad as two triangles
        indices.push(upper[ui], lower[li], upper[ui + 1]);
        indices.push(upper[ui + 1], lower[li], lower[li + 1]);
        ui++;
        li++;
      }
    }
  }

  // Also triangulate within strips that have 3+ points (fan from first point)
  for (const strip of strips) {
    if (strip.length >= 3) {
      for (let i = 1; i < strip.length - 1; i++) {
        indices.push(strip[0], strip[i], strip[i + 1]);
      }
    }
  }

  // -- Step 6: Compute per-vertex normals from triangles --
  const normals = new Array(vertices.length).fill(0);

  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i];
    const i1 = indices[i + 1];
    const i2 = indices[i + 2];

    const ax = vertices[i1 * 3] - vertices[i0 * 3];
    const ay = vertices[i1 * 3 + 1] - vertices[i0 * 3 + 1];
    const az = vertices[i1 * 3 + 2] - vertices[i0 * 3 + 2];
    const bx = vertices[i2 * 3] - vertices[i0 * 3];
    const by = vertices[i2 * 3 + 1] - vertices[i0 * 3 + 1];
    const bz = vertices[i2 * 3 + 2] - vertices[i0 * 3 + 2];

    // Cross product for face normal
    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;

    // Accumulate on each vertex of the triangle
    for (const vi of [i0, i1, i2]) {
      normals[vi * 3] += nx;
      normals[vi * 3 + 1] += ny;
      normals[vi * 3 + 2] += nz;
    }
  }

  // Normalize all vertex normals; default to outward (+Z) if degenerate
  for (let i = 0; i < normals.length; i += 3) {
    const len = Math.sqrt(normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2);
    if (len > 0) {
      normals[i] /= len;
      normals[i + 1] /= len;
      normals[i + 2] /= len;
    } else {
      normals[i] = 0;
      normals[i + 1] = 0;
      normals[i + 2] = 1;
    }

    // Ensure normals face outward (positive Z toward camera)
    if (normals[i + 2] < 0) {
      normals[i] = -normals[i];
      normals[i + 1] = -normals[i + 1];
      normals[i + 2] = -normals[i + 2];
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
    normals: new Float32Array(normals),
  };
}

/**
 * Generates a basic ellipsoid face mesh as a low-quality fallback.
 * Used when no landmarks are available.
 */
function generateEllipsoidMesh(): {
  vertices: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
} {
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];

  const segments = 32;
  const rings = 16;

  for (let ring = 0; ring <= rings; ring++) {
    const theta = (ring / rings) * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let seg = 0; seg <= segments; seg++) {
      const phi = (seg / segments) * 2 * Math.PI;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      // Face-shaped ellipsoid (slightly flattened)
      const x = 0.5 * cosPhi * sinTheta;
      const y = 0.5 * cosTheta;
      const z = 0.4 * sinPhi * sinTheta;

      vertices.push(x, y, z);

      // Normal (pointing outward)
      const length = Math.sqrt(x * x + y * y + z * z);
      if (length > 0) {
        normals.push(x / length, y / length, z / length);
      } else {
        normals.push(0, 1, 0);
      }
    }
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const first = ring * (segments + 1) + seg;
      const second = first + segments + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
    normals: new Float32Array(normals),
  };
}

/**
 * Generates a 3D mesh from face landmarks.
 *
 * When landmarks with enough keypoints (>10) are available, creates a
 * landmark-based mesh with proper triangulation. Otherwise falls back to
 * a basic ellipsoid shape.
 */
export function generateFaceMesh(landmarks: FaceLandmarks[]): {
  vertices: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
} {
  // If we have landmarks with enough keypoints, use the landmark-based mesh
  if (landmarks.length > 0) {
    // Pick the landmark set with the most keypoints
    const bestLandmarks = landmarks.reduce((best, current) =>
      current.keypoints.length > best.keypoints.length ? current : best
    );

    if (bestLandmarks.keypoints.length > 10) {
      try {
        return generateMeshFromLandmarks(bestLandmarks);
      } catch (error: unknown) {
        console.warn(
          'Landmark-based mesh generation failed, falling back to ellipsoid:',
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  // Fallback: Generate a basic face-shaped ellipsoid mesh
  return generateEllipsoidMesh();
}
