import { Template } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { blobToBase64, base64ToBlob } from './storage';
import type { Database } from '../lib/database.types';

type TemplateRow = Database['public']['Tables']['templates']['Row'];

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

  return ((data as unknown as TemplateRow[]) || []).map((row) => ({
    id: row.id,
    name: row.name,
    originalDocx: base64ToBlob(
      row.original_docx,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ),
    htmlContent: row.html_content,
    schema: row.schema,
    createdAt: new Date(row.created_at),
  }));
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
  return {
    id: row.id,
    name: row.name,
    originalDocx: base64ToBlob(
      row.original_docx,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ),
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
  const base64 = await blobToBase64(template.originalDocx);

  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const { error } = await (supabase.from('templates') as any).upsert({
    id: template.id,
    user_id: userId,
    name: template.name,
    original_docx: base64,
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

export async function deleteTemplateFromSupabase(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('templates').delete().eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}
