
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * BRIDGE: Prepojenie Build-time premenných na Runtime objekt process.env
 * Toto je nevyhnutné, aby @google/genai SDK našlo kľúč v 'process.env.API_KEY'.
 */
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: {} };
  
  // Priradíme hodnotu z import.meta.env (ktorú injektuje Vercel počas buildu)
  // do objektu, ktorý očakáva SDK.
  const metaEnv = (import.meta as any).env;
  if (metaEnv) {
    (window as any).process.env.API_KEY = metaEnv.VITE_GOOGLE_API_KEY || metaEnv.GOOGLE_API_KEY;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
