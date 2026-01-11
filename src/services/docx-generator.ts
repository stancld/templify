import JSZip from 'jszip';
import { Template, DataRow, GeneratedDocument, Field } from '../types';
import { generateId } from '../utils/id';

export async function generateDocument(
  template: Template,
  dataRow: DataRow
): Promise<GeneratedDocument> {
  const zip = await JSZip.loadAsync(template.originalDocx);
  const documentXml = await zip.file('word/document.xml')?.async('string');

  if (!documentXml) {
    throw new Error('Invalid .docx file: missing document.xml');
  }

  let modifiedXml = documentXml;
  for (const field of template.schema) {
    const value = dataRow.values[field.id] || '';
    modifiedXml = replaceFieldInXml(modifiedXml, field, escapeXml(value));
  }

  zip.file('word/document.xml', modifiedXml);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return {
    id: generateId('doc'),
    templateId: template.id,
    dataRowId: dataRow.id,
    docxBlob: blob,
    createdAt: new Date(),
  };
}

export async function generateAllDocuments(
  template: Template,
  dataRows: DataRow[],
  onProgress?: (current: number, total: number) => void
): Promise<GeneratedDocument[]> {
  const documents: GeneratedDocument[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const doc = await generateDocument(template, dataRows[i]);
    documents.push(doc);
    onProgress?.(i + 1, dataRows.length);
  }

  return documents;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function replaceFieldInXml(xml: string, field: Field, value: string): string {
  const placeholder = field.placeholder;
  return xml.split(placeholder).join(value);
}

export function downloadDocument(doc: GeneratedDocument, filename: string): void {
  const url = URL.createObjectURL(doc.docxBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadAllAsZip(
  documents: GeneratedDocument[],
  template: Template,
  dataRows: DataRow[]
): Promise<void> {
  const zip = new JSZip();

  documents.forEach((doc, index) => {
    const row = dataRows.find((r) => r.id === doc.dataRowId);
    const firstFieldValue = row?.values[template.schema[0]?.id] || `document_${index + 1}`;
    const safeFilename = firstFieldValue.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
    zip.file(`${safeFilename}.docx`, doc.docxBlob);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name}_documents.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
