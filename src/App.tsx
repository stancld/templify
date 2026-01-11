import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { TemplateEditor } from './components/editor/TemplateEditor';
import { DataEntryScreen } from './components/data-entry/DataEntryScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor/:templateId" element={<TemplateEditor />} />
        <Route path="/data/:templateId" element={<DataEntryScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
