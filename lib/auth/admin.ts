/**
 * Admin authentication utilities
 * Only specified admin emails can manage medical sources
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean);

/**
 * Check if a user is an admin based on their email
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if current user is admin (for server-side)
 */
export async function checkAdminAccess(userEmail: string | null | undefined): Promise<boolean> {
  return isAdmin(userEmail);
}

/**
 * Throw error if user is not admin
 */
export function requireAdmin(userEmail: string | null | undefined): void {
  if (!isAdmin(userEmail)) {
    throw new Error('Bu işlem için yönetici yetkisi gereklidir. Kaynak ekleme/düzenleme işlemleri sadece yöneticiler tarafından yapılabilir.');
  }
}

