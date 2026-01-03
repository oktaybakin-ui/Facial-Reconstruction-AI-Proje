'use client';

import React from 'react';
import type { ValidationResult } from '@/types/validation';

interface ValidationScoreBadgeProps {
  validation: ValidationResult;
  compact?: boolean;
}

export default function ValidationScoreBadge({ validation, compact = false }: ValidationScoreBadgeProps) {
  const { anatomicalConsistency, aiConfidence } = validation;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-100 border-emerald-300';
    if (score >= 60) return 'text-amber-700 bg-amber-100 border-amber-300';
    return 'text-red-700 bg-red-100 border-red-300';
  };
  
  const getConfidenceLevelColor = (level: string) => {
    switch (level) {
      case 'yüksek': return 'text-emerald-700 bg-emerald-50';
      case 'orta': return 'text-amber-700 bg-amber-50';
      case 'düşük': return 'text-red-700 bg-red-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className={`px-2 py-1 rounded-full border ${getScoreColor(anatomicalConsistency.score)}`}>
          Anatomik: {anatomicalConsistency.score}/100
        </div>
        <div className={`px-2 py-1 rounded-full ${getConfidenceLevelColor(aiConfidence.level)}`}>
          Güven: {aiConfidence.level}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">Doğruluk Skorları</h4>
        <span className="text-xs text-gray-500">
          {new Date(validation.validatedAt).toLocaleDateString('tr-TR')}
        </span>
      </div>
      
      {/* Anatomical Consistency Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Anatomik Tutarlılık</span>
          <div className={`px-3 py-1 rounded-lg border font-semibold ${getScoreColor(anatomicalConsistency.score)}`}>
            {anatomicalConsistency.score}/100
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              anatomicalConsistency.score >= 80 ? 'bg-emerald-500' :
              anatomicalConsistency.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${anatomicalConsistency.score}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div>Simetri: {Math.round(anatomicalConsistency.breakdown.symmetry)}</div>
          <div>Oran: {Math.round(anatomicalConsistency.breakdown.proportions)}</div>
          <div>Pozisyon: {Math.round(anatomicalConsistency.breakdown.flapPosition)}</div>
        </div>
      </div>
      
      {/* AI Confidence Score */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">AI Güven Skoru</span>
          <div className={`px-3 py-1 rounded-lg font-semibold ${getConfidenceLevelColor(aiConfidence.level)}`}>
            {aiConfidence.level.toUpperCase()}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              aiConfidence.score >= 80 ? 'bg-emerald-500' :
              aiConfidence.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${aiConfidence.score}%` }}
          />
        </div>
        <div className="text-xs text-gray-600">
          Skor: {aiConfidence.score}/100
        </div>
      </div>
    </div>
  );
}

