import { useState, useCallback, useEffect } from 'react';
import { DataRow, DataSession, Field } from '../types';
import { generateId } from '../utils/id';
import { loadAllDataRows, saveDataRows as saveDataRowsLocal, matchFieldValue } from '../services/data-rows';
import {
  getDataRowsForSessionFromSupabase,
  saveDataRowsToSupabase,
} from '../services/supabase-data-rows';
import { useAuth } from './useAuth';

export const useDataRows = (session: DataSession | null, fields: Field[]) => {
  const { user, isSupabaseEnabled, isAuthenticated } = useAuth();
  const [rows, setRows] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);

  const useSupabase = isSupabaseEnabled && isAuthenticated && user;
  const sessionId = session?.id || '';
  const templateId = session?.templateId || '';

  useEffect(() => {
    if (!sessionId) {
      setRows([]);
      setLoading(false);
      return;
    }

    const loadRows = async () => {
      setLoading(true);
      try {
        if (useSupabase) {
          const supabaseRows = await getDataRowsForSessionFromSupabase(sessionId);
          setRows(supabaseRows);
        } else {
          const stored = loadAllDataRows();
          setRows(stored[sessionId] || []);
        }
      } catch (error) {
        console.error('Error loading rows:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadRows();
  }, [sessionId, useSupabase]);

  const saveRows = useCallback(
    async (newRows: DataRow[]) => {
      if (!sessionId) {
        return;
      }
      setRows(newRows);

      try {
        if (useSupabase && user) {
          await saveDataRowsToSupabase(sessionId, templateId, user.id, newRows);
        } else {
          const stored = loadAllDataRows();
          stored[sessionId] = newRows;
          saveDataRowsLocal(stored);
        }
      } catch (error) {
        console.error('Error saving rows:', error);
      }
    },
    [sessionId, templateId, useSupabase, user]
  );

  const addRow = useCallback(() => {
    const newRow: DataRow = {
      id: generateId(),
      templateId,
      sessionId,
      values: fields.reduce(
        (acc, field) => {
          acc[field.id] = '';
          return acc;
        },
        {} as Record<string, string>
      ),
    };
    void saveRows([...rows, newRow]);
    return newRow;
  }, [rows, templateId, sessionId, fields, saveRows]);

  const updateRow = useCallback(
    (rowId: string, fieldId: string, value: string) => {
      const updatedRows = rows.map((row) =>
        row.id === rowId ? { ...row, values: { ...row.values, [fieldId]: value } } : row
      );
      void saveRows(updatedRows);
    },
    [rows, saveRows]
  );

  const deleteRow = useCallback(
    (rowId: string) => {
      const filtered = rows.filter((row) => row.id !== rowId);
      void saveRows(filtered);
    },
    [rows, saveRows]
  );

  const deleteAllRows = useCallback(() => {
    void saveRows([]);
  }, [saveRows]);

  const importRows = useCallback(
    (data: Record<string, string>[]) => {
      const newRows: DataRow[] = data.map((item) => ({
        id: generateId(),
        templateId,
        sessionId,
        values: Object.fromEntries(
          fields.map((field) => [field.id, matchFieldValue(item, field.name)])
        ),
      }));

      void saveRows([...rows, ...newRows]);
      return newRows.length;
    },
    [rows, templateId, sessionId, fields, saveRows]
  );

  return {
    rows,
    loading,
    addRow,
    updateRow,
    deleteRow,
    deleteAllRows,
    importRows,
  };
};
