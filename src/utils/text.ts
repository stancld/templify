export const pluralize = (
  count: number,
  singular: string,
  plural: string = `${singular}s`
): string => (count === 1 ? singular : plural);
