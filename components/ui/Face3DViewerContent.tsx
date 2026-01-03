'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Face3DViewerContentProps {
  modelUrl: string | null;
  status: 'pending' | 'completed' | 'failed';
  confidence: 'düşük' | 'orta' | 'yüksek' | null;
  onError?: (error: string) => void;
}

export default function Face3DViewerContent({
  modelUrl,
  status,
  confidence,
  onError,
}: Face3DViewerContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sceneInitialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || status !== 'completed' || !modelUrl || sceneInitialized.current) {
      return;
    }

    // Dynamically import Three.js
    Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls'),
      import('three/examples/jsm/loaders/GLTFLoader'),
    ]).then(([THREE, OrbitControlsModule, GLTFLoaderModule]) => {
      const { OrbitControls } = OrbitControlsModule;
      const { GLTFLoader } = GLTFLoaderModule;

      // Initialize Three.js scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current!.clientWidth / containerRef.current!.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current!.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight1.position.set(5, 5, 5);
      scene.add(directionalLight1);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
      directionalLight2.position.set(-5, -5, -5);
      scene.add(directionalLight2);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 2;
      controls.maxDistance = 10;

      // Load 3D model
      const loader = new GLTFLoader();
      setLoading(true);
      setError(null);

      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;
          
          // Center and scale model
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2 / maxDim;
          
          model.scale.multiplyScalar(scale);
          model.position.sub(center.multiplyScalar(scale));
          
          scene.add(model);
          setLoading(false);
          sceneInitialized.current = true;
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
        },
        (err) => {
          console.error('Error loading 3D model:', err);
          setError('3D model yüklenemedi');
          setLoading(false);
          onError?.(err.message || 'Model yükleme hatası');
        }
      );

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current) return;
        
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (containerRef.current && renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        controls.dispose();
      };
    }).catch((err) => {
      console.error('Failed to load Three.js:', err);
      setError('3D viewer yüklenemedi');
      setLoading(false);
      onError?.('Three.js yükleme hatası');
    });
  }, [modelUrl, status, onError]);

  if (status === 'pending') {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-700 font-medium">3D model oluşturuluyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-700 font-medium">3D model oluşturulamadı</p>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  if (!modelUrl) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 font-medium">3D model URL'i bulunamadı</p>
          <p className="text-gray-500 text-sm mt-2">Model henüz oluşturulmamış olabilir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">3D Yüz Modeli</h3>
        {confidence && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              confidence === 'yüksek'
                ? 'bg-emerald-100 text-emerald-700'
                : confidence === 'orta'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            Güven: {confidence}
          </span>
        )}
      </div>
      
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 overflow-hidden"
        />
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Model yükleniyor...</p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center">
        💡 Fare ile döndürebilir, kaydırarak yakınlaştırabilirsiniz
      </div>
    </div>
  );
}

