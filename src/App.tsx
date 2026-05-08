import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Wedding = lazy(() => import('./pages/Wedding'));
const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-ivory" />}>
        <Routes>
          <Route path="/admin/:slug" element={<Admin />} />
          <Route path="/:slug" element={<Wedding />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
