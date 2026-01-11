/**
 * Generates a unique ID with the given prefix.
 * Format: {prefix}_{timestamp}_{random}
 */
export const generateId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
