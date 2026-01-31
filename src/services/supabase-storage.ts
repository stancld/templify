import { Template } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { base64ToBlob } from './storage';
import { uploadDocx, downloadDocx, deleteDocx } from './supabase-docx-storage';
import type { Database } from '../lib/database.types';

type TemplateRow = Database['public']['Tables']['templates']['Row'];

/**
 * Load the docx blob for a template row
 * - New templates: download from Storage bucket (docx_path)
 * - Legacy templates: decode from base64 (original_docx)
 */
async function loadDocxBlob(row: TemplateRow): Promise<Blob> {
  // New templates use Storage bucket
  if (row.docx_path) {
    const blob = await downloadDocx(row.docx_path);
    if (blob) {
      return blob;
    }
    // Fallback to base64 if Storage download fails
  }

  // Legacy templates use base64
  if (row.original_docx) {
    return base64ToBlob(
      row.original_docx,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  }

  throw new Error('No docx data available for template');
}

export async function getTemplatesForUser(userId: string): Promise<Template[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }

  const rows = (data as unknown as TemplateRow[]) || [];

  // Load all templates with their docx blobs
  const templates = await Promise.all(
    rows.map(async (row) => {
      try {
        const originalDocx = await loadDocxBlob(row);
        return {
          id: row.id,
          name: row.name,
          originalDocx,
          htmlContent: row.html_content,
          schema: row.schema,
          createdAt: new Date(row.created_at),
        };
      } catch (err) {
        console.error(`Failed to load docx for template ${row.id}:`, err);
        // Return template with empty blob to avoid breaking the list
        return {
          id: row.id,
          name: row.name,
          originalDocx: new Blob(),
          htmlContent: row.html_content,
          schema: row.schema,
          createdAt: new Date(row.created_at),
        };
      }
    })
  );

  return templates;
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching template:', error);
    throw error;
  }

  const row = data as unknown as TemplateRow;
  const originalDocx = await loadDocxBlob(row);

  return {
    id: row.id,
    name: row.name,
    originalDocx,
    htmlContent: row.html_content,
    schema: row.schema,
    createdAt: new Date(row.created_at),
  };
}

export async function saveTemplateToSupabase(
  template: Template,
  userId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  // Upload docx to Storage bucket
  const docxPath = await uploadDocx(userId, template.id, template.originalDocx);

  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const { error } = await (supabase.from('templates') as any).upsert({
    id: template.id,
    user_id: userId,
    name: template.name,
    docx_path: docxPath,
    original_docx: '', // Empty for new templates - use Storage instead
    html_content: template.htmlContent,
    schema: template.schema,
    created_at: template.createdAt.toISOString(),
    updated_at: new Date().toISOString(),
  });
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

  if (error) {
    console.error('Error saving template:', error);
    throw error;
  }
}

export async function deleteTemplateFromSupabase(
  id: string,
  userId?: string
): Promise<void> {
  const supabase = getSupabaseClient();

  // First get the template to find its docx_path
  const { data } = await supabase
    .from('templates')
    .select('docx_path')
    .eq('id', id)
    .single();

  // Delete from Storage if path exists
  const row = data as unknown as { docx_path: string | null } | null;
  if (row?.docx_path) {
    try {
      await deleteDocx(row.docx_path);
    } catch (err) {
      console.error('Error deleting docx from storage:', err);
      // Continue with database deletion even if storage deletion fails
    }
  } else if (userId) {
    // Try to delete using the standard path format
    try {
      await deleteDocx(`${userId}/${id}.docx`);
    } catch {
      // Ignore - file may not exist
    }
  }

  // Delete from database
  const { error } = await supabase.from('templates').delete().eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}
