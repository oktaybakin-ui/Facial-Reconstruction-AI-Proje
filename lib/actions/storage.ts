'use server';

/**
 * Server actions for secure storage URL resolution.
 * Uses service role key — bypasses RLS, safe for all authenticated calls.
 */

import { createServerClient } from '@/lib/supabaseClient';
import { extractStoragePath } from '@/lib/storage-helpers';

const DEFAULT_TTL = 3600; // 1 hour

/**
 * Batch-resolve an array of photo URLs/paths to signed URLs.
 * Works with both legacy public URLs and new storage paths.
 *
 * @returns Record mapping original value → signed URL
 */
export async function getSignedPhotoUrls(
  urlsOrPaths: string[],
  bucket: string = 'case-photos',
  ttl: number = DEFAULT_TTL
): Promise<Record<string, string>> {
  if (!urlsOrPaths || urlsOrPaths.length === 0) return {};

  const supabase = createServerClient();
  const result: Record<string, string> = {};

  await Promise.all(
    urlsOrPaths.map(async (urlOrPath) => {
      if (!urlOrPath) return;
      try {
        const path = extractStoragePath(urlOrPath, bucket);
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, ttl);

        if (data?.signedUrl && !error) {
          result[urlOrPath] = data.signedUrl;
        } else {
          // Fallback: return original (works if bucket is still public)
          result[urlOrPath] = urlOrPath;
        }
      } catch {
        result[urlOrPath] = urlOrPath;
      }
    })
  );

  return result;
}

/**
 * Resolve a single storage URL/path to a signed URL.
 * Can be called from server-side code (orchestrator, API routes)
 * or from client components via server action RPC.
 */
export async function resolveStorageUrl(
  urlOrPath: string,
  bucket: string = 'case-photos',
  ttl: number = DEFAULT_TTL
): Promise<string> {
  if (!urlOrPath) return urlOrPath;

  const supabase = createServerClient();
  const path = extractStoragePath(urlOrPath, bucket);

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, ttl);

    if (data?.signedUrl && !error) {
      return data.signedUrl;
    }
  } catch {
    // Fallback
  }

  return urlOrPath;
}
