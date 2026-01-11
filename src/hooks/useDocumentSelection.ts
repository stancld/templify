import { useState, RefObject } from 'react';
import { Field } from '../types';
import { convertDomRangeToCharPositions } from '../services/docx-parser';

export interface TextSelection {
  startPosition: number;
  endPosition: number;
  placeholder: string;
}

const hasOverlap = (start: number, end: number, fields: Field[]): boolean => {
  return fields.some(
    (field) => start < field.endPosition && end > field.startPosition
  );
};

export const useDocumentSelection = (
  documentRef: RefObject<HTMLElement>,
  plainText: string,
  existingFields: Field[]
) => {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelection = () => {
    setError(null);

    const windowSelection = window.getSelection();

    if (!windowSelection || windowSelection.isCollapsed) {
      setSelection(null);
      return;
    }

    if (!documentRef.current) {
      setSelection(null);
      return;
    }

    try {
      const range = windowSelection.getRangeAt(0);

      const positions = convertDomRangeToCharPositions(range, documentRef.current);

      if (!positions) {
        setError('Could not determine selection position');
        setSelection(null);
        return;
      }

      const { startPosition, endPosition } = positions;

      if (startPosition === endPosition) {
        setSelection(null);
        return;
      }

      const placeholder = plainText.substring(startPosition, endPosition).trim();

      if (placeholder.length === 0) {
        setError('Selection contains no text');
        setSelection(null);
        return;
      }

      if (placeholder.length > 500) {
        setError('Selected text is too long (max 500 characters)');
        setSelection(null);
        return;
      }

      if (hasOverlap(startPosition, endPosition, existingFields)) {
        setError('Selection overlaps with existing field');
        setSelection(null);
        return;
      }

      setSelection({
        startPosition,
        endPosition,
        placeholder,
      });
    } catch (err) {
      console.error('Error handling selection:', err);
      setError('Error processing selection');
      setSelection(null);
    }
  };

  const clearSelection = () => {
    setSelection(null);
    setError(null);
    window.getSelection()?.removeAllRanges();
  };

  return {
    selection,
    error,
    handleSelection,
    clearSelection,
  };
};
