
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  isCloud?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isCloud }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 py-3 sm:py-4">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-slate-900 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-slate-200 shrink-0">
              <i className="fas fa-cubes text-white text-base sm:text-lg"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-black tracking-tighter text-slate-900 leading-none">
                DASE NEWS <span className="text-dase-blue uppercase text-[10px] sm:text-sm tracking-widest ml-1">Architect</span>
              </h1>
              {isCloud && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Firebase Sync</span>
                </div>
              )}
            </div>
          </div>
          <nav className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
            <a 
              href="https://www.dase-analytics.com/" 
              target="_blank" 
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-dase-blue transition-colors"
            >
              Website
            </a>
            <div className="h-4 w-px bg-slate-100"></div>
            <div className="bg-dase-blue/5 text-dase-blue px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
              v2.6 Stable
            </div>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 sm:px-8 py-6 sm:py-12">
        {children}
      </main>
      
      <footer className="bg-white border-t border-slate-100 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
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
