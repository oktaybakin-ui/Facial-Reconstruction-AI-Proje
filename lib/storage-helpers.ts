/**
 * Storage helper utilities for Supabase bucket path operations.
 * Pure functions - no server-side imports (safe for client components).
 */

/**
 * Extracts the storage path from a Supabase public URL.
 * If already a path (not a URL), returns as-is.
 *
 * Public URL format:
 *   https://xxx.supabase.co/storage/v1/object/public/{bucket}/{path}
 *
 * @example
 *   extractStoragePath('https://xxx.supabase.co/storage/v1/object/public/case-photos/uid/file.jpg', 'case-photos')
 *   // => 'uid/file.jpg'
 *
 *   extractStoragePath('uid/file.jpg', 'case-photos')
 *   // => 'uid/file.jpg'
 */
export function extractStoragePath(urlOrPath: string, bucket: string): string {
  if (!urlOrPath) return urlOrPath;

  // Already a relative path
  if (!urlOrPath.startsWith('http')) return urlOrPath;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = urlOrPath.indexOf(marker);
  if (idx !== -1) {
    return decodeURIComponent(urlOrPath.substring(idx + marker.length));
  }

  // Try signed URL format: /storage/v1/object/sign/{bucket}/{path}?token=...
  const signMarker = `/storage/v1/object/sign/${bucket}/`;
  const signIdx = urlOrPath.indexOf(signMarker);
  if (signIdx !== -1) {
    const pathWithQuery = urlOrPath.substring(signIdx + signMarker.length);
    return decodeURIComponent(pathWithQuery.split('?')[0]);
  }

  return urlOrPath;
}

/**
 * Returns true if the value is a full Supabase public URL (not a storage path).
 */
export function isPublicStorageUrl(value: string): boolean {
  return !!value && value.startsWith('http') && value.includes('/storage/v1/object/public/');
}
