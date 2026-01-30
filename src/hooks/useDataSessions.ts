import { useState, useCallback } from 'react';
import { DataSession } from '../types';
import {
  getOrCreateSession,
  updateSessionName as updateSessionNameService,
} from '../services/data-sessions';

export const useDataSession = (templateId: string, templateName: string) => {
  const [session, setSession] = useState<DataSession>(() =>
    getOrCreateSession(templateId, templateName)
  );

  const updateSessionName = useCallback(
    (name: string) => {
      const updated = updateSessionNameService(session.templateId, name);
      if (updated) {
        setSession(updated);
      }
      return updated;
    },
    [session.templateId]
  );

  return {
    session,
    updateSessionName,
  };
};
