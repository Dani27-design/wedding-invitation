import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoadingScreen } from './components/ui/LoadingScreen';

const Wedding = lazy(() => import('./pages/Wedding'));
const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/admin/:slug" element={<Admin />} />
          <Route path="/:slug" element={<Wedding />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
