import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';

interface UploadZoneProps {
  onFileUpload: (file: File) => void | Promise<void>;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      void onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-300 hover:border-primary hover:bg-primary/5
        ${isDragActive ? 'border-primary bg-primary/10 scale-105' : 'border-neutral-gray/30'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className={`
          p-6 rounded-full transition-all duration-300
          ${isDragActive ? 'bg-primary text-white' : 'bg-gradient-primary text-white'}
        `}>
          {isDragActive ? (
            <FileText size={40} />
          ) : (
            <Upload size={40} />
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-neutral-dark mb-2">
            {isDragActive ? 'Drop your document here' : 'Upload your template document'}
          </h3>
          <p className="text-neutral-gray">
            Drag & drop a .docx file here, or click to browse
          </p>
        </div>

        <button className="btn-primary mt-4">
          Choose File
        </button>
      </div>
    </div>
  );
};
