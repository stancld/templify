import React, { useEffect, useRef } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Type,
  Hash,
  Calendar,
} from 'lucide-react';
import { Field, DataRow } from '../../types';

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  date: Calendar,
};

const fieldTypeColors = {
  text: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-300',
    activeBorder: 'border-blue-500',
  },
  number: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-300',
    activeBorder: 'border-green-500',
  },
  date: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-300',
    activeBorder: 'border-purple-500',
  },
};

interface ReviewFieldSidebarProps {
  fields: Field[];
  dataRow: DataRow | null;
  currentIndex: number;
  totalDocuments: number;
  activeFieldId: string | null;
  onPrevious: () => void;
  onNext: () => void;
  onFieldClick: (fieldId: string) => void;
  onFieldCardRectChange: (rect: DOMRect | null) => void;
}

export const ReviewFieldSidebar: React.FC<ReviewFieldSidebarProps> = ({
  fields,
  dataRow,
  currentIndex,
  totalDocuments,
  activeFieldId,
  onPrevious,
  onNext,
  onFieldClick,
  onFieldCardRectChange,
}) => {
  const activeCardRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Report active field card position for connector line
  useEffect(() => {
    if (activeFieldId && activeCardRef.current) {
      onFieldCardRectChange(activeCardRef.current.getBoundingClientRect());
    } else {
      onFieldCardRectChange(null);
    }
  }, [activeFieldId, onFieldCardRectChange]);

  // Update field card rect on scroll to keep connector line anchored
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !activeFieldId) {return;}

    const updateCardRect = () => {
      if (activeCardRef.current) {
        onFieldCardRectChange(activeCardRef.current.getBoundingClientRect());
      }
    };

    container.addEventListener('scroll', updateCardRect);
    window.addEventListener('resize', updateCardRect);

    return () => {
      container.removeEventListener('scroll', updateCardRect);
      window.removeEventListener('resize', updateCardRect);
    };
  }, [activeFieldId, onFieldCardRectChange]);

  return (
    <div className="w-80 bg-white border-l border-neutral-gray/20 flex flex-col h-full">
      {/* Document Navigation Header */}
      <div className="p-4 border-b border-neutral-gray/20 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="p-2 hover:bg-neutral-light rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous document"
          >
            <ChevronLeft size={20} className="text-neutral-dark" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-dark">
              Document {currentIndex + 1} of {totalDocuments}
            </p>
          </div>
          <button
            onClick={onNext}
            disabled={currentIndex === totalDocuments - 1}
            className="p-2 hover:bg-neutral-light rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next document"
          >
            <ChevronRight size={20} className="text-neutral-dark" />
          </button>
        </div>
      </div>

      {/* Fields Header */}
      <div className="px-6 py-4 border-b border-neutral-gray/20 bg-neutral-light/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-dark">Field Values</h2>
            <p className="text-xs text-neutral-gray">
              {fields.length} field{fields.length !== 1 ? 's' : ''} - click to locate
            </p>
          </div>
        </div>
      </div>

      {/* Field Values List */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-light rounded-full mb-4">
              <FileText size={32} className="text-neutral-gray" />
            </div>
            <p className="text-neutral-gray text-sm">
              No fields defined in this template.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field) => {
              const value = dataRow?.values[field.id] || '';
              const Icon = fieldTypeIcons[field.type];
              const colors = fieldTypeColors[field.type];
              const isActive = field.id === activeFieldId;

              return (
                <div
                  key={field.id}
                  ref={isActive ? activeCardRef : undefined}
                  onClick={() => onFieldClick(field.id)}
                  className={`
                    bg-white border-2 rounded-lg p-3 cursor-pointer transition-all
                    ${isActive ? colors.activeBorder : 'border-neutral-gray/20'}
                    ${isActive ? 'shadow-md ring-2 ring-offset-1' : 'hover:shadow-sm hover:border-neutral-gray/40'}
                    ${isActive ? (field.type === 'text' ? 'ring-blue-200' : field.type === 'number' ? 'ring-green-200' : 'ring-purple-200') : ''}
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${colors.bg} ${colors.text}`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-sm font-medium text-neutral-dark truncate">
                      {field.name}
                    </span>
                  </div>
                  <div className="bg-neutral-light/50 rounded-md px-3 py-2">
                    {value ? (
                      <p className="text-sm text-neutral-dark break-words">
                        {value}
                      </p>
                    ) : (
                      <p className="text-sm text-neutral-gray italic">
                        (empty)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-4 border-t border-neutral-gray/20 bg-neutral-light/30 shrink-0">
        <p className="text-xs text-neutral-gray text-center">
          Click a field to highlight it in the document
        </p>
      </div>
    </div>
  );
};
