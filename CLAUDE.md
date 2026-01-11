# Templify - Template Document Automation

## Project Overview

Templify is a web application that automates the process of filling template documents. Users upload a Word document, define fillable fields by highlighting text, and then generate multiple filled documents using spreadsheet-like data entry.

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Document Processing**:
  - `mammoth.js` - Parse and convert .docx to HTML for viewing
  - `docx` - Generate filled .docx files programmatically
- **Storage**: Browser localStorage/IndexedDB (Iteration 1)
- **Styling**: TailwindCSS (or CSS Modules)
- **State Management**: React Context API or Zustand

## Architecture

### Core Workflow

1. **Upload**: User uploads a .docx template document
2. **Define Schema**: User highlights text in the document viewer and names fields (e.g., "Customer Name", "Invoice Date")
3. **Data Entry**: Spreadsheet-like interface to enter values for multiple templates (supports CSV/XLSX import and manual entry)
4. **Generate**: App fills the template with data and generates downloadable .docx files
5. **Review**: One-by-one document preview before download

### Data Models

```typescript
interface Template {
  id: string;
  name: string;
  originalDocx: Blob;
  htmlContent: string; // Converted from docx via mammoth
  schema: Field[];
  createdAt: Date;
}

interface Field {
  id: string;
  name: string; // e.g., "Customer Name"
  placeholder: string; // The highlighted text in original doc
  type: 'text' | 'number' | 'date';
  startPosition: number; // Character position in document
  endPosition: number;
}

interface DataRow {
  id: string;
  templateId: string;
  values: Record<string, string>; // fieldId -> value
}

interface GeneratedDocument {
  id: string;
  templateId: string;
  dataRowId: string;
  docxBlob: Blob;
  createdAt: Date;
}
```

## First Iteration Scope

### Features to Build

1. **Landing Page**
   - Upload .docx file
   - Display uploaded templates list
   - Create new template button

2. **Template Editor**
   - Display document content (converted from .docx to HTML via mammoth.js)
   - Text selection/highlighting functionality
   - Modal/popup to name highlighted field
   - Visual indicators for defined fields
   - Save schema to localStorage

3. **Data Entry Screen**
   - Spreadsheet-like grid (using react-data-grid or similar)
   - Column headers = field names from schema
   - Add/edit/delete rows
   - Import from CSV/XLSX
   - Manual entry support

4. **Document Generation**
   - Fill template using docx library
   - Replace placeholders with actual values
   - Generate .docx blob

5. **Review Screen**
   - Preview generated documents one by one
   - Navigation (next/previous)
   - Download individual or bulk download

### File Structure

```
templify/
├── src/
│   ├── components/
│   │   ├── upload/
│   │   │   └── UploadZone.tsx
│   │   ├── editor/
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── FieldHighlighter.tsx
│   │   │   └── FieldDefinitionModal.tsx
│   │   ├── data-entry/
│   │   │   ├── SpreadsheetGrid.tsx
│   │   │   └── ImportDialog.tsx
│   │   └── review/
│   │       ├── DocumentPreview.tsx
│   │       └── DocumentNavigator.tsx
│   ├── services/
│   │   ├── docx-parser.ts      # mammoth.js wrapper
│   │   ├── docx-generator.ts   # docx library wrapper
│   │   └── storage.ts          # localStorage/IndexedDB helpers
│   ├── hooks/
│   │   ├── useTemplates.ts
│   │   ├── useDataRows.ts
│   │   └── useDocumentGenerator.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
├── CLAUDE.md
└── README.md
```

## Key Technical Challenges

### 1. Document Parsing
- Use `mammoth.js` to convert .docx to HTML for display
- Maintain text position mapping for field highlighting
- Handle complex Word formatting

### 2. Text Selection & Highlighting
- Implement text selection in React
- Track selection ranges
- Apply visual highlights with CSS
- Store position data for later replacement

### 3. Document Generation
- Use `docx` library to programmatically create Word documents
- Replace field placeholders with actual values
- Preserve original formatting

### 4. Storage
- Store templates, schemas, and data in localStorage (< 5MB limit)
- Consider IndexedDB for larger files
- Plan migration path to backend DB for future iterations

## Future Iterations

### Iteration 2: Backend & User Accounts
- Add backend API (Node.js + Express or Next.js API routes)
- Database (PostgreSQL/MongoDB)
- User authentication
- Cloud storage for templates

### Iteration 3: Advanced Features
- Conditional fields (if/then logic)
- Rich field types (dropdowns, checkboxes)
- Template versioning
- Collaboration features
- PDF support

### Iteration 4: Deployment
- Free hosting options:
  - **Frontend**: Vercel, Netlify, GitHub Pages
  - **Backend**: Vercel, Railway, Render free tier
  - **Database**: Supabase, PlanetScale free tier, MongoDB Atlas
- CI/CD pipeline

## Development Guidelines

1. **TypeScript First**: All components and functions should be fully typed
2. **Component Structure**: Keep components small and focused
3. **Error Handling**: Graceful error handling for file parsing and generation
4. **Performance**: Lazy load document viewer, virtualize spreadsheet for large datasets
5. **User Feedback**: Loading states, progress indicators, success/error messages

## Questions Answered

**Is TypeScript a good stack for this?**
Yes! TypeScript is excellent for this project:
- Type safety for complex data models (templates, fields, documents)
- Great IDE support and autocomplete
- Catches bugs at compile time
- Large ecosystem of typed libraries
- Perfect for learning modern web development

**Can I serve it freely with a tiny DB?**
Yes! For iteration 1, use browser storage (free, no backend needed). Later:
- **Hosting**: Vercel/Netlify (free tier with custom domain)
- **Database**: Supabase (500MB free), PlanetScale (5GB free), or MongoDB Atlas (512MB free)
- **Total cost**: $0 for small usage
