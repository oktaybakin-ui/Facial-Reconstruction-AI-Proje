'use client';

import React from 'react';
import type { ValidationResult } from '@/types/validation';

interface ValidationIssuesListProps {
  validation: ValidationResult;
  showSuggestions?: boolean;
}

export default function ValidationIssuesList({ 
  validation, 
  showSuggestions = true 
}: ValidationIssuesListProps) {
  const { detectedIssues } = validation;
  
  if (detectedIssues.length === 0) {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex items-center gap-2 text-emerald-800">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Tespit edilen sorun yok</span>
        </div>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'yüksek':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'orta':
        return (
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'yüksek':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'orta':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'simetri': return 'Simetri';
      case 'oran': return 'Oran';
      case 'pozisyon': return 'Pozisyon';
      default: return 'Genel';
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">
        Tespit Edilen Sorunlar ({detectedIssues.length})
      </h4>
      {detectedIssues.map((issue, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
        >
          <div className="flex items-start gap-2">
            {getSeverityIcon(issue.severity)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium uppercase">{getCategoryLabel(issue.category)}</span>
                <span className="text-xs opacity-75">•</span>
                <span className="text-xs font-medium">{issue.severity.toUpperCase()}</span>
              </div>
              <p className="text-sm">{issue.message}</p>
              {showSuggestions && issue.suggestion && (
                <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                  <p className="text-xs opacity-90">
                    <strong>Öneri:</strong> {issue.suggestion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

