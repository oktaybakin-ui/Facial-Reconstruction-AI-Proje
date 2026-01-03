'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Face3DViewerContent from './Face3DViewerContent';

interface Face3DViewerProps {
  modelUrl: string | null;
  status: 'pending' | 'completed' | 'failed';
  confidence: 'düşük' | 'orta' | 'yüksek' | null;
  onError?: (error: string) => void;
}

export default function Face3DViewer(props: Face3DViewerProps) {
  return <Face3DViewerContent {...props} />;
}

