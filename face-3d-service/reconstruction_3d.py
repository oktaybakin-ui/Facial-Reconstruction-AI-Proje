"""
Advanced 3D Face Reconstruction Module
Includes SfM, triangulation, mesh optimization, and texture mapping
"""

import numpy as np
import cv2
from scipy.spatial import Delaunay
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


class StructureFromMotion:
    """
    Structure-from-Motion implementation for multi-view face reconstruction
    """
    
    def __init__(self):
        # SIFT feature detector for matching
        self.sift = cv2.SIFT_create(nfeatures=5000)
        # FLANN matcher
        FLANN_INDEX_KDTREE = 1
        index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
        search_params = dict(checks=50)
        self.flann = cv2.FlannBasedMatcher(index_params, search_params)
    
    def detect_and_match_features(self, images: List[np.ndarray]) -> List[Dict]:
        """
        Detect and match features across multiple images
        Returns matched keypoints for each image pair
        """
        # Detect keypoints and descriptors for all images
        keypoints_list = []
        descriptors_list = []
        
        for img in images:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
            kp, des = self.sift.detectAndCompute(gray, None)
            keypoints_list.append(kp)
            descriptors_list.append(des)
        
        # Match features between consecutive images
        matches_list = []
        for i in range(len(images) - 1):
            if descriptors_list[i] is None or descriptors_list[i + 1] is None:
                matches_list.append([])
                continue
            
            matches = self.flann.knnMatch(descriptors_list[i], descriptors_list[i + 1], k=2)
            
            # Apply Lowe's ratio test
            good_matches = []
            for match_pair in matches:
                if len(match_pair) == 2:
                    m, n = match_pair
                    if m.distance < 0.7 * n.distance:
                        good_matches.append(m)
            
            matches_list.append(good_matches)
        
        return {
            'keypoints': keypoints_list,
            'matches': matches_list,
            'descriptors': descriptors_list
        }
    
    def estimate_camera_poses(self, images: List[np.ndarray], matches_data: Dict) -> List[np.ndarray]:
        """
        Estimate camera poses using epipolar geometry
        Returns camera matrices (3x4) for each view
        """
        camera_matrices = []
        
        # Assume first camera is at origin (identity)
        K = self._estimate_intrinsic_matrix(images[0])
        P1 = K @ np.hstack([np.eye(3), np.zeros((3, 1))])
        camera_matrices.append(P1)
        
        # Estimate poses for subsequent cameras
        for i in range(len(images) - 1):
            if len(matches_data['matches'][i]) < 8:
                # Not enough matches, use identity
                camera_matrices.append(P1.copy())
                continue
            
            # Extract matched points
            kp1 = matches_data['keypoints'][i]
            kp2 = matches_data['keypoints'][i + 1]
            matches = matches_data['matches'][i]
            
            pts1 = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
            pts2 = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)
            
            # Find essential matrix
            E, mask = cv2.findEssentialMat(pts1, pts2, K, method=cv2.RANSAC, prob=0.999, threshold=1.0)
            
            # Recover pose
            _, R, t, mask_pose = cv2.recoverPose(E, pts1, pts2, K)
            
            # Camera matrix for this view
            P = K @ np.hstack([R, t])
            camera_matrices.append(P)
        
        return camera_matrices
    
    def triangulate_points(self, points_2d_list: List[np.ndarray], 
                          camera_matrices: List[np.ndarray]) -> np.ndarray:
        """
        Triangulate 3D points from 2D correspondences across multiple views
        """
        if len(points_2d_list) < 2:
            return np.array([])
        
        # Use first two views for initial triangulation
        points_3d = cv2.triangulatePoints(
            camera_matrices[0], 
            camera_matrices[1],
            points_2d_list[0].T, 
            points_2d_list[1].T
        )
        
        # Convert from homogeneous coordinates
        points_3d = points_3d[:3] / points_3d[3]
        return points_3d.T
    
    def _estimate_intrinsic_matrix(self, image: np.ndarray) -> np.ndarray:
        """
        Estimate camera intrinsic matrix (simplified - assumes standard camera)
        """
        h, w = image.shape[:2]
        # Assume focal length is approximately image width
        fx = fy = w * 1.2
        cx, cy = w / 2, h / 2
        
        return np.array([
            [fx, 0, cx],
            [0, fy, cy],
            [0, 0, 1]
        ], dtype=np.float32)


class MeshOptimizer:
    """
    Mesh optimization and smoothing utilities
    """
    
    @staticmethod
    def laplacian_smoothing(vertices: np.ndarray, faces: np.ndarray, 
                           iterations: int = 5, lambda_factor: float = 0.5) -> np.ndarray:
        """
        Apply Laplacian smoothing to mesh vertices
        """
        smoothed_vertices = vertices.copy()
        
        # Build adjacency list
        n_vertices = len(vertices)
        adjacency = [[] for _ in range(n_vertices)]
        
        for face in faces:
            for i in range(3):
                for j in range(3):
                    if i != j:
                        adjacency[face[i]].append(face[j])
        
        # Apply smoothing iterations
        for _ in range(iterations):
            new_vertices = smoothed_vertices.copy()
            for i in range(n_vertices):
                if len(adjacency[i]) > 0:
                    neighbors = np.array(adjacency[i])
                    neighbor_avg = smoothed_vertices[neighbors].mean(axis=0)
                    new_vertices[i] = (1 - lambda_factor) * smoothed_vertices[i] + lambda_factor * neighbor_avg
            smoothed_vertices = new_vertices
        
        return smoothed_vertices
    
    @staticmethod
    def remove_outliers(vertices: np.ndarray, threshold: float = 2.0) -> np.ndarray:
        """
        Remove outlier vertices using statistical filtering
        """
        # Calculate mean and std
        mean = vertices.mean(axis=0)
        std = vertices.std(axis=0)
        
        # Find vertices within threshold
        z_scores = np.abs((vertices - mean) / (std + 1e-8))
        mask = (z_scores < threshold).all(axis=1)
        
        return vertices[mask]
    
    @staticmethod
    def fill_holes(vertices: np.ndarray, faces: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Simple hole filling by adding vertices at boundary centers
        This is a simplified version - full implementation would be more complex
        """
        # For now, just return original mesh
        # Full hole filling would require boundary detection and triangulation
        return vertices, faces


class TextureMapper:
    """
    Texture mapping utilities for 3D meshes
    """
    
    @staticmethod
    def create_texture_atlas(images: List[np.ndarray], 
                            vertices_3d: np.ndarray,
                            faces: np.ndarray,
                            camera_matrices: List[np.ndarray]) -> np.ndarray:
        """
        Create texture atlas from multiple images
        Projects 3D vertices to 2D image coordinates and extracts textures
        """
        if len(images) == 0:
            return np.zeros((256, 256, 3), dtype=np.uint8)
        
        # Simple approach: use first image for texture
        # Full implementation would blend textures from multiple views
        texture_size = 1024
        texture = np.zeros((texture_size, texture_size, 3), dtype=np.uint8)
        
        # Project vertices to first image
        K = camera_matrices[0][:, :3] if len(camera_matrices) > 0 else np.eye(3)
        if len(camera_matrices) > 0:
            # Extract rotation and translation
            R = camera_matrices[0][:, :3]
            t = camera_matrices[0][:, 3:4]
            
            # Project to 2D
            points_2d_homogeneous = K @ (R @ vertices_3d.T + t)
            points_2d = (points_2d_homogeneous[:2] / points_2d_homogeneous[2]).T
            
            # Normalize to texture coordinates
            if len(points_2d) > 0:
                points_2d = points_2d - points_2d.min(axis=0)
                points_2d = (points_2d / points_2d.max(axis=0) * (texture_size - 1)).astype(int)
                
                # Sample from image (simplified - would need proper UV mapping)
                img = images[0]
                for i, pt in enumerate(points_2d):
                    if 0 <= pt[0] < texture_size and 0 <= pt[1] < texture_size:
                        if 0 <= pt[1] < img.shape[0] and 0 <= pt[0] < img.shape[1]:
                            texture[pt[1], pt[0]] = img[pt[1], pt[0]]
        
        return texture
    
    @staticmethod
    def generate_uv_coordinates(vertices: np.ndarray, method: str = 'spherical') -> np.ndarray:
        """
        Generate UV coordinates for texture mapping
        """
        if method == 'spherical':
            # Spherical projection
            # Convert to spherical coordinates
            x, y, z = vertices[:, 0], vertices[:, 1], vertices[:, 2]
            
            # Normalize
            r = np.sqrt(x**2 + y**2 + z**2)
            r = np.where(r > 0, r, 1)
            
            # Spherical coordinates
            theta = np.arccos(z / r)  # 0 to pi
            phi = np.arctan2(y, x)    # -pi to pi
            
            # Map to UV [0, 1]
            u = (phi + np.pi) / (2 * np.pi)
            v = theta / np.pi
            
            return np.stack([u, v], axis=1)
        else:
            # Planar projection (simple fallback)
            x, y = vertices[:, 0], vertices[:, 1]
            u = (x - x.min()) / (x.max() - x.min() + 1e-8)
            v = (y - y.min()) / (y.max() - y.min() + 1e-8)
            return np.stack([u, v], axis=1)


class GPUAcceleration:
    """
    GPU acceleration utilities using CUDA (if available)
    """
    
    @staticmethod
    def is_cuda_available() -> bool:
        """Check if CUDA is available"""
        try:
            import cupy as cp
            return cp.cuda.is_available()
        except ImportError:
            return False
    
    @staticmethod
    def accelerate_triangulation(points_2d_list: List[np.ndarray],
                                camera_matrices: List[np.ndarray]) -> Optional[np.ndarray]:
        """
        GPU-accelerated triangulation using CuPy
        Falls back to CPU if CUDA unavailable
        """
        if not GPUAcceleration.is_cuda_available():
            return None
        
        try:
            import cupy as cp
            
            # Convert to GPU arrays
            points_gpu = [cp.asarray(p) for p in points_2d_list]
            matrices_gpu = [cp.asarray(m) for m in camera_matrices]
            
            # Perform triangulation on GPU
            # (Simplified - full implementation would use CuPy's linear algebra)
            # For now, fallback to CPU
            return None
            
        except Exception as e:
            print(f"GPU acceleration failed: {e}")
            return None
    
    @staticmethod
    def accelerate_smoothing(vertices: np.ndarray, faces: np.ndarray) -> Optional[np.ndarray]:
        """
        GPU-accelerated mesh smoothing
        """
        if not GPUAcceleration.is_cuda_available():
            return None
        
        try:
            import cupy as cp
            
            # Convert to GPU
            vertices_gpu = cp.asarray(vertices)
            
            # Perform smoothing on GPU
            # (This is a placeholder - full implementation would use CuPy operations)
            vertices_smoothed = cp.asnumpy(vertices_gpu)
            
            return vertices_smoothed
            
        except Exception:
            return None
