
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * ULTRA-ROBUST ENV SHIM
 * Tento kód musí bežať ako prvý. Prepojí prostredie Vite/Vercel (import.meta.env)
 * s globálnym objektom process.env, ktorý vyžaduje Gemini SDK.
 */
const initEnvironment = () => {
  // Inicializácia globálneho process objektu ak neexistuje
  if (typeof window !== 'undefined') {
    const g = window as any;
    g.process = g.process || { env: {} };
    
    // Získanie kľúča z Vite prostredia (VITE_ prefix je povinný pre browser)
    const viteKey = (import.meta as any).env?.VITE_GOOGLE_API_KEY;
    // Záložný pokus ak by bol kľúč dostupný inak
    const rawKey = (import.meta as any).env?.GOOGLE_API_KEY;
    
    const finalKey = viteKey || rawKey || "";
    
    g.process.env = {
      ...g.process.env,
      API_KEY: finalKey
    };

    if (finalKey) {
      console.log("🚀 DASE Environment: API Key successfully linked.");
    } else {
      console.warn("⚠️ DASE Environment: No API Key found in import.meta.env. Check Vercel settings for VITE_GOOGLE_API_KEY.");
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
