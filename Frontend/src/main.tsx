import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './ErrorBoundary';

// Suppress Recharts dynamic container sizing warnings in console
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('should be greater than 0')) {
    return;
  }
  originalWarn(...args);
};

// Suppress known Firebase internal assertion errors that don't affect functionality
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('INTERNAL ASSERTION FAILED: Pending promise was never set')) {
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('INTERNAL ASSERTION FAILED: Pending promise was never set')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
