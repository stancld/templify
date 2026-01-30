import { DataRow } from '../types';
import { STORAGE_KEYS } from '../config/constants';

interface StoredDataRows {
  [sessionId: string]: DataRow[];
}

export const loadAllDataRows = (): StoredDataRows => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DATA_ROWS);
    if (!data) {
      return {};
    }
    return JSON.parse(data) as StoredDataRows;
  } catch {
    return {};
  }
};

export const getDataRowsForSession = (sessionId: string): DataRow[] => {
  const stored = loadAllDataRows();
  return stored[sessionId] || [];
};

export const saveDataRows = (dataRows: StoredDataRows): void => {
  localStorage.setItem(STORAGE_KEYS.DATA_ROWS, JSON.stringify(dataRows));
};

export const matchFieldValue = (
  item: Record<string, string>,
  fieldName: string
): string => {
  const normalizedName = fieldName.toLowerCase().trim();
  const key = Object.keys(item).find(
    (k) => k.toLowerCase().trim() === normalizedName
  );
  return key ? item[key] : '';
};
