import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Field, DataRow } from '../../types';
import { renderDocxPreview, createPositionMap } from '../../services/docx-preview';

interface ReviewDocumentViewerProps {
  docxBlob: Blob;
  fields: Field[];
  dataRow: DataRow | null;
  activeFieldId: string | null;
  onFieldClick: (fieldId: string | null) => void;
  onHighlightRectChange: (rect: DOMRect | null) => void;
}

const getFieldColor = (
  fieldType: string,
  isActive: boolean
): { bg: string; border: string } => {
  const colors = {
    text: {
      bg: isActive ? 'rgba(63, 138, 226, 0.35)' : 'rgba(63, 138, 226, 0.2)',
      border: '#3F8AE2',
    },
    number: {
      bg: isActive ? 'rgba(0, 235, 130, 0.35)' : 'rgba(0, 235, 130, 0.2)',
      border: '#00eb82',
    },
    date: {
      bg: isActive ? 'rgba(174, 51, 236, 0.35)' : 'rgba(174, 51, 236, 0.2)',
      border: '#AE33EC',
    },
  };

  return colors[fieldType as keyof typeof colors] || colors.text;
};

export const ReviewDocumentViewer: React.FC<ReviewDocumentViewerProps> = ({
  docxBlob,
  fields,
  dataRow,
  activeFieldId,
  onFieldClick,
  onHighlightRectChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleContainerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plainTextRef = useRef<string>('');

  useEffect(() => {
    const renderDocument = async () => {
      if (!containerRef.current) {return;}

      try {
        setError(null);
        setIsRendered(false);

        containerRef.current.innerHTML = '';

        await renderDocxPreview(
          docxBlob,
          containerRef.current,
          styleContainerRef.current ?? undefined,
          {
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
          }
        );

        // Extract plain text for searching
        plainTextRef.current = containerRef.current.textContent || '';
        setIsRendered(true);
      } catch (err) {
        console.error('Error rendering document:', err);
        setError('Failed to render document preview.');
      }
    };

    void renderDocument();
  }, [docxBlob]);

  const applyFieldHighlights = useCallback(() => {
    if (!containerRef.current || !isRendered || !dataRow) {return;}

    // Remove existing highlights
    const existingHighlights = containerRef.current.querySelectorAll('.field-value-highlight');
    existingHighlights.forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
      }
    });

    const positionMap = createPositionMap(containerRef.current);
    const plainText = plainTextRef.current;

    // For each field, find its value in the document and highlight
    fields.forEach((field) => {
      const value = dataRow.values[field.id];
      if (!value || value.trim().length === 0) {return;}

      // Find the value in the plain text
      const valueIndex = plainText.indexOf(value);
      if (valueIndex === -1) {return;}

      const startPosition = valueIndex;
      const endPosition = valueIndex + value.length;

      const { bg, border } = getFieldColor(field.type, field.id === activeFieldId);

      // Find the text nodes that contain this range
      const startEntries = positionMap.filter(
        (entry) => entry.startOffset <= startPosition && entry.endOffset > startPosition
      );
      const endEntries = positionMap.filter(
        (entry) => entry.startOffset < endPosition && entry.endOffset >= endPosition
      );

      if (startEntries.length === 0 || endEntries.length === 0) {return;}

      const startEntry = startEntries[0];
      const endEntry = endEntries[0];

      // Only highlight if within single text node (for simplicity)
      if (startEntry.node === endEntry.node) {
        const textNode = startEntry.node as Text;
        const startOffset = startPosition - startEntry.startOffset;
        const endOffset = endPosition - startEntry.startOffset;

        const range = document.createRange();
        range.setStart(textNode, startOffset);
        range.setEnd(textNode, endOffset);

        const mark = document.createElement('mark');
        mark.className = 'field-value-highlight';
        mark.dataset.fieldId = field.id;
        mark.dataset.fieldType = field.type;
        mark.style.backgroundColor = bg;
        mark.style.borderBottom = `2px solid ${border}`;
        mark.style.cursor = 'pointer';
        mark.style.padding = '2px 0';
        mark.style.borderRadius = '2px';
        mark.style.transition = 'background-color 0.2s';

        try {
          range.surroundContents(mark);
        } catch {
          // Cross-element selection, skip this field
        }
      }
    });

    // Update highlight rect for connector line
    if (activeFieldId) {
      const activeHighlight = containerRef.current.querySelector(
        `[data-field-id="${activeFieldId}"]`
      );
      if (activeHighlight) {
        onHighlightRectChange(activeHighlight.getBoundingClientRect());
      } else {
        onHighlightRectChange(null);
      }
    } else {
      onHighlightRectChange(null);
    }
  }, [fields, dataRow, activeFieldId, isRendered, onHighlightRectChange]);

  useEffect(() => {
    if (isRendered) {
      applyFieldHighlights();
    }
  }, [isRendered, applyFieldHighlights]);

  // Handle clicks on highlights
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const fieldMark = target.closest('[data-field-id]');

      if (fieldMark) {
        const fieldId = fieldMark.getAttribute('data-field-id');
        onFieldClick(fieldId);
      } else {
        onFieldClick(null);
      }
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('click', handleClick);
    }

    return () => {
      if (element) {
        element.removeEventListener('click', handleClick);
      }
    };
  }, [onFieldClick]);

  // Scroll to active field highlight
  useEffect(() => {
    if (!activeFieldId || !containerRef.current) {return;}

    const activeHighlight = containerRef.current.querySelector(
      `[data-field-id="${activeFieldId}"]`
    );
    if (activeHighlight) {
      activeHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeFieldId]);

  // Update highlight rect on scroll to keep connector line anchored
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !activeFieldId) {return;}

    const updateHighlightRect = () => {
      const activeHighlight = container.querySelector(
        `[data-field-id="${activeFieldId}"]`
      );
      if (activeHighlight) {
        onHighlightRectChange(activeHighlight.getBoundingClientRect());
      }
    };

    container.addEventListener('scroll', updateHighlightRect);
    window.addEventListener('resize', updateHighlightRect);

    return () => {
      container.removeEventListener('scroll', updateHighlightRect);
      window.removeEventListener('resize', updateHighlightRect);
    };
  }, [activeFieldId, onHighlightRectChange]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={styleContainerRef} />

      <div
        ref={containerRef}
        className="document-preview-container bg-neutral-200 overflow-auto h-full"
      />

      {!isRendered && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-blue border-t-transparent" />
        </div>
      )}

      <style>{`
        .field-value-highlight:hover {
          filter: brightness(0.92);
        }
      `}</style>
    </div>
  );
};
