import React, { useEffect, useRef } from 'react';
import { renderDocxPreview } from '../../services/docx-preview';

interface DocumentPreviewProps {
  docxBlob: Blob;
  className?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ docxBlob, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderPreview = async () => {
      if (!containerRef.current) {
        return;
      }

      containerRef.current.innerHTML = '';

      try {
        await renderDocxPreview(docxBlob, containerRef.current, undefined, {
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
        });
      } catch (error) {
        console.error('Error rendering document preview:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<p class="text-red-500 p-4">Failed to render document preview</p>';
        }
      }
    };

    void renderPreview();
  }, [docxBlob]);

  return (
    <div
      ref={containerRef}
      className={`document-preview-container bg-neutral-200 overflow-auto ${className}`}
    />
  );
};
