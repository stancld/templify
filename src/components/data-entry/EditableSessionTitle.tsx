import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';

interface EditableSessionTitleProps {
  title: string;
  onSave: (newTitle: string) => void;
}

export const EditableSessionTitle: React.FC<EditableSessionTitleProps> = ({
  title,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  const handleStartEdit = () => {
    setEditValue(title);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onSave(trimmed);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="text-2xl font-bold text-neutral-dark bg-transparent border-b-2 border-primary-blue focus:outline-none px-0 py-0"
        style={{ width: `${Math.max(editValue.length, 10)}ch` }}
      />
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      className="group flex items-center gap-2 hover:bg-neutral-light/50 rounded px-1 -mx-1 transition-colors cursor-pointer"
    >
      <h1 className="text-2xl font-bold text-neutral-dark">
        {title || 'Untitled Session'}
      </h1>
      <Pencil
        size={16}
        className="text-neutral-gray group-hover:opacity-100 opacity-50 transition-opacity"
      />
    </button>
  );
};
