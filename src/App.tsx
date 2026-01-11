import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { TemplateEditor } from './components/editor/TemplateEditor';
import { DataEntryScreen } from './components/data-entry/DataEntryScreen';
import { ReviewScreen } from './components/review/ReviewScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor/:templateId" element={<TemplateEditor />} />
        <Route path="/data/:templateId" element={<DataEntryScreen />} />
        <Route path="/review/:templateId" element={<ReviewScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
