import React, { useRef, useEffect, useMemo } from 'react';
import { Field } from '../../types';
import { useDocumentSelection, TextSelection } from '../../hooks/useDocumentSelection';

interface DocumentViewerProps {
  htmlContent: string;
  fields: Field[];
  plainText: string;
  onTextSelected: (selection: TextSelection) => void;
  onFieldClick: (fieldId: string) => void;
  activeFieldId: string | null;
}

const getFieldColor = (fieldType: string, isActive: boolean, isHover: boolean = false): { bg: string; border: string } => {
  const colors = {
    text: {
      bg: isActive ? 'rgba(63, 138, 226, 0.3)' : isHover ? 'rgba(63, 138, 226, 0.25)' : 'rgba(63, 138, 226, 0.2)',
      border: '#3F8AE2',
    },
    number: {
      bg: isActive ? 'rgba(0, 235, 130, 0.3)' : isHover ? 'rgba(0, 235, 130, 0.25)' : 'rgba(0, 235, 130, 0.2)',
      border: '#00eb82',
    },
    date: {
      bg: isActive ? 'rgba(174, 51, 236, 0.3)' : isHover ? 'rgba(174, 51, 236, 0.25)' : 'rgba(174, 51, 236, 0.2)',
      border: '#AE33EC',
    },
  };

  return colors[fieldType as keyof typeof colors] || colors.text;
};

const generateHighlightedHtml = (
  htmlContent: string,
  plainText: string,
  fields: Field[],
  activeFieldId: string | null
): string => {
  const sortedFields = [...fields].sort((a, b) => b.startPosition - a.startPosition);

  let modifiedPlainText = plainText;
  const insertions: Array<{ position: number; text: string }> = [];

  sortedFields.forEach((field) => {
    const isActive = field.id === activeFieldId;
    const { bg, border } = getFieldColor(field.type, isActive);

    const startTag = `<mark class="field-highlight" data-field-id="${field.id}" data-field-type="${field.type}" style="background-color: ${bg}; border-bottom: 2px solid ${border}; cursor: pointer; transition: all 0.2s; padding: 2px 0;">`;
    const endTag = '</mark>';

    insertions.push({ position: field.endPosition, text: endTag });
    insertions.push({ position: field.startPosition, text: startTag });
  });

  insertions.sort((a, b) => b.position - a.position);

  insertions.forEach((insertion) => {
    modifiedPlainText =
      modifiedPlainText.substring(0, insertion.position) +
      insertion.text +
      modifiedPlainText.substring(insertion.position);
  });

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  let currentPos = 0;
  let modifiedPos = 0;

  const processNode = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textLength = node.textContent?.length || 0;
      const modifiedText = modifiedPlainText.substring(modifiedPos, modifiedPos + textLength + countInsertions(currentPos, currentPos + textLength, insertions));

      if (node.textContent) {
        node.textContent = '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modifiedText;
        while (tempDiv.firstChild) {
          node.parentNode?.insertBefore(tempDiv.firstChild, node);
        }
      }

      currentPos += textLength;
      modifiedPos += modifiedText.length;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(processNode);
    }
  };

  const countInsertions = (start: number, end: number, insertions: Array<{ position: number; text: string }>): number => {
    return insertions
      .filter((ins) => ins.position >= start && ins.position < end)
      .reduce((sum, ins) => sum + ins.text.length, 0);
  };

  try {
    Array.from(doc.body.childNodes).forEach(processNode);
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error generating highlighted HTML:', error);
    return htmlContent;
  }
};

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  htmlContent,
  fields,
  plainText,
  onTextSelected,
  onFieldClick,
  activeFieldId,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const { selection, error, handleSelection, clearSelection } = useDocumentSelection(
    documentRef,
    plainText,
    fields
  );

  const highlightedHtml = useMemo(
    () => generateHighlightedHtml(htmlContent, plainText, fields, activeFieldId),
    [htmlContent, plainText, fields, activeFieldId]
  );

  useEffect(() => {
    if (selection) {
      onTextSelected(selection);
      clearSelection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const fieldMark = target.closest('[data-field-id]');

      if (fieldMark) {
        const fieldId = fieldMark.getAttribute('data-field-id');
        if (fieldId) {
          onFieldClick(fieldId);
        }
      }
    };

    const element = documentRef.current;
    if (element) {
      element.addEventListener('click', handleClick);
    }

    return () => {
      if (element) {
        element.removeEventListener('click', handleClick);
      }
    };
  }, [onFieldClick]);

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div
        ref={documentRef}
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        onMouseUp={handleSelection}
        style={{
          userSelect: 'text',
          cursor: 'text',
        }}
      />

      <style>{`
        .field-highlight:hover {
          filter: brightness(0.95);
        }
      `}</style>
    </div>
  );
};
