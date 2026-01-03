# Face 3D Reconstruction Python Service

MediaPipe kullanarak face landmarks detection, pose estimation ve multi-view reconstruction sağlayan FastAPI servisi.

## Kurulum

### 1. Python 3.8+ Kurulumu

Python'un kurulu olduğundan emin olun:
```bash
python --version
```

### 2. Virtual Environment Oluşturma (Önerilir)

```bash
cd face-3d-service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Paketleri Yükleme

```bash
pip install -r requirements.txt
```

## Kullanım

### Servisi Başlatma

```bash
python app.py
```

Veya:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Servis `http://localhost:8000` adresinde çalışacaktır.

### API Endpoints

#### 1. Health Check
```
GET /health
```

#### 2. Face Landmarks Detection
```
POST /detect-landmarks
Body: {
  "image_url": "https://example.com/image.jpg"
}
```

Response:
```json
{
  "landmarks": [
    {"x": 100, "y": 150, "z": 0.1},
    ...
  ],
  "confidence": 0.9,
  "bounding_box": {
    "x_min": 50,
    "y_min": 80,
    "x_max": 200,
    "y_max": 250,
    "width": 150,
    "height": 170
  },
  "pose_angles": {
    "yaw": 5.2,
    "pitch": -2.1,
    "roll": 0.5
  }
}
```

#### 3. Multi-View Reconstruction
```
POST /multi-view-reconstruction
Body: {
  "image_urls": [
    "https://example.com/front.jpg",
    "https://example.com/left.jpg",
    ...
  ]
}
```

Response:
```json
{
  "landmarks_list": [...],
  "reconstruction_quality": 0.85,
  "estimated_3d_points": [[x, y, z], ...],
  "warnings": []
}
```

## Environment Variables

`.env` dosyası oluşturabilirsiniz:

```
PORT=8000
```

## Docker (Opsiyonel)

Dockerfile eklenecek (gerekirse).

## Gelişmiş Özellikler

### ✅ Structure-from-Motion (SfM)
- SIFT feature detection ve matching
- Camera pose estimation
- Epipolar geometry

### ✅ Triangulation ile 3D Point Cloud
- Multi-view triangulation
- GPU acceleration desteği (CUDA)

### ✅ Mesh Optimization
- Laplacian smoothing
- Outlier removal
- Statistical filtering

### ✅ Texture Mapping
- Multi-view texture atlas
- UV coordinate generation
- Spherical/planar projection

### ✅ GPU Acceleration
- CUDA support (CuPy ile)
- GPU-accelerated triangulation ve smoothing

Detaylı bilgi için: `ADVANCED_FEATURES.md`

## Notlar

- MediaPipe Face Mesh 468 landmark noktası tespit eder
- Pose estimation (yaw, pitch, roll) anahtar landmark'lar kullanılarak yapılır
- SfM ve triangulation ile gelişmiş 3D reconstruction
- GPU acceleration için CUDA ve CuPy gerekli (opsiyonel)
