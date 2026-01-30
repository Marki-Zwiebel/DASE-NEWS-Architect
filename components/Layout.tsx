
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  isCloud?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isCloud }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 py-4">
        <div className="container mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-2.5 rounded-xl shadow-lg shadow-slate-200">
              <i className="fas fa-layer-group text-white text-lg"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">
                DASE NEWS <span className="text-dase-blue uppercase text-sm tracking-widest ml-1">Architect</span>
              </h1>
              {isCloud && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Firebase Live</span>
                </div>
              )}
            </div>
          </div>
          <nav className="flex items-center gap-8">
            <a 
              href="https://www.dase-analytics.com/" 
              target="_blank" 
              className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-dase-blue transition-colors"
            >
              DASE Website
            </a>
            <div className="hidden md:block h-4 w-px bg-slate-100"></div>
            <div className="bg-dase-blue/5 text-dase-blue px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              v2.5 Adaptive
            </div>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-8 py-12">
        {children}
      </main>
      
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} DASE Analytics. Powered by Gemini 3 Pro.
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-dase-blue transition-colors cursor-pointer">
              <i className="fab fa-linkedin-in"></i>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-dase-blue transition-colors cursor-pointer">
              <i className="fab fa-github"></i>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
