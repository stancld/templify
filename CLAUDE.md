# Templify - Template Document Automation

## Project Overview

Templify is a web application that automates filling template documents. Users upload a Word document, define fillable fields by highlighting text, and generate multiple filled documents using spreadsheet-like data entry.

## Current Status: Iteration 1 Complete ✅

All MVP features are implemented and working:
- Upload .docx templates
- Visual field definition via text highlighting
- Spreadsheet-like data entry with CSV import
- Document generation (JSZip-based XML replacement)
- Preview and bulk download

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Document Processing**: JSZip (docx manipulation), docx-preview (rendering)
- **Storage**: Browser localStorage
- **Styling**: TailwindCSS
- **Routing**: React Router v7
- **Icons**: Lucide React

## Commands

```bash
npm run dev      # Start development server
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint (zero warnings allowed)
npm run lint:fix # Auto-fix lint issues
npm run preview  # Preview production build
```

## Architecture

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | LandingPage | Upload zone + templates list |
| `/editor/:templateId` | TemplateEditor | Document viewer + field definition |
| `/data/:templateId` | DataEntryScreen | Spreadsheet grid + CSV import |
| `/review/:templateId` | ReviewScreen | Preview generated docs + download |

### Data Models

```typescript
interface Template {
  id: string;
  name: string;
  originalDocx: Blob;
  htmlContent: string;
  schema: Field[];
  createdAt: Date;
}

interface Field {
  id: string;
  name: string;
  placeholder: string;  // Text to replace in docx
  type: 'text' | 'number' | 'date';
  startPosition: number;
  endPosition: number;
}

interface DataRow {
  id: string;
  templateId: string;
  values: Record<string, string>;  // fieldId -> value
}
```

### Key Services

- `services/storage.ts` - localStorage with base64 blob serialization
- `services/docx-generator.ts` - JSZip-based placeholder replacement
- `services/docx-preview.ts` - Document rendering for preview

## Next Iterations

### Iteration 2: Backend & Persistence
- [ ] Add backend API (Node.js/Express or serverless)
- [ ] PostgreSQL/MongoDB for data persistence
- [ ] User authentication (OAuth or email/password)
- [ ] Cloud storage for templates (S3, Cloudflare R2)
- [ ] Migrate from localStorage to API calls

### Iteration 3: Enhanced UX
- [ ] Code-splitting to reduce bundle size (currently 520KB)
- [ ] Undo/redo for field definitions
- [ ] Field reordering via drag-and-drop
- [ ] Template duplication
- [ ] Better error messages and validation
- [ ] Keyboard shortcuts

### Iteration 4: Advanced Features
- [ ] Conditional fields (if/then logic)
- [ ] Rich field types (dropdowns, checkboxes, images)
- [ ] Template versioning
- [ ] PDF export support
- [ ] Collaboration features

### Iteration 5: Deployment
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Vercel Functions, Railway, or Render
- **Database**: Supabase, PlanetScale, or Neon
- CI/CD pipeline with GitHub Actions

## Development Guidelines

1. **TypeScript First**: All components and functions should be fully typed
2. **Component Structure**: Keep components small and focused
3. **Error Handling**: Graceful error handling for file parsing and generation
4. **No Debug Logs**: Remove console.logs before committing (keep console.error for actual errors)
5. **ESLint**: Zero warnings policy enforced

## Known Issues

- Bundle size warning (>500KB) - consider code-splitting docx-preview
- localStorage has 5MB limit - works for ~10 small templates
