import { DataSession } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import { generateId } from '../utils/id';
import type { Database } from '../lib/database.types';

type SessionRow = Database['public']['Tables']['data_sessions']['Row'];

export async function getSessionForTemplateFromSupabase(
  templateId: string,
  userId: string
): Promise<DataSession | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('data_sessions')
    .select('*')
    .eq('template_id', templateId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching session:', error);
    throw error;
  }

  const row = data as unknown as SessionRow;
  return {
    id: row.id,
    templateId: row.template_id,
    name: row.title,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function createSessionInSupabase(
  templateId: string,
  templateName: string,
  userId: string
): Promise<DataSession> {
  const supabase = getSupabaseClient();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const sessionId = generateId();
  const title = `${templateName} - ${dateStr}`;

  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const { error } = await (supabase.from('data_sessions') as any).insert({
    id: sessionId,
    template_id: templateId,
    user_id: userId,
    title,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  return {
    id: sessionId,
    templateId,
    name: title,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getOrCreateSessionInSupabase(
  templateId: string,
  templateName: string,
  userId: string
): Promise<DataSession> {
  const existing = await getSessionForTemplateFromSupabase(templateId, userId);
  if (existing) {
    return existing;
  }
  return createSessionInSupabase(templateId, templateName, userId);
}

export async function updateSessionNameInSupabase(
  sessionId: string,
  name: string
): Promise<DataSession | null> {
  const supabase = getSupabaseClient();

  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const { data, error } = await (supabase.from('data_sessions') as any)
    .update({ title: name, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

  if (error) {
    console.error('Error updating session:', error);
    throw error;
  }

  const row = data as SessionRow;
  return {
    id: row.id,
    templateId: row.template_id,
    name: row.title,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
