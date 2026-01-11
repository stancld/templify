import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const TemplateEditor = lazy(() => import('./components/editor/TemplateEditor').then(m => ({ default: m.TemplateEditor })));
const DataEntryScreen = lazy(() => import('./components/data-entry/DataEntryScreen').then(m => ({ default: m.DataEntryScreen })));
const ReviewScreen = lazy(() => import('./components/review/ReviewScreen').then(m => ({ default: m.ReviewScreen })));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/editor/:templateId" element={<TemplateEditor />} />
          <Route path="/data/:templateId" element={<DataEntryScreen />} />
          <Route path="/review/:templateId" element={<ReviewScreen />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
