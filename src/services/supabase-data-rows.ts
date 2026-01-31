import { DataRow } from '../types';
import { getSupabaseClient } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type DataRowDb = Database['public']['Tables']['data_rows']['Row'];

export async function getDataRowsForSessionFromSupabase(
  sessionId: string
): Promise<DataRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('data_rows')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching data rows:', error);
    throw error;
  }

  return ((data as unknown as DataRowDb[]) || []).map((row) => ({
    id: row.id,
    templateId: row.template_id,
    sessionId: row.session_id,
    values: row.values,
  }));
}

export async function saveDataRowsToSupabase(
  sessionId: string,
  templateId: string,
  userId: string,
  rows: DataRow[]
): Promise<void> {
  const supabase = getSupabaseClient();

  // Delete existing rows for this session
  const { error: deleteError } = await supabase
    .from('data_rows')
    .delete()
    .eq('session_id', sessionId);

  if (deleteError) {
    console.error('Error deleting old rows:', deleteError);
    throw deleteError;
  }

  if (rows.length === 0) {
    return;
  }

  // Insert new rows
  const rowsToInsert = rows.map((row) => ({
    id: row.id,
    session_id: sessionId,
    template_id: templateId,
    user_id: userId,
    values: row.values,
    created_at: new Date().toISOString(),
  }));

  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const { error: insertError } = await (supabase.from('data_rows') as any).insert(rowsToInsert);
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

  if (insertError) {
    console.error('Error inserting rows:', insertError);
    throw insertError;
  }
}
