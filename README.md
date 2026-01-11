# Templify

Automate template document filling with ease.

## What is Templify?

Templify helps you create and fill multiple documents from a single template. Upload a Word document, define fillable fields by highlighting text, import data from spreadsheets, and generate multiple filled documents instantly.

## Features (Iteration 1)

- Upload .docx templates
- Visual field definition through text highlighting
- Spreadsheet-like data entry (with CSV/XLSX import)
- Generate multiple filled Word documents
- Preview and review before download

## Tech Stack

- React 18 + TypeScript
- Vite
- mammoth.js (docx parsing)
- docx (document generation)
- Browser localStorage (data persistence)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## How It Works

1. **Upload** a Word template document
2. **Highlight** text and define fillable fields
3. **Enter data** in spreadsheet view or import CSV/XLSX
4. **Generate** filled documents
5. **Review** and download

## Project Status

Currently in development - Iteration 1 (MVP with browser storage)

## License

MIT
