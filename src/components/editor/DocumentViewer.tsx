import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
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
  const [zoom, setZoom] = useState(1);
  const plainTextRef = useRef<string>('');

  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;

  const handleZoomIn = () => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  const handleZoomReset = () => setZoom(1);

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
        mark.addEventListener('click', (e) => {
          e.stopPropagation();
          onFieldClick(field.id);
        });

        try {
          range.surroundContents(mark);
        } catch {
          console.warn('Could not highlight field:', field.name);
        }
      }
    });
  }, [fields, activeFieldId, isRendered, onFieldClick]);

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
        // Silently return - clicking on a field is handled by handleClick
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
        // Silently return - clicking on a field is handled by handleClick
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

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed left-4 top-24 z-50">
        <div className="flex items-center gap-1 bg-white border border-neutral-gray/20 rounded-lg shadow-md px-2 py-1">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="p-1.5 hover:bg-neutral-light rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Zoom out"
          >
            <ZoomOut size={18} className="text-neutral-dark" />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1 text-sm font-medium text-neutral-dark hover:bg-neutral-light rounded transition-colors min-w-[52px]"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-1.5 hover:bg-neutral-light rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Zoom in"
          >
            <ZoomIn size={18} className="text-neutral-dark" />
          </button>
        </div>
      </div>

      {selectionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {selectionError}
        </div>
      )}

      <div ref={styleContainerRef} />

      <div
        className="docx-zoom-wrapper"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
        }}
      >
        <div
          ref={containerRef}
          className="docx-container"
          onMouseUp={!isDrawMode ? handleSelection : undefined}
          style={{
            userSelect: isDrawMode ? 'none' : 'text',
            cursor: isDrawMode ? 'crosshair' : 'text',
          }}
        />
      </div>

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
