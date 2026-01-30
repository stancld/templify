import { useState, useCallback, useMemo } from 'react';
import { DataRow, DataSession, Field } from '../types';
import { generateId } from '../utils/id';
import { loadAllDataRows, saveDataRows, matchFieldValue } from '../services/data-rows';

export const useDataRows = (session: DataSession, fields: Field[]) => {
  const { id: sessionId, templateId } = session;

  const initialRows = useMemo(() => {
    const stored = loadAllDataRows();
    return stored[sessionId] || [];
  }, [sessionId]);

  const [rows, setRows] = useState<DataRow[]>(initialRows);

  const saveRows = useCallback(
    (newRows: DataRow[]) => {
      if (!sessionId) {
        return;
      }
      const stored = loadAllDataRows();
      stored[sessionId] = newRows;
      saveDataRows(stored);
      setRows(newRows);
    },
    [sessionId]
  );

  const addRow = useCallback(() => {
    const newRow: DataRow = {
      id: generateId('row'),
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
    saveRows([...rows, newRow]);
    return newRow;
  }, [rows, templateId, sessionId, fields, saveRows]);

  const updateRow = useCallback(
    (rowId: string, fieldId: string, value: string) => {
      const updatedRows = rows.map((row) =>
        row.id === rowId ? { ...row, values: { ...row.values, [fieldId]: value } } : row
      );
      saveRows(updatedRows);
    },
    [rows, saveRows]
  );

  const deleteRow = useCallback(
    (rowId: string) => {
      const filtered = rows.filter((row) => row.id !== rowId);
      saveRows(filtered);
    },
    [rows, saveRows]
  );

  const deleteAllRows = useCallback(() => {
    saveRows([]);
  }, [saveRows]);

  const importRows = useCallback(
    (data: Record<string, string>[]) => {
      const newRows: DataRow[] = data.map((item) => ({
        id: generateId('row'),
        templateId,
        sessionId,
        values: Object.fromEntries(
          fields.map((field) => [field.id, matchFieldValue(item, field.name)])
        ),
      }));

      saveRows([...rows, ...newRows]);
      return newRows.length;
    },
    [rows, templateId, sessionId, fields, saveRows]
  );

  return {
    rows,
    addRow,
    updateRow,
    deleteRow,
    deleteAllRows,
    importRows,
  };
};
