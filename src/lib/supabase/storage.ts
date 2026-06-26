import { createClient } from './client';

/**
 * Upload a file to Supabase Storage (Cloudflare R2 compatible)
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<{ path: string | null; error: Error | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      return { path: null, error };
    }

    return { path: data?.path || null, error: null };
  } catch (err) {
    return { path: null, error: err as Error };
  }
}

/**
 * Get a public signed URL for a file
 */
export async function getPublicUrl(
  bucket: string,
  path: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const supabase = await createClient();

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

    return { url: data?.publicUrl || null, error: null };
  } catch (err) {
    return { url: null, error: err as Error };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}
