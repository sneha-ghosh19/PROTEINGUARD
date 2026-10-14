import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { MutationLab } from './pages/MutationLab';
import { AnalysisDashboard } from './pages/AnalysisDashboard';
import { StructureExplorer } from './pages/StructureExplorer';
import { MutationReport } from './pages/MutationReport';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mutation-lab" element={<MutationLab />} />
        <Route path="/analysis/:analysisId" element={<AnalysisDashboard />} />
        <Route path="/analysis" element={<AnalysisDashboard />} />
        <Route path="/structure" element={<StructureExplorer />} />
        <Route path="/report/:analysisId" element={<MutationReport />} />
        <Route path="/report" element={<MutationReport />} />
        {/* Catch-all fallback route */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
