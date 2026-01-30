import React from 'react';
import { FileText, Calendar, Trash2, Edit } from 'lucide-react';
import { Template } from '../../types';
import { pluralize } from '../../utils/text';

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white border border-neutral-gray/20 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-primary rounded-lg">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-neutral-dark">
              {template.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-neutral-gray mt-1">
              <Calendar size={14} />
              <span>{formatDate(template.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-neutral-gray">
          {template.schema.length} {pluralize(template.schema.length, 'field')} defined
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(template)}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Edit size={16} />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(template.id)}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
