import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { TemplateEditor } from './components/editor/TemplateEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor/:templateId" element={<TemplateEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
