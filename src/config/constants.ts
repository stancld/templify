export const STORAGE_KEYS = {
  TEMPLATES: 'templify_templates',
  DATA_ROWS: 'templify_data_rows',
  DATA_SESSIONS: 'templify_data_sessions',
  MIGRATION_VERSION: 'templify_migration_version',
} as const;

export const STORAGE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  WARNING_THRESHOLD: 0.8,
} as const;

export const FIELD_TYPES = ['text', 'number', 'date'] as const;
export type FieldTypeValue = (typeof FIELD_TYPES)[number];

export const SUPABASE_CONFIG = {
  TABLES: {
    TEMPLATES: 'templates',
    DATA_SESSIONS: 'data_sessions',
    DATA_ROWS: 'data_rows',
  },
} as const;
