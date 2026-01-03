/**
 * Storage utilities for uploading 3D models to Supabase Storage
 */

import { createServerClient } from '@/lib/supabaseClient';

/**
 * Uploads a GLB file to Supabase Storage
 * @param glbBuffer Buffer containing the GLB file
 * @param caseId Case ID for organizing files
 * @returns Public URL of the uploaded file
 */
export async function uploadGLBToStorage(
  glbBuffer: Buffer,
  caseId: string
): Promise<string> {
  const supabase = createServerClient();
  
  // Generate unique filename
  const timestamp = Date.now();
  const fileName = `face-3d-${caseId}-${timestamp}.glb`;
  const filePath = `face-3d-models/${caseId}/${fileName}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('face-3d-models') // Make sure this bucket exists in Supabase
    .upload(filePath, glbBuffer, {
      cacheControl: '3600',
      contentType: 'model/gltf-binary',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload GLB to storage: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('face-3d-models')
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded GLB file');
  }

  return urlData.publicUrl;
}
