import React, { useEffect, useRef, useCallback } from 'react';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Field, DataRow } from '../../types';
import { getFieldIconComponent } from '../../utils/fieldIcons';
import { getFieldCardClasses } from '../../utils/fieldColors';
import { pluralize } from '../../utils/text';
import { useScrollResize } from '../../hooks/useScrollResize';

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

  useEffect(() => {
    if (activeFieldId && activeCardRef.current) {
      onFieldCardRectChange(activeCardRef.current.getBoundingClientRect());
    } else {
      onFieldCardRectChange(null);
    }
  }, [activeFieldId, onFieldCardRectChange]);

  const updateCardRect = useCallback(() => {
    if (activeCardRef.current) {
      onFieldCardRectChange(activeCardRef.current.getBoundingClientRect());
    }
  }, [onFieldCardRectChange]);

  useScrollResize(scrollContainerRef, updateCardRect, !!activeFieldId);

  return (
    <div className="w-80 bg-white border-l border-neutral-gray/20 flex flex-col h-full">
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

      <div className="px-6 py-4 border-b border-neutral-gray/20 bg-neutral-light/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-dark">Field Values</h2>
            <p className="text-xs text-neutral-gray">
              {fields.length} {pluralize(fields.length, 'field')} - click to locate
            </p>
          </div>
        </div>
      </div>

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
              const Icon = getFieldIconComponent(field.type);
              const colors = getFieldCardClasses(field.type);
              const isActive = field.id === activeFieldId;

              return (
                <div
                  key={field.id}
                  ref={isActive ? activeCardRef : undefined}
                  onClick={() => onFieldClick(field.id)}
                  className={`
                    bg-white border-2 rounded-lg p-3 cursor-pointer transition-all
                    ${isActive ? colors.activeBorder : 'border-neutral-gray/20'}
                    ${isActive ? `shadow-md ring-2 ring-offset-1 ${colors.ring}` : 'hover:shadow-sm hover:border-neutral-gray/40'}
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

      <div className="p-4 border-t border-neutral-gray/20 bg-neutral-light/30 shrink-0">
        <p className="text-xs text-neutral-gray text-center">
          Click a field to highlight it in the document
        </p>
      </div>
    </div>
  );
};
