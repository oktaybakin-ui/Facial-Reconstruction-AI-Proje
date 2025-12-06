/**
 * Admin authentication utilities
 * Only specified admin emails can manage medical sources
 */

// Server-side: use ADMIN_EMAILS
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean);

// Client-side: use NEXT_PUBLIC_ADMIN_EMAILS (fallback to ADMIN_EMAILS for build-time)
// Note: NEXT_PUBLIC_* variables are embedded at build time, so they must be set in Vercel
const PUBLIC_ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS || 
  process.env.ADMIN_EMAILS || 
  ''
).split(',').map(email => email.trim().toLowerCase()).filter(Boolean);

/**
 * Check if a user is an admin based on their email
 * Works both on server and client side
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailLower = email.toLowerCase();
  
  // Use public admin emails for client-side, regular for server-side
  if (typeof window !== 'undefined') {
    return PUBLIC_ADMIN_EMAILS.includes(emailLower);
  }
  return ADMIN_EMAILS.includes(emailLower);
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

