import { DataSession } from '../types';
import { STORAGE_KEYS } from '../config/constants';
import { generateId } from '../utils/id';

interface StoredSessions {
  [templateId: string]: DataSession;
}

const loadAllSessions = (): StoredSessions => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DATA_SESSIONS);
    if (!data) {
      return {};
    }
    const parsed = JSON.parse(data) as StoredSessions;
    for (const templateId of Object.keys(parsed)) {
      parsed[templateId] = {
        ...parsed[templateId],
        createdAt: new Date(parsed[templateId].createdAt),
        updatedAt: new Date(parsed[templateId].updatedAt),
      };
    }
    return parsed;
  } catch {
    return {};
  }
};

const saveSessions = (sessions: StoredSessions): void => {
  localStorage.setItem(STORAGE_KEYS.DATA_SESSIONS, JSON.stringify(sessions));
};

export const getSessionForTemplate = (templateId: string): DataSession | null => {
  const stored = loadAllSessions();
  return stored[templateId] || null;
};

export const getOrCreateSession = (templateId: string, templateName: string): DataSession => {
  if (!templateId) {
    return {
      id: '',
      templateId: '',
      name: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const existing = getSessionForTemplate(templateId);
  if (existing) {
    return existing;
  }

  const stored = loadAllSessions();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const session: DataSession = {
    id: generateId('session'),
    templateId,
    name: `${templateName} - ${dateStr}`,
    createdAt: now,
    updatedAt: now,
  };

  stored[templateId] = session;
  saveSessions(stored);

  return session;
};

export const updateSessionName = (templateId: string, name: string): DataSession | null => {
  const stored = loadAllSessions();
  const session = stored[templateId];

  if (!session) {
    return null;
  }

  stored[templateId] = {
    ...session,
    name,
    updatedAt: new Date(),
  };
  saveSessions(stored);

  return stored[templateId];
};
