import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { Field } from '../../types';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Record<string, string>[]) => number;
  fields: Field[];
}

const parseCSV = (text: string): Record<string, string>[] => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.replace(/^["']|["']$/g, '') || '';
      });
      rows.push(row);
    }
  }

  return rows;
};

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  fields,
}) => {
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);

  const handleFileDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setImportSuccess(null);

    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    setFileName(file.name);

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        setError('No valid data found in the file. Ensure it has headers and at least one data row.');
        setParsedData([]);
        return;
      }

      setParsedData(data);
    } catch {
      setError('Failed to parse file. Please ensure it is a valid CSV file.');
      setParsedData([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => void handleFileDrop(files),
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleImport = () => {
    if (parsedData.length === 0) {
      return;
    }

    const count = onImport(parsedData);
    setImportSuccess(count);
    setParsedData([]);
    setFileName('');

    setTimeout(() => {
      onClose();
      setImportSuccess(null);
    }, 1500);
  };

  const handleClose = () => {
    setParsedData([]);
    setFileName('');
    setError(null);
    setImportSuccess(null);
    onClose();
  };

  const matchedColumns = parsedData.length > 0
    ? fields.filter((field) =>
        Object.keys(parsedData[0]).some(
          (key) => key.toLowerCase().trim() === field.name.toLowerCase().trim()
        )
      )
    : [];

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-gray/20">
          <h2 className="text-xl font-bold text-neutral-dark">Import Data</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-light rounded-lg transition-colors"
          >
            <X size={20} className="text-neutral-gray" />
          </button>
        </div>

        <div className="p-6">
          {importSuccess !== null ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-accent-green" />
              </div>
              <p className="text-lg font-medium text-neutral-dark">
                Successfully imported {importSuccess} rows!
              </p>
            </div>
          ) : (
            <>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                  transition-all duration-200 mb-4
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-neutral-gray/30 hover:border-primary'}
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    {fileName ? <FileSpreadsheet size={28} /> : <Upload size={28} />}
                  </div>
                  {fileName ? (
                    <p className="text-sm text-neutral-dark font-medium">{fileName}</p>
                  ) : (
                    <>
                      <p className="text-neutral-dark font-medium">
                        Drop your CSV file here, or click to browse
                      </p>
                      <p className="text-sm text-neutral-gray">
                        Supports .csv files
                      </p>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {parsedData.length > 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-light rounded-lg">
                    <p className="text-sm font-medium text-neutral-dark mb-2">
                      Preview: {parsedData.length} row{parsedData.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="text-sm text-neutral-gray">
                      <p className="mb-2">Column matching:</p>
                      <div className="flex flex-wrap gap-2">
                        {fields.map((field) => {
                          const isMatched = matchedColumns.some((m) => m.id === field.id);
                          return (
                            <span
                              key={field.id}
                              className={`px-2 py-1 rounded-full text-xs ${
                                isMatched
                                  ? 'bg-accent-green/20 text-green-700'
                                  : 'bg-neutral-gray/20 text-neutral-gray'
                              }`}
                            >
                              {field.name} {isMatched ? '✓' : '—'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-48 border border-neutral-gray/20 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-light sticky top-0">
                        <tr>
                          {Object.keys(parsedData[0]).map((key) => (
                            <th
                              key={key}
                              className="px-3 py-2 text-left font-medium text-neutral-dark border-b border-neutral-gray/20"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 3).map((row, i) => (
                          <tr key={i} className="hover:bg-neutral-light/50">
                            {Object.values(row).map((value, j) => (
                              <td
                                key={j}
                                className="px-3 py-2 border-b border-neutral-gray/20 truncate max-w-[150px]"
                              >
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 3 && (
                      <div className="px-3 py-2 text-sm text-neutral-gray text-center bg-neutral-light/50">
                        ... and {parsedData.length - 3} more rows
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {importSuccess === null && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-gray/20 bg-neutral-light/30">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-neutral-gray hover:text-neutral-dark transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={parsedData.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Import {parsedData.length > 0 ? `${parsedData.length} Rows` : 'Data'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
