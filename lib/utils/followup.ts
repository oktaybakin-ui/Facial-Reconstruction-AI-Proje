/**
 * Utility functions for followup date calculations and reminders
 */

/**
 * Calculate followup date based on operation date and followup days
 */
export function calculateFollowupDate(operationDate: string | null | undefined, followupDays: number | null | undefined): string | null {
  if (!operationDate || !followupDays) return null;
  
  try {
    const opDate = new Date(operationDate);
    const followupDate = new Date(opDate);
    followupDate.setDate(followupDate.getDate() + followupDays);
    
    return followupDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (error) {
    return null;
  }
}

/**
 * Check if followup is due (today or past)
 */
export function isFollowupDue(operationDate: string | null | undefined, followupDays: number | null | undefined): boolean {
  const followupDate = calculateFollowupDate(operationDate, followupDays);
  if (!followupDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const followup = new Date(followupDate);
  followup.setHours(0, 0, 0, 0);
  
  return followup <= today;
}

/**
 * Get days until/after followup
 */
export function getFollowupDaysRemaining(operationDate: string | null | undefined, followupDays: number | null | undefined): number | null {
  const followupDate = calculateFollowupDate(operationDate, followupDays);
  if (!followupDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const followup = new Date(followupDate);
  followup.setHours(0, 0, 0, 0);
  
  const diffTime = followup.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if pathology result should be checked (21 days after operation)
 */
export function shouldCheckPathology(operationDate: string | null | undefined): boolean {
  if (!operationDate) return false;
  
  try {
    const opDate = new Date(operationDate);
    const pathologyCheckDate = new Date(opDate);
    pathologyCheckDate.setDate(pathologyCheckDate.getDate() + 21);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    pathologyCheckDate.setHours(0, 0, 0, 0);
    
    return pathologyCheckDate <= today;
  } catch (error) {
    return false;
  }
}

/**
 * Get days since operation (for pathology check)
 */
export function getDaysSinceOperation(operationDate: string | null | undefined): number | null {
  if (!operationDate) return null;
  
  try {
    const opDate = new Date(operationDate);
    opDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - opDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? diffDays : null;
  } catch (error) {
    return null;
  }
}

