import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {MotionConfig} from 'motion/react';
import App from './App.tsx';
import {ErrorBoundary} from './components/ui/ErrorBoundary.tsx';
import './index.css';

// Dynamic Loading Title Update
const pathParts = window.location.pathname.split('/');
const slug = pathParts[pathParts.length - 1];
if (slug) {
  const name = slug.replace(/-/g, ' & ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  const titleEl = document.getElementById('loading-title');
  if (titleEl) titleEl.innerText = name;
}

createRoot(document.getElementById('root')!).render(
  <MotionConfig reducedMotion="user">
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </MotionConfig>
);
