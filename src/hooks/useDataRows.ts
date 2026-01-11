import { useState, useCallback, useMemo } from 'react';
import { DataRow, Field } from '../types';

const DATA_ROWS_KEY = 'templify_data_rows';

interface StoredDataRows {
  [templateId: string]: DataRow[];
}

const loadStoredDataRows = (): StoredDataRows => {
  try {
    const data = localStorage.getItem(DATA_ROWS_KEY);
    if (!data) {
      return {};
    }
    return JSON.parse(data) as StoredDataRows;
  } catch {
    return {};
  }
};

const saveStoredDataRows = (dataRows: StoredDataRows): void => {
  localStorage.setItem(DATA_ROWS_KEY, JSON.stringify(dataRows));
};

export const useDataRows = (templateId: string, fields: Field[]) => {
  const initialRows = useMemo(() => {
    const stored = loadStoredDataRows();
    return stored[templateId] || [];
  }, [templateId]);

  const [rows, setRows] = useState<DataRow[]>(initialRows);

  const saveRows = useCallback(
    (newRows: DataRow[]) => {
      const stored = loadStoredDataRows();
      stored[templateId] = newRows;
      saveStoredDataRows(stored);
      setRows(newRows);
    },
    [templateId]
  );

  const addRow = useCallback(() => {
    const newRow: DataRow = {
      id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      const newRows: DataRow[] = data.map((item) => {
        const values: Record<string, string> = {};
        fields.forEach((field) => {
          const matchingKey = Object.keys(item).find(
            (key) => key.toLowerCase().trim() === field.name.toLowerCase().trim()
          );
          values[field.id] = matchingKey ? item[matchingKey] : '';
        });

        return {
          id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          templateId,
          values,
        };
      });

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
