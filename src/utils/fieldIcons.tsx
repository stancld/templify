import React from 'react';
import { Type, Hash, Calendar, LucideIcon } from 'lucide-react';

export const FIELD_TYPE_ICONS: Record<string, LucideIcon> = {
  text: Type,
  number: Hash,
  date: Calendar,
};

export const getFieldIcon = (type: string, size: number = 16): React.ReactNode => {
  const Icon = FIELD_TYPE_ICONS[type] || Type;
  return <Icon size={size} />;
};

export const getFieldIconComponent = (type: string): LucideIcon =>
  FIELD_TYPE_ICONS[type] || Type;
