import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Field, DataRow } from '../../types';
import { getFieldTypeClasses } from '../../utils/fieldColors';

interface SpreadsheetGridProps {
  fields: Field[];
  rows: DataRow[];
  onAddRow: () => void;
  onUpdateCell: (rowId: string, fieldId: string, value: string) => void;
  onDeleteRow: (rowId: string) => void;
}

interface EditingCell {
  rowId: string;
  fieldId: string;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  fields,
  rows,
  onAddRow,
  onUpdateCell,
  onDeleteRow,
}) => {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleCellClick = useCallback((rowId: string, fieldId: string, currentValue: string) => {
    setEditingCell({ rowId, fieldId });
    setEditValue(currentValue);
  }, []);

  const handleCellBlur = useCallback(() => {
    if (editingCell) {
      onUpdateCell(editingCell.rowId, editingCell.fieldId, editValue);
      setEditingCell(null);
    }
  }, [editingCell, editValue, onUpdateCell]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!editingCell) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        onUpdateCell(editingCell.rowId, editingCell.fieldId, editValue);

        const currentRowIndex = rows.findIndex((r) => r.id === editingCell.rowId);
        if (currentRowIndex < rows.length - 1) {
          const nextRow = rows[currentRowIndex + 1];
          setEditingCell({ rowId: nextRow.id, fieldId: editingCell.fieldId });
          setEditValue(nextRow.values[editingCell.fieldId] || '');
        } else {
          setEditingCell(null);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        onUpdateCell(editingCell.rowId, editingCell.fieldId, editValue);

        const currentFieldIndex = fields.findIndex((f) => f.id === editingCell.fieldId);
        const isShift = e.shiftKey;

        if (isShift) {
          if (currentFieldIndex > 0) {
            const prevField = fields[currentFieldIndex - 1];
            const currentRow = rows.find((r) => r.id === editingCell.rowId);
            setEditingCell({ rowId: editingCell.rowId, fieldId: prevField.id });
            setEditValue(currentRow?.values[prevField.id] || '');
          }
        } else {
          if (currentFieldIndex < fields.length - 1) {
            const nextField = fields[currentFieldIndex + 1];
            const currentRow = rows.find((r) => r.id === editingCell.rowId);
            setEditingCell({ rowId: editingCell.rowId, fieldId: nextField.id });
            setEditValue(currentRow?.values[nextField.id] || '');
          }
        }
      } else if (e.key === 'Escape') {
        setEditingCell(null);
      }
    },
    [editingCell, editValue, fields, rows, onUpdateCell]
  );

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-neutral-gray mb-4">
          <p className="text-lg font-medium">No fields defined</p>
          <p className="text-sm mt-1">
            Go back to the template editor and highlight text to define fields first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={tableRef} className="flex-1 overflow-auto border border-neutral-gray/20 rounded-lg">
        <table className="w-full border-collapse min-w-max">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-primary/10 to-accent-purple/10">
              <th className="w-12 px-3 py-3 text-left text-xs font-semibold text-neutral-gray uppercase tracking-wider border-b border-r border-neutral-gray/20 bg-neutral-light">
                #
              </th>
              {fields.map((field) => (
                <th
                  key={field.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-dark uppercase tracking-wider border-b border-r border-neutral-gray/20 bg-white/80 backdrop-blur-sm min-w-[150px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{field.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getFieldTypeClasses(field.type)}`}>
                      {field.type}
                    </span>
                  </div>
                </th>
              ))}
              <th className="w-12 px-3 py-3 border-b border-neutral-gray/20 bg-neutral-light" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id} className="group hover:bg-primary/5 transition-colors">
                <td className="px-3 py-2 text-sm text-neutral-gray border-b border-r border-neutral-gray/20 bg-neutral-light/50">
                  {rowIndex + 1}
                </td>
                {fields.map((field) => {
                  const isEditing =
                    editingCell?.rowId === row.id && editingCell?.fieldId === field.id;
                  const value = row.values[field.id] || '';

                  return (
                    <td
                      key={field.id}
                      className={`px-0 py-0 border-b border-r border-neutral-gray/20 ${
                        isEditing ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''
                      }`}
                      onClick={() => !isEditing && handleCellClick(row.id, field.id, value)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={handleKeyDown}
                          className="w-full h-full px-4 py-2 text-sm bg-transparent outline-none"
                        />
                      ) : (
                        <div
                          className="px-4 py-2 text-sm cursor-text min-h-[36px] hover:bg-primary/5"
                          title={value}
                        >
                          <span className="truncate block">{value || '\u00A0'}</span>
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-2 border-b border-neutral-gray/20 bg-neutral-light/50">
                  <button
                    onClick={() => onDeleteRow(row.id)}
                    className="p-1.5 text-neutral-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete row"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={fields.length + 2}
                  className="px-4 py-12 text-center text-neutral-gray border-b border-neutral-gray/20"
                >
                  <p className="mb-2">No data rows yet</p>
                  <button
                    onClick={onAddRow}
                    className="text-primary hover:text-primary-dark font-medium inline-flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add your first row
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="mt-4 flex justify-start">
          <button
            onClick={onAddRow}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Row
          </button>
        </div>
      )}
    </div>
  );
};
