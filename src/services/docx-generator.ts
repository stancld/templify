import JSZip from 'jszip';
import { Template, DataRow, GeneratedDocument, Field } from '../types';

export async function generateDocument(
  template: Template,
  dataRow: DataRow
): Promise<GeneratedDocument> {
  console.log('[docx-generator] Starting document generation');
  console.log('[docx-generator] Template:', template.id, template.name);
  console.log('[docx-generator] Template schema:', template.schema);
  console.log('[docx-generator] DataRow:', dataRow);
  console.log('[docx-generator] Original docx blob size:', template.originalDocx?.size);

  try {
    const zip = await JSZip.loadAsync(template.originalDocx);
    console.log('[docx-generator] Loaded zip, files:', Object.keys(zip.files));

    const documentXml = await zip.file('word/document.xml')?.async('string');

    if (!documentXml) {
      throw new Error('Invalid .docx file: missing document.xml');
    }

    console.log('[docx-generator] Document XML length:', documentXml.length);

    let modifiedXml = documentXml;

    for (const field of template.schema) {
      const value = dataRow.values[field.id] || '';
      const escapedValue = escapeXml(value);
      console.log(`[docx-generator] Replacing field "${field.name}" placeholder "${field.placeholder}" with "${value}"`);
      const beforeLength = modifiedXml.length;
      modifiedXml = replaceFieldInXml(modifiedXml, field, escapedValue);
      const afterLength = modifiedXml.length;
      console.log(`[docx-generator] XML length changed: ${beforeLength} -> ${afterLength}`);
    }

    zip.file('word/document.xml', modifiedXml);

    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    console.log('[docx-generator] Generated blob size:', blob.size);

    return {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      dataRowId: dataRow.id,
      docxBlob: blob,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[docx-generator] Error generating document:', error);
    throw error;
  }
}

export async function generateAllDocuments(
  template: Template,
  dataRows: DataRow[],
  onProgress?: (current: number, total: number) => void
): Promise<GeneratedDocument[]> {
  console.log('[docx-generator] generateAllDocuments called');
  console.log('[docx-generator] Template:', template);
  console.log('[docx-generator] DataRows count:', dataRows.length);

  const documents: GeneratedDocument[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    console.log(`[docx-generator] Generating document ${i + 1} of ${dataRows.length}`);
    const doc = await generateDocument(template, dataRows[i]);
    documents.push(doc);
    onProgress?.(i + 1, dataRows.length);
  }

  console.log('[docx-generator] All documents generated:', documents.length);
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
