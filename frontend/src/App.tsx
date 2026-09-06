import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScreeningFlowProvider } from './hooks/useScreeningFlow';
import { ToastProvider } from './components/Toast';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import PatientDetails from './pages/PatientDetails';
import ImageUpload from './pages/ImageUpload';
import Analyzing from './pages/Analyzing';
import Result from './pages/Result';
import Explanation from './pages/Explanation';
import HistoryPage from './pages/HistoryPage';
import Report from './pages/Report';
import Learn from './pages/Learn';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ToastProvider>
      <ScreeningFlowProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/screening/patient" element={<PatientDetails />} />
            <Route path="/screening/upload" element={<ImageUpload />} />
            <Route path="/screening/analyzing" element={<Analyzing />} />
            <Route path="/screening/result" element={<Result />} />
            <Route path="/screening/explanation" element={<Explanation />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/report/:id" element={<Report />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ScreeningFlowProvider>
    </ToastProvider>
  );
}
