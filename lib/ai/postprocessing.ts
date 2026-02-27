import type { FlapSuggestion, VisionSummary } from '@/types/ai';
import type { ValidationResult } from '@/types/validation';

/**
 * Post-Processing Service
 * Provides automatic correction suggestions for flap drawings
 */

export interface CorrectionSuggestion {
  type: 'position' | 'size' | 'angle' | 'coverage';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestedChange: {
    action: string;
    details: Record<string, unknown>;
  };
  confidence: number; // 0-100
}

/**
 * Analyze validation results and generate correction suggestions
 */
export function generateCorrectionSuggestions(
  validation: ValidationResult,
  flapSuggestion: FlapSuggestion,
  visionSummary: VisionSummary
): CorrectionSuggestion[] {
  const suggestions: CorrectionSuggestion[] = [];

  // Check symmetry issues
  if (validation.anatomicalConsistency.symmetry.overallSymmetry < 70) {
    suggestions.push({
      type: 'position',
      severity: 'medium',
      description: 'Yüz simetrisi bozulmuş. Flap pozisyonu yüzün orta hattına göre ayarlanmalı.',
      suggestedChange: {
        action: 'adjust_position',
        details: {
          horizontalTilt: validation.anatomicalConsistency.symmetry.horizontalTilt,
          recommendedAdjustment: -validation.anatomicalConsistency.symmetry.horizontalTilt * 0.5,
        },
      },
      confidence: 75,
    });
  }

  // Check proportion issues
  if (validation.anatomicalConsistency.proportions.overallProportion < 70) {
    suggestions.push({
      type: 'size',
      severity: 'low',
      description: 'Yüz oranları idealden sapmış. Flap boyutu gözden geçirilmeli.',
      suggestedChange: {
        action: 'review_size',
        details: {
          faceDivision: validation.anatomicalConsistency.proportions.faceDivision,
        },
      },
      confidence: 60,
    });
  }

  // Check flap position issues
  if (validation.anatomicalConsistency.flapPosition.defectCoverage < 80) {
    suggestions.push({
      type: 'coverage',
      severity: 'high',
      description: 'Flap defekt alanını yeterince kapsamıyor. Flap boyutu veya pozisyonu ayarlanmalı.',
      suggestedChange: {
        action: 'increase_coverage',
        details: {
          currentCoverage: validation.anatomicalConsistency.flapPosition.defectCoverage,
          targetCoverage: 95,
          recommendedSizeIncrease: 1.2, // 20% larger
        },
      },
      confidence: 85,
    });
  }

  if (!validation.anatomicalConsistency.flapPosition.donorPosition.correct) {
    suggestions.push({
      type: 'position',
      severity: 'high',
      description: 'Donör alan pozisyonu hatalı. Anatomik olarak uygun bir donör bölge seçilmeli.',
      suggestedChange: {
        action: 'relocate_donor',
        details: {
          currentIssues: validation.anatomicalConsistency.flapPosition.donorPosition.issues,
        },
      },
      confidence: 90,
    });
  }

  if (validation.anatomicalConsistency.flapPosition.criticalStructureOverlap.hasOverlap) {
    suggestions.push({
      type: 'position',
      severity: 'high',
      description: 'Flap kritik yapılarla çakışıyor. Pozisyon değiştirilmeli.',
      suggestedChange: {
        action: 'avoid_structures',
        details: {
          overlappedStructures: validation.anatomicalConsistency.flapPosition.criticalStructureOverlap.overlappedStructures,
        },
      },
      confidence: 95,
    });
  }

  return suggestions;
}

/**
 * Apply automatic corrections to flap drawing
 * Returns a corrected version of the flap drawing
 */
export function applyCorrections(
  flapSuggestion: FlapSuggestion,
  suggestions: CorrectionSuggestion[]
): FlapSuggestion {
  // Filter high-confidence, high-severity suggestions
  const applicableSuggestions = suggestions.filter(
    s => s.severity === 'high' && s.confidence >= 80
  );

  if (applicableSuggestions.length === 0) {
    return flapSuggestion; // No corrections needed
  }

  // Create a copy of the flap suggestion
  const corrected: FlapSuggestion = JSON.parse(JSON.stringify(flapSuggestion));

  // Apply corrections
  for (const suggestion of applicableSuggestions) {
    if (suggestion.type === 'coverage' && corrected.flap_drawing) {
      // Increase flap size
      const sizeMultiplier = (suggestion.suggestedChange.details.recommendedSizeIncrease as number) || 1.2;
      
      if (corrected.flap_drawing.flap_areas) {
        corrected.flap_drawing.flap_areas = corrected.flap_drawing.flap_areas.map(area => ({
          ...area,
          points: area.points.map(point => ({
            x: (point.x - 500) * sizeMultiplier + 500, // Scale around center
            y: (point.y - 500) * sizeMultiplier + 500,
          })),
        }));
      }
    }

    if (suggestion.type === 'position' && corrected.flap_drawing) {
      // Adjust position
      const adjustment = (suggestion.suggestedChange.details.recommendedAdjustment as number) || 0;
      
      if (corrected.flap_drawing.flap_areas) {
        corrected.flap_drawing.flap_areas = corrected.flap_drawing.flap_areas.map(area => ({
          ...area,
          points: area.points.map(point => ({
            x: point.x + adjustment,
            y: point.y,
          })),
        }));
      }
    }
  }

  return corrected;
}

