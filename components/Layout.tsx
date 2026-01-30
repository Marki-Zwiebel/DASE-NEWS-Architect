
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-dase-blue p-2 rounded-lg shadow-sm">
              <i className="fas fa-chart-bar text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-dase-dark">DASE <span className="text-dase-blue italic">Architect</span></h1>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[14px] font-bold">
            <a 
              href="https://www.dase-analytics.com/blog/sk/category/novinky/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-dase-accent hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              Analytics News <i className="fas fa-external-link-alt text-[10px]"></i>
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-6 py-10">
        {children}
      </main>
      <footer className="bg-white text-gray-400 py-12 border-t border-gray-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-semibold">
          <div>&copy; {new Date().getFullYear()} DASE Analytics.</div>
          <div className="flex gap-6">
             <span className="text-dase-accent">#analyticsNews</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
