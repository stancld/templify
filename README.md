# Templify

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Templify is a shared `.docx` document automation workspace for a single customer team. Admins upload Word templates and define fields visually, while members fill spreadsheet-style data and generate document batches from the browser.

## Current Product State

- Authentication is required for every route.
- Access is role-based with two roles: `admin` and `member`.
- Templates, sessions, rows, and source `.docx` files are stored in Supabase.
- Document generation still happens client-side in the browser using the uploaded template and row data.
- The app includes a legacy local migration shim for older browser-stored data, but the active product is Supabase-backed.

## Features

- Upload `.docx` templates into a shared workspace
- Define fields by highlighting text in the rendered document
- Rename templates and data-entry sessions inline
- Enter data in a spreadsheet UI
- Import rows from CSV
- Generate one document per row
- Preview generated output before download
- Download a single `.docx` or a ZIP of the whole batch
- Restrict template editing to admins while allowing members to run data entry and generation

## Workflow

1. Admin signs in and uploads a Word template.
2. Admin opens `/editor/:templateId` and maps placeholders to named fields.
3. User opens `/data/:templateId`, fills rows manually or imports CSV, and saves into a session.
4. User opens `/review/:templateId` to generate, preview, and download the output documents.

## Tech Stack

| Area | Stack |
| --- | --- |
| Frontend | React 19, TypeScript, React Router 7 |
| Build | Vite 7 |
| Styling | Tailwind CSS |
| Auth + DB + Storage | Supabase Auth, Postgres, Storage |
| Document rendering | `docx-preview` |
| Document generation | `JSZip` + direct `word/document.xml` replacement |
| Deployment | Vercel |
| Observability | Vercel Analytics, Vercel Speed Insights |

## Local Development

### Prerequisites

- Node.js 18 or newer
- npm
- A Supabase project

### Environment variables

Create a `.env.local` or `.env` file with:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

`VITE_USE_SUPABASE` is still present in `.env.example`, but the current code path is already Supabase-first and does not use a separate local-storage runtime mode.

### Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Supabase Setup

### 1. Apply the schema

Use [supabase/migrations/20260306_000001_initial.sql](/Users/daniel.stancl/projects/templify/supabase/migrations/20260306_000001_initial.sql) to create:

- `user_roles`
- `templates`
- `data_sessions`
- `data_rows`
- the `templates-docx` storage bucket
- row-level security policies for shared read access and admin-only template management

### 2. Configure auth

- Disable public signup in Supabase Auth.
- Create users manually in the Supabase dashboard.
- Insert one row into `public.user_roles` per user with role `admin` or `member`.

### 3. Storage model

- Template metadata lives in Postgres.
- Uploaded `.docx` files live in the private `templates-docx` bucket.
- The code still supports loading legacy templates stored as base64 in `templates.original_docx`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run lint:fix
npm run preview
```

## Project Structure

```text
src/
  components/
    auth/
    data-entry/
    editor/
    review/
    templates/
    upload/
  contexts/
  hooks/
  lib/
  services/
  types/
supabase/
  migrations/
api/
```

Notable files:

- [src/App.tsx](/Users/daniel.stancl/projects/templify/src/App.tsx) defines the route structure and role-gated screens.
- [src/contexts/AuthContext.tsx](/Users/daniel.stancl/projects/templify/src/contexts/AuthContext.tsx) loads auth state and the app role from Supabase.
- [src/services/supabase-storage.ts](/Users/daniel.stancl/projects/templify/src/services/supabase-storage.ts) handles template persistence and `.docx` loading.
- [src/services/docx-generator.ts](/Users/daniel.stancl/projects/templify/src/services/docx-generator.ts) generates final documents and ZIP downloads in-browser.
- [api/og.mjs](/Users/daniel.stancl/projects/templify/api/og.mjs) provides the Vercel OG image endpoint.

## Deployment Notes

- [vercel.json](/Users/daniel.stancl/projects/templify/vercel.json) is configured for a Vite build with SPA rewrites plus `/api/*` serverless routes.
- The app mounts Vercel Analytics and Speed Insights in [src/main.tsx](/Users/daniel.stancl/projects/templify/src/main.tsx).
- Protected routes redirect unauthenticated users to `/login`.

## Known Gaps

- There is no automated test suite in the current repository state.
- Some non-README collateral still reflects the older local-only product positioning and should be updated separately.
- Document generation currently performs string replacement on `word/document.xml`, so placeholder handling depends on the original `.docx` text structure.

## License

MIT
