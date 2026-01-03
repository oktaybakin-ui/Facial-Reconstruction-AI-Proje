"""
Face 3D Reconstruction Service
FastAPI service for face landmarks detection, pose estimation, and 3D reconstruction
"""

import os
import io
import base64
from typing import List, Optional, Dict, Any
import numpy as np
import cv2
from PIL import Image
import httpx
import mediapipe as mp
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

# Import advanced reconstruction modules
from reconstruction_3d import (
    StructureFromMotion,
    MeshOptimizer,
    TextureMapper,
    GPUAcceleration
)

app = FastAPI(title="Face 3D Reconstruction Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your Next.js domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe
mp_face_mesh = mp.solutions.face_mesh
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils


class ImageUrlRequest(BaseModel):
    image_url: HttpUrl


class FaceLandmarksResponse(BaseModel):
    landmarks: List[Dict[str, float]]
    confidence: float
    bounding_box: Dict[str, float]
    pose_angles: Dict[str, float]  # yaw, pitch, roll


class MultiViewReconstructionRequest(BaseModel):
    image_urls: List[HttpUrl]
    expected_angles: Optional[List[str]] = None  # ["front", "left_30", "right_30", etc.]


class MultiViewReconstructionResponse(BaseModel):
    landmarks_list: List[FaceLandmarksResponse]
    reconstruction_quality: float
    estimated_3d_points: Optional[List[List[float]]] = None
    mesh_vertices: Optional[List[List[float]]] = None
    mesh_faces: Optional[List[List[int]]] = None
    texture_data: Optional[str] = None  # Base64 encoded texture
    warnings: List[str] = []
    gpu_accelerated: bool = False


def download_image(url: str) -> np.ndarray:
    """Download image from URL and convert to numpy array"""
    try:
        response = httpx.get(url, timeout=30.0)
        response.raise_for_status()
        
        image_bytes = io.BytesIO(response.content)
        image = Image.open(image_bytes)
        image = image.convert('RGB')
        
        return np.array(image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")


def detect_face_landmarks(image: np.ndarray) -> Optional[Dict[str, Any]]:
    """
    Detect face landmarks using MediaPipe Face Mesh
    Returns landmarks, confidence, bounding box, and pose angles
    """
    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    ) as face_mesh:
        # Convert BGR to RGB (MediaPipe expects RGB)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_image)
        
        if not results.multi_face_landmarks:
            return None
        
        face_landmarks = results.multi_face_landmarks[0]
        
        # Extract landmarks (468 points for Face Mesh)
        landmarks = []
        h, w = image.shape[:2]
        
        for landmark in face_landmarks.landmark:
            landmarks.append({
                "x": landmark.x * w,
                "y": landmark.y * h,
                "z": landmark.z * w,  # z is relative to image width
            })
        
        # Calculate bounding box
        x_coords = [lm["x"] for lm in landmarks]
        y_coords = [lm["y"] for lm in landmarks]
        bbox = {
            "x_min": min(x_coords),
            "y_min": min(y_coords),
            "x_max": max(x_coords),
            "y_max": max(y_coords),
            "width": max(x_coords) - min(x_coords),
            "height": max(y_coords) - min(y_coords),
        }
        
        # Estimate pose angles (simplified calculation)
        # Using key facial landmarks for pose estimation
        nose_tip = landmarks[1]  # Nose tip landmark
        left_eye = landmarks[33]
        right_eye = landmarks[263]
        chin = landmarks[175]
        
        # Calculate yaw (left-right rotation)
        eye_center_x = (left_eye["x"] + right_eye["x"]) / 2
        yaw = np.arctan2(nose_tip["x"] - eye_center_x, nose_tip["z"]) * 180 / np.pi
        
        # Calculate pitch (up-down rotation)
        eye_center_y = (left_eye["y"] + right_eye["y"]) / 2
        pitch = np.arctan2(nose_tip["y"] - eye_center_y, nose_tip["z"]) * 180 / np.pi
        
        # Calculate roll (head tilt)
        roll = np.arctan2(right_eye["y"] - left_eye["y"], right_eye["x"] - left_eye["x"]) * 180 / np.pi
        
        # Confidence based on face detection
        confidence = 0.9  # MediaPipe doesn't provide confidence, using default
        
        return {
            "landmarks": landmarks,
            "confidence": confidence,
            "bounding_box": bbox,
            "pose_angles": {
                "yaw": float(yaw),
                "pitch": float(pitch),
                "roll": float(roll),
            }
        }


@app.get("/")
async def root():
    return {"message": "Face 3D Reconstruction Service", "status": "running"}


@app.post("/detect-landmarks", response_model=FaceLandmarksResponse)
async def detect_landmarks(request: ImageUrlRequest):
    """
    Detect face landmarks from a single image
    Returns 468 landmarks, confidence, bounding box, and pose angles
    """
    try:
        image = download_image(str(request.image_url))
        result = detect_face_landmarks(image)
        
        if not result:
            raise HTTPException(status_code=404, detail="No face detected in image")
        
        return FaceLandmarksResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/multi-view-reconstruction", response_model=MultiViewReconstructionResponse)
async def multi_view_reconstruction(request: MultiViewReconstructionRequest):
    """
    Process multiple images from different angles and reconstruct 3D face
    Validates angles, detects landmarks, and estimates reconstruction quality
    """
    if len(request.image_urls) < 2:
        raise HTTPException(status_code=400, detail="At least 2 images required for multi-view reconstruction")
    
    landmarks_list = []
    warnings = []
    
    # Process each image
    for idx, url in enumerate(request.image_urls):
        try:
            image = download_image(str(url))
            result = detect_face_landmarks(image)
            
            if result:
                landmarks_list.append(FaceLandmarksResponse(**result))
            else:
                warnings.append(f"Image {idx + 1}: No face detected")
        except Exception as e:
            warnings.append(f"Image {idx + 1}: Error processing - {str(e)}")
    
    if len(landmarks_list) == 0:
        raise HTTPException(status_code=404, detail="No faces detected in any image")
    
    # Validate pose angles (check if images are from different angles)
    pose_variations = []
    for landmarks_resp in landmarks_list:
        angles = landmarks_resp.pose_angles
        pose_variations.append({
            "yaw": angles["yaw"],
            "pitch": angles["pitch"],
            "roll": angles["roll"],
        })
    
    # Calculate reconstruction quality
    # Based on number of detected faces, angle diversity, and confidence
    num_detections = len(landmarks_list)
    avg_confidence = sum(lm.confidence for lm in landmarks_list) / len(landmarks_list)
    
    # Check angle diversity
    yaw_range = max(p["yaw"] for p in pose_variations) - min(p["yaw"] for p in pose_variations)
    pitch_range = max(p["pitch"] for p in pose_variations) - min(p["pitch"] for p in pose_variations)
    
    angle_diversity = (abs(yaw_range) + abs(pitch_range)) / 360.0
    
    # Quality score: 0.0 to 1.0
    reconstruction_quality = (
        (num_detections / 9.0) * 0.4 +  # Ideal: 9 images
        avg_confidence * 0.3 +
        min(angle_diversity, 1.0) * 0.3
    )
    
    # Advanced 3D reconstruction using SfM and triangulation
    estimated_3d_points = None
    mesh_vertices = None
    mesh_faces = None
    texture_data = None
    gpu_accelerated = False
    
    if len(landmarks_list) >= 2:
        try:
            # Download images for SfM processing
            images = []
            for url in request.image_urls:
                img = download_image(str(url))
                images.append(img)
            
            # Initialize SfM
            sfm = StructureFromMotion()
            
            # Detect and match features
            matches_data = sfm.detect_and_match_features(images)
            
            # Estimate camera poses
            camera_matrices = sfm.estimate_camera_poses(images, matches_data)
            
            # Extract landmark points for triangulation
            # Use MediaPipe landmarks as correspondences
            landmark_points_2d = []
            for landmarks_resp in landmarks_list:
                # Convert landmarks to 2D points (select key landmarks)
                key_indices = [1, 33, 61, 199, 291, 263, 172, 175]  # Key facial features
                points = []
                for idx in key_indices:
                    if idx < len(landmarks_resp.landmarks):
                        lm = landmarks_resp.landmarks[idx]
                        # Normalize to image coordinates (landmarks are already in pixel coordinates)
                        points.append([lm["x"], lm["y"]])
                if len(points) > 0:
                    landmark_points_2d.append(np.array(points, dtype=np.float32))
            
            # Triangulate 3D points
            if len(landmark_points_2d) >= 2 and len(camera_matrices) >= 2:
                # Try GPU acceleration first
                gpu_points = GPUAcceleration.accelerate_triangulation(
                    landmark_points_2d[:2], 
                    camera_matrices[:2]
                )
                
                if gpu_points is not None:
                    estimated_3d_points = gpu_points.tolist()
                    gpu_accelerated = True
                else:
                    # CPU triangulation
                    estimated_3d_points_3d = sfm.triangulate_points(
                        landmark_points_2d[:2],
                        camera_matrices[:2]
                    )
                    estimated_3d_points = estimated_3d_points_3d.tolist()
                
                # Generate mesh from 3D points
                if estimated_3d_points is not None and len(estimated_3d_points) > 3:
                    points_3d_array = np.array(estimated_3d_points)
                    
                    # Remove outliers
                    points_3d_array = MeshOptimizer.remove_outliers(points_3d_array)
                    
                    # Create Delaunay triangulation (2D projection for mesh generation)
                    # Project to 2D plane for triangulation
                    if len(points_3d_array) >= 4:  # Delaunay requires at least 4 points
                        points_2d_proj = points_3d_array[:, [0, 1]]  # Use X-Y plane
                        try:
                            from scipy.spatial import Delaunay
                            tri = Delaunay(points_2d_proj)
                        
                        # Get mesh faces
                        faces = tri.simplices.tolist()
                        
                        # Apply mesh smoothing
                        smoothed_vertices = MeshOptimizer.laplacian_smoothing(
                            points_3d_array,
                            np.array(faces),
                            iterations=3,
                            lambda_factor=0.3
                        )
                        
                            mesh_vertices = smoothed_vertices.tolist()
                            mesh_faces = faces
                            
                            # Generate texture
                            texture = TextureMapper.create_texture_atlas(
                                images,
                                smoothed_vertices,
                                np.array(faces),
                                camera_matrices
                            )
                            
                            # Encode texture as base64
                            _, buffer = cv2.imencode('.jpg', texture)
                            texture_data = base64.b64encode(buffer).decode('utf-8')
                            
                        except Exception as e:
                            warnings.append(f"Mesh generation failed: {str(e)}")
                    else:
                        warnings.append(f"Insufficient points for mesh generation: {len(points_3d_array)}")
            
        except Exception as e:
            warnings.append(f"Advanced reconstruction failed, using basic method: {str(e)}")
            # Fallback to simple approach
            first_landmarks = landmarks_list[0].landmarks
            estimated_3d_points = [
                [lm["x"], lm["y"], lm["z"]] for lm in first_landmarks[:10]
            ]
    
    # Add warnings about angle diversity
    if yaw_range < 30:
        warnings.append("Low yaw angle diversity - recommend images from different horizontal angles")
    if pitch_range < 10:
        warnings.append("Low pitch angle diversity - recommend images from different vertical angles")
    
    return MultiViewReconstructionResponse(
        landmarks_list=landmarks_list,
        reconstruction_quality=float(reconstruction_quality),
        estimated_3d_points=estimated_3d_points,
        mesh_vertices=mesh_vertices,
        mesh_faces=mesh_faces,
        texture_data=texture_data,
        warnings=warnings,
        gpu_accelerated=gpu_accelerated
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    gpu_available = GPUAcceleration.is_cuda_available()
    return {
        "status": "healthy",
        "gpu_available": gpu_available,
        "features": {
            "sfm": True,
            "triangulation": True,
            "mesh_optimization": True,
            "texture_mapping": True,
            "gpu_acceleration": gpu_available
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
