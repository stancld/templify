/**
 * Returns singular or plural form based on count.
 * @example pluralize(1, 'field') => 'field'
 * @example pluralize(2, 'field') => 'fields'
 * @example pluralize(0, 'entry', 'entries') => 'entries'
 */
export const pluralize = (
  count: number,
  singular: string,
  plural: string = `${singular}s`
): string => (count === 1 ? singular : plural);
