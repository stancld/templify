# Templify

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Fill Word templates in bulk. No account needed.**

Upload a Word document, highlight fields, fill in a spreadsheet, download filled documents. Simple as that.

## ✨ Features

- 📤 **Upload Templates** – Works with any .docx Word document
- 🎯 **Visual Field Definition** – Just highlight text to create fields
- 📊 **Spreadsheet Data Entry** – Fill data in a familiar grid
- 📁 **CSV Import** – Already have data? Import it
- ⚡ **Batch Generation** – Generate 1 or 100 documents at once
- 🔒 **Privacy First** – Everything stays in your browser, nothing uploaded

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/stancld/templify.git
cd templify
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 How It Works

1. **Upload** a Word template document (.docx)
2. **Highlight** placeholder text and name your fields
3. **Enter data** in the spreadsheet view (or import CSV)
4. **Generate** filled documents
5. **Review** and download individually or as ZIP

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19, TypeScript 5.9 |
| Build | Vite 7 |
| Styling | TailwindCSS |
| Routing | React Router v7 |
| Document Processing | JSZip, docx-preview |
| Storage | Browser localStorage |

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## 🗺️ Roadmap

- [x] **Iteration 1**: MVP with browser storage ✅
- [ ] **Iteration 2**: Backend API & user authentication
- [ ] **Iteration 3**: Enhanced UX (undo/redo, drag-and-drop)
- [ ] **Iteration 4**: Advanced features (conditional fields, PDF export)
- [ ] **Iteration 5**: Production deployment

## 📄 License

MIT © [stancld](https://github.com/stancld)
