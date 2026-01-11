import { useState, useCallback, useMemo } from 'react';
import { DataRow, Field } from '../types';
import { generateId } from '../utils/id';
import { loadAllDataRows, saveDataRows, matchFieldValue } from '../services/data-rows';

export const useDataRows = (templateId: string, fields: Field[]) => {
  const initialRows = useMemo(() => {
    const stored = loadAllDataRows();
    return stored[templateId] || [];
  }, [templateId]);

  const [rows, setRows] = useState<DataRow[]>(initialRows);

  const saveRows = useCallback(
    (newRows: DataRow[]) => {
      const stored = loadAllDataRows();
      stored[templateId] = newRows;
      saveDataRows(stored);
      setRows(newRows);
    },
    [templateId]
  );

  const addRow = useCallback(() => {
    const newRow: DataRow = {
      id: generateId('row'),
      templateId,
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
  }, [rows, templateId, fields, saveRows]);

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
        values: Object.fromEntries(
          fields.map((field) => [field.id, matchFieldValue(item, field.name)])
        ),
      }));

      saveRows([...rows, ...newRows]);
      return newRows.length;
    },
    [rows, templateId, fields, saveRows]
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
