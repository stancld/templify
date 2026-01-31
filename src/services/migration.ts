import { STORAGE_KEYS } from '../config/constants';
import { DataRow, DataSession } from '../types';
import { generateId } from '../utils/id';
import { loadAllTemplates } from './storage';

const CURRENT_MIGRATION_VERSION = 1;

interface OldStoredDataRows {
  [templateId: string]: Omit<DataRow, 'sessionId'>[];
}

interface NewStoredDataRows {
  [sessionId: string]: DataRow[];
}

interface StoredSessions {
  [templateId: string]: DataSession;
}

interface SerializableTemplate {
  id: string;
  name: string;
}

const getMigrationVersion = (): number => {
  try {
    const version = localStorage.getItem(STORAGE_KEYS.MIGRATION_VERSION);
    return version ? parseInt(version, 10) : 0;
  } catch {
    return 0;
  }
};

const setMigrationVersion = (version: number): void => {
  localStorage.setItem(STORAGE_KEYS.MIGRATION_VERSION, version.toString());
};

const migrateDataRowsToSessions = (): void => {
  const oldDataRowsRaw = localStorage.getItem(STORAGE_KEYS.DATA_ROWS);
  if (!oldDataRowsRaw) {
    return;
  }

  let oldDataRows: OldStoredDataRows;
  try {
    oldDataRows = JSON.parse(oldDataRowsRaw) as OldStoredDataRows;
  } catch {
    return;
  }

  const templates = loadAllTemplates() as SerializableTemplate[];
  const templateMap = new Map(templates.map((t) => [t.id, t]));

  const newSessions: StoredSessions = {};
  const newDataRows: NewStoredDataRows = {};
  const now = new Date();

  for (const [templateId, rows] of Object.entries(oldDataRows)) {
    if (rows.length === 0) {
      continue;
    }

    const firstRow = rows[0];
    const hasSessionId = 'sessionId' in firstRow && typeof firstRow.sessionId === 'string';
    if (hasSessionId) {
      continue;
    }

    const template = templateMap.get(templateId);
    const templateName = template?.name || 'Unknown Template';

    const session: DataSession = {
      id: generateId(),
      templateId,
      name: `${templateName} - Migrated Data`,
      createdAt: now,
      updatedAt: now,
    };

    newSessions[templateId] = session;

    newDataRows[session.id] = rows.map((row) => ({
      ...row,
      sessionId: session.id,
    }));
  }

  if (Object.keys(newSessions).length > 0) {
    const existingSessions = localStorage.getItem(STORAGE_KEYS.DATA_SESSIONS);
    const mergedSessions: StoredSessions = existingSessions
      ? { ...(JSON.parse(existingSessions) as StoredSessions), ...newSessions }
      : newSessions;

    localStorage.setItem(STORAGE_KEYS.DATA_SESSIONS, JSON.stringify(mergedSessions));
    localStorage.setItem(STORAGE_KEYS.DATA_ROWS, JSON.stringify(newDataRows));
  }
};

export const runMigrations = (): void => {
  const currentVersion = getMigrationVersion();

  if (currentVersion < 1) {
    migrateDataRowsToSessions();
  }

  if (currentVersion < CURRENT_MIGRATION_VERSION) {
    setMigrationVersion(CURRENT_MIGRATION_VERSION);
  }
};
