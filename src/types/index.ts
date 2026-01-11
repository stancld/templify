export interface Template {
  id: string;
  name: string;
  originalDocx: Blob;
  htmlContent: string;
  schema: Field[];
  createdAt: Date;
}

export interface Field {
  id: string;
  name: string;
  placeholder: string;
  type: 'text' | 'number' | 'date';
  startPosition: number;
  endPosition: number;
}

export interface DataRow {
  id: string;
  templateId: string;
  values: Record<string, string>;
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  dataRowId: string;
  docxBlob: Blob;
  createdAt: Date;
}
