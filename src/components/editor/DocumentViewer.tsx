import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Field } from '../../types';
import {
  renderDocxPreview,
  extractPlainTextFromContainer,
  convertDomRangeToCharPositions,
  createPositionMap,
  extractTextFromBoundingBox,
} from '../../services/docx-preview';
import { BoundingBoxDrawer } from './BoundingBoxDrawer';

export interface TextSelection {
  startPosition: number;
  endPosition: number;
  placeholder: string;
}

interface DocumentViewerProps {
  docxBlob: Blob;
  fields: Field[];
  onTextSelected: (selection: TextSelection) => void;
  onFieldClick: (fieldId: string) => void;
  onPlainTextExtracted: (plainText: string) => void;
  activeFieldId: string | null;
}

const getFieldColor = (
  fieldType: string,
  isActive: boolean
): { bg: string; border: string } => {
  const colors = {
    text: {
      bg: isActive ? 'rgba(63, 138, 226, 0.3)' : 'rgba(63, 138, 226, 0.2)',
      border: '#3F8AE2',
    },
    number: {
      bg: isActive ? 'rgba(0, 235, 130, 0.3)' : 'rgba(0, 235, 130, 0.2)',
      border: '#00eb82',
    },
    date: {
      bg: isActive ? 'rgba(174, 51, 236, 0.3)' : 'rgba(174, 51, 236, 0.2)',
      border: '#AE33EC',
    },
  };

  return colors[fieldType as keyof typeof colors] || colors.text;
};

const hasOverlap = (start: number, end: number, fields: Field[]): boolean => {
  return fields.some(
    (field) => start < field.endPosition && end > field.startPosition
  );
};

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  docxBlob,
  fields,
  onTextSelected,
  onFieldClick,
  onPlainTextExtracted,
  activeFieldId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleContainerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
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
          styleContainerRef.current ?? undefined
        );

        const plainText = extractPlainTextFromContainer(containerRef.current);
        plainTextRef.current = plainText;
        onPlainTextExtracted(plainText);

        setIsRendered(true);
      } catch (err) {
        console.error('Error rendering document:', err);
        setError('Failed to render document. Please ensure the file is a valid .docx file.');
      }
    };

    void renderDocument();
  }, [docxBlob, onPlainTextExtracted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        setIsDrawMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        setIsDrawMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', () => setIsDrawMode(false));

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', () => setIsDrawMode(false));
    };
  }, []);

  const applyFieldHighlights = useCallback(() => {
    if (!containerRef.current || !isRendered || fields.length === 0) {return;}

    const existingHighlights = containerRef.current.querySelectorAll('.field-highlight');
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

    const sortedFields = [...fields].sort((a, b) => a.startPosition - b.startPosition);

    sortedFields.forEach((field) => {
      const { bg, border } = getFieldColor(field.type, field.id === activeFieldId);

      const startEntries = positionMap.filter(
        (entry) => entry.startOffset <= field.startPosition && entry.endOffset > field.startPosition
      );
      const endEntries = positionMap.filter(
        (entry) => entry.startOffset < field.endPosition && entry.endOffset >= field.endPosition
      );

      if (startEntries.length === 0 || endEntries.length === 0) {return;}

      const startEntry = startEntries[0];
      const endEntry = endEntries[0];

      if (startEntry.node === endEntry.node) {
        const textNode = startEntry.node as Text;
        const startOffset = field.startPosition - startEntry.startOffset;
        const endOffset = field.endPosition - startEntry.startOffset;

        const range = document.createRange();
        range.setStart(textNode, startOffset);
        range.setEnd(textNode, endOffset);

        const mark = document.createElement('mark');
        mark.className = 'field-highlight';
        mark.dataset.fieldId = field.id;
        mark.dataset.fieldType = field.type;
        mark.style.backgroundColor = bg;
        mark.style.borderBottom = `2px solid ${border}`;
        mark.style.cursor = 'pointer';
        mark.style.padding = '2px 0';
        mark.style.borderRadius = '2px';

        try {
          range.surroundContents(mark);
        } catch {
          console.warn('Could not highlight field:', field.name);
        }
      }
    });
  }, [fields, activeFieldId, isRendered]);

  useEffect(() => {
    if (isRendered) {
      applyFieldHighlights();
    }
  }, [isRendered, applyFieldHighlights]);

  const handleSelection = useCallback(() => {
    setSelectionError(null);

    const windowSelection = window.getSelection();
    if (!windowSelection || windowSelection.isCollapsed) {return;}
    if (!containerRef.current) {return;}

    try {
      const range = windowSelection.getRangeAt(0);

      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        return;
      }

      const positions = convertDomRangeToCharPositions(range, containerRef.current);
      if (!positions) {
        setSelectionError('Could not determine selection position');
        return;
      }

      let { startPosition, endPosition } = positions;
      if (startPosition === endPosition) {return;}

      const rawText = plainTextRef.current.substring(startPosition, endPosition);
      const leadingWhitespace = rawText.length - rawText.trimStart().length;
      const trailingWhitespace = rawText.length - rawText.trimEnd().length;

      startPosition += leadingWhitespace;
      endPosition -= trailingWhitespace;

      const placeholder = rawText.trim();

      if (placeholder.length === 0) {
        setSelectionError('Selection contains no text');
        return;
      }

      if (placeholder.length > 500) {
        setSelectionError('Selected text is too long (max 500 characters)');
        return;
      }

      if (hasOverlap(startPosition, endPosition, fields)) {
        setSelectionError('Selection overlaps with existing field');
        return;
      }

      onTextSelected({
        startPosition,
        endPosition,
        placeholder,
      });

      windowSelection.removeAllRanges();
    } catch (err) {
      console.error('Error handling selection:', err);
      setSelectionError('Error processing selection');
    }
  }, [fields, onTextSelected]);

  const handleBoundingBoxDrawn = useCallback(
    (box: { x: number; y: number; width: number; height: number }) => {
      if (!containerRef.current) {return;}
      setSelectionError(null);

      const result = extractTextFromBoundingBox(box, containerRef.current, plainTextRef.current);
      if (!result) {
        setSelectionError('No text found in selected area');
        return;
      }

      const rawText = result.text;
      const leadingWhitespace = rawText.length - rawText.trimStart().length;
      const trailingWhitespace = rawText.length - rawText.trimEnd().length;

      const startPosition = result.startPosition + leadingWhitespace;
      const endPosition = result.endPosition - trailingWhitespace;
      const text = rawText.trim();

      if (text.length === 0) {
        setSelectionError('Selection contains no text');
        return;
      }

      if (text.length > 500) {
        setSelectionError('Selected text is too long (max 500 characters)');
        return;
      }

      if (hasOverlap(startPosition, endPosition, fields)) {
        setSelectionError('Selection overlaps with existing field');
        return;
      }

      onTextSelected({
        startPosition,
        endPosition,
        placeholder: text,
      });
    },
    [fields, onTextSelected]
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const fieldMark = target.closest('[data-field-id]');

      if (fieldMark) {
        const fieldId = fieldMark.getAttribute('data-field-id');
        if (fieldId) {
          onFieldClick(fieldId);
        }
      } else if (activeFieldId) {
        onFieldClick(activeFieldId);
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
  }, [onFieldClick, activeFieldId]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="relative">
      {selectionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {selectionError}
        </div>
      )}

      <div ref={styleContainerRef} />

      <div
        ref={containerRef}
        className="docx-container"
        onMouseUp={!isDrawMode ? handleSelection : undefined}
        style={{
          userSelect: isDrawMode ? 'none' : 'text',
          cursor: isDrawMode ? 'crosshair' : 'text',
        }}
      />

      <BoundingBoxDrawer
        enabled={isDrawMode && isRendered}
        containerRef={containerRef}
        onBoxDrawn={handleBoundingBoxDrawn}
      />

      {!isRendered && !error && (
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </div>
      )}

      <style>{`
        .docx-container {
          min-height: 200px;
        }

        .docx-container .docx-wrapper {
          background: white;
          padding: 0;
        }

        .docx-container .docx-wrapper > section.docx {
          box-shadow: none;
          margin: 0;
          padding: 0;
          min-height: auto;
        }

        .field-highlight:hover {
          filter: brightness(0.95);
        }

        @media print {
          .docx-container .docx-wrapper {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};
