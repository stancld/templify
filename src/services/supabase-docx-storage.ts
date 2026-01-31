import { getSupabaseClient } from '../lib/supabase';

const BUCKET_NAME = 'templates-docx';

/**
 * Upload a docx file to Supabase Storage
 * @param userId User ID for folder organization
 * @param templateId Template ID for file naming
 * @param docxBlob The docx file as a Blob
 * @returns The storage path
 */
export async function uploadDocx(
  userId: string,
  templateId: string,
  docxBlob: Blob
): Promise<string> {
  const supabase = getSupabaseClient();
  const path = `${userId}/${templateId}.docx`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, docxBlob, {
      upsert: true,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

  if (error) {
    throw error;
  }

  return path;
}

/**
 * Download a docx file from Supabase Storage
 * @param path The storage path
 * @returns The docx file as a Blob, or null if not found
 */
export async function downloadDocx(path: string): Promise<Blob | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(path);

  if (error) {
    // File not found
    if (error.message?.includes('not found') || error.message?.includes('Object not found')) {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Delete a docx file from Supabase Storage
 * @param path The storage path
 */
export async function deleteDocx(path: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw error;
  }
}

/**
 * Delete all docx files for a user
 * @param userId User ID
 */
export async function deleteUserDocxFiles(userId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list(userId);

  if (files && files.length > 0) {
    const paths = files.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from(BUCKET_NAME).remove(paths);
  }
}
