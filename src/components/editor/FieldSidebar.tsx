import React from 'react';
import { Layers } from 'lucide-react';
import { Field } from '../../types';
import { FieldCard } from './FieldCard';

interface FieldSidebarProps {
  fields: Field[];
  activeFieldId: string | null;
  onFieldClick: (fieldId: string) => void;
  onFieldEdit: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
}

export const FieldSidebar: React.FC<FieldSidebarProps> = ({
  fields,
  activeFieldId,
  onFieldClick,
  onFieldEdit,
  onFieldDelete,
}) => {
  return (
    <div className="w-80 bg-white border-l border-neutral-gray/20 flex flex-col">
      <div className="p-6 border-b border-neutral-gray/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Layers size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-neutral-dark">Fields</h2>
        </div>
        <p className="text-sm text-neutral-gray">
          {fields.length} field{fields.length !== 1 ? 's' : ''} defined
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-light rounded-full mb-4">
              <Layers size={32} className="text-neutral-gray" />
            </div>
            <p className="text-neutral-gray text-sm leading-relaxed">
              No fields defined yet.
              <br />
              Select text in the document to create a field.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                isActive={field.id === activeFieldId}
                onClick={() => onFieldClick(field.id)}
                onEdit={() => onFieldEdit(field.id)}
                onDelete={() => onFieldDelete(field.id)}
              />
            ))}
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="p-6 border-t border-neutral-gray/20 bg-neutral-light/30">
          <p className="text-xs text-neutral-gray text-center">
            Click a field to highlight it in the document
          </p>
        </div>
      )}
    </div>
  );
};
