import React from 'react';
import { Template } from '../../types';
import { TemplateCard } from './TemplateCard';
import { FileQuestion } from 'lucide-react';

interface TemplatesListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
}

export const TemplatesList: React.FC<TemplatesListProps> = ({
  templates,
  onEdit,
  onDelete,
}) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex p-6 bg-neutral-light rounded-full mb-4">
          <FileQuestion size={48} className="text-neutral-gray" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-dark mb-2">
          No templates yet
        </h3>
        <p className="text-neutral-gray">
          Upload your first document template to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
