
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * BRIDGE: Prepojenie Build-time premenných na Runtime objekt process.env
 * Toto je kritické pre fungovanie @google/genai na Verceli.
 */
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: {} };
  
  // Vite (ktorý používa Vercel pod kapotou) vyžaduje prefix VITE_
  const metaEnv = (import.meta as any).env || {};
  
  const apiKey = metaEnv.VITE_GOOGLE_API_KEY || metaEnv.GOOGLE_API_KEY || "";
  
  (window as any).process.env = {
    ...((window as any).process.env || {}),
    API_KEY: apiKey
  };
  
  console.log("DASE Architect: API Key check:", apiKey ? "OK (Hidden)" : "MISSING");
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
