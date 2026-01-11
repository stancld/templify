export const FIELD_COLORS = {
  text: {
    bg: 'rgba(63, 138, 226, 0.2)',
    bgActive: 'rgba(63, 138, 226, 0.35)',
    border: '#3F8AE2',
  },
  number: {
    bg: 'rgba(0, 235, 130, 0.2)',
    bgActive: 'rgba(0, 235, 130, 0.35)',
    border: '#00eb82',
  },
  date: {
    bg: 'rgba(174, 51, 236, 0.2)',
    bgActive: 'rgba(174, 51, 236, 0.35)',
    border: '#AE33EC',
  },
} as const;

export type FieldType = keyof typeof FIELD_COLORS;

/**
 * Get field highlight colors for document viewer
 */
export const getFieldColor = (
  fieldType: string,
  isActive: boolean = false
): { bg: string; border: string } => {
  const colors = FIELD_COLORS[fieldType as FieldType] || FIELD_COLORS.text;
  return {
    bg: isActive ? colors.bgActive : colors.bg,
    border: colors.border,
  };
};

/**
 * Get the border color for a field type
 */
export const getFieldBorderColor = (fieldType: string): string => {
  const colors = FIELD_COLORS[fieldType as FieldType] || FIELD_COLORS.text;
  return colors.border;
};

/**
 * Tailwind CSS classes for field type badges/chips
 */
export const FIELD_TYPE_CLASSES = {
  text: 'bg-blue-100 text-blue-600',
  number: 'bg-green-100 text-green-600',
  date: 'bg-purple-100 text-purple-600',
} as const;

export const getFieldTypeClasses = (type: string): string =>
  FIELD_TYPE_CLASSES[type as FieldType] || FIELD_TYPE_CLASSES.text;

/**
 * Tailwind CSS classes for field cards in review sidebar
 */
export const FIELD_CARD_CLASSES = {
  text: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-300',
    activeBorder: 'border-blue-500',
    ring: 'ring-blue-200',
  },
  number: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-300',
    activeBorder: 'border-green-500',
    ring: 'ring-green-200',
  },
  date: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-300',
    activeBorder: 'border-purple-500',
    ring: 'ring-purple-200',
  },
} as const;

export const getFieldCardClasses = (type: string) =>
  FIELD_CARD_CLASSES[type as FieldType] || FIELD_CARD_CLASSES.text;
