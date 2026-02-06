
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * ULTRA-ROBUST ENV SHIM
 * Tento kód musí bežať ako prvý. Prepojí prostredie Vite/Vercel (import.meta.env)
 * s globálnym objektom process.env, ktorý vyžaduje Gemini SDK.
 */
const initEnvironment = () => {
  if (typeof window !== 'undefined') {
    // 1. Pripravíme globálny objekt process
    (window as any).process = (window as any).process || { env: {} };
    
    // 2. Skúsime vytiahnuť kľúč z import.meta.env (Vite standard)
    const viteEnv = (import.meta as any).env || {};
    const apiKey = viteEnv.VITE_GOOGLE_API_KEY || viteEnv.GOOGLE_API_KEY || "";
    
    // 3. Natlačíme ho do globálneho process.env
    (window as any).process.env.API_KEY = apiKey;
    
    if (apiKey) {
      console.log("🚀 DASE Environment: API Key found and linked to process.env.API_KEY (Runtime). Length:", apiKey.length);
    } else {
      console.warn("⚠️ DASE Environment: No API Key found in import.meta.env. Verify VITE_GOOGLE_API_KEY in Vercel.");
    }
  }
};

initEnvironment();

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
