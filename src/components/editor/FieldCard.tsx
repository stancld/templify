import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Field } from '../../types';
import { getFieldIcon } from '../../utils/fieldIcons';
import { getFieldBorderColor } from '../../utils/fieldColors';

interface FieldCardProps {
  field: Field;
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  field,
  isActive,
  onClick,
  onEdit,
  onDelete,
}) => {
  const fieldColor = getFieldBorderColor(field.type);

  return (
    <div
      data-field-card-id={field.id}
      className={`
        p-4 rounded-lg border-2 transition-all cursor-pointer
        ${
          isActive
            ? 'border-accent-purple bg-purple-50/50 shadow-md'
            : 'border-neutral-gray/20 bg-white hover:border-primary hover:shadow-sm'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-dark mb-1">{field.name}</h3>
          <div
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: `${fieldColor}20`,
              color: fieldColor,
            }}
          >
            {getFieldIcon(field.type)}
            <span className="capitalize">{field.type}</span>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-neutral-gray font-mono bg-neutral-light px-2 py-1 rounded truncate">
          "{field.placeholder.length > 40 ? `${field.placeholder.substring(0, 40)}...` : field.placeholder}"
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex-1 px-3 py-1.5 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-1"
        >
          <Edit size={14} />
          <span>Edit</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
