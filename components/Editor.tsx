
import React, { useState } from 'react';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onLearn: () => void;
  isLearning: boolean;
}

const Editor: React.FC<EditorProps> = ({ 
  value, onChange, onSave, isSaving, onLearn, isLearning 
}) => {
  const [isPreview, setIsPreview] = useState(false);

  const copyAsHTML = () => {
    const html = value
      .split('\n')
      .map(line => {
        if (line.startsWith('# ')) return `<h1>${line.replace('# ', '')}</h1>`;
        if (line.startsWith('## ')) return `<h2>${line.replace('## ', '')}</h2>`;
        if (line.startsWith('### ')) return `<h3>${line.replace('### ', '')}</h3>`;
        if (line.startsWith('- ')) return `<li>${line.replace('- ', '')}</li>`;
        if (line.startsWith('Viac na:')) return `<p><strong>${line}</strong></p>`;
        if (line.trim() === '') return `<br/>`;
        return `<p>${line}</p>`;
      })
      .join('\n');
    
    const wrappedHtml = `<div>${html}</div>`;
    const type = "text/html";
    const blob = new Blob([wrappedHtml], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    
    navigator.clipboard.write(data).then(() => {
      alert("Nafomátované HTML bolo skopírované!");
    }).catch(err => {
      navigator.clipboard.writeText(wrappedHtml);
      alert("HTML kód bol skopírovaný.");
    });
  };

  return (
    <div className="flex flex-col min-h-[500px] lg:h-full bg-white rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
          <button 
            onClick={() => setIsPreview(false)}
            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${!isPreview ? 'bg-white shadow-sm text-dase-accent' : 'text-gray-500 hover:text-gray-700'}`}
          >
            EDITOR
          </button>
          <button 
            onClick={() => setIsPreview(true)}
            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${isPreview ? 'bg-white shadow-sm text-dase-accent' : 'text-gray-500 hover:text-gray-700'}`}
          >
            NÁHĽAD
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar justify-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
              alert("Markdown bol skopírovaný.");
            }}
            className="shrink-0 px-3 py-2 text-gray-400 hover:text-dase-blue transition-colors text-[10px] sm:text-xs font-bold uppercase flex items-center gap-1"
          >
            <i className="fas fa-copy"></i> MD
          </button>

          <button
            onClick={copyAsHTML}
            className="shrink-0 px-3 sm:px-4 py-2 bg-dase-blue hover:opacity-90 text-white transition-all text-[10px] sm:text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm"
          >
            <i className="fas fa-code"></i> HTML
          </button>

          <div className="shrink-0 h-6 w-[1px] bg-gray-100 mx-1 hidden sm:block"></div>

          <button
            onClick={onLearn}
            disabled={isLearning || !value}
            className="shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2 bg-dase-accent hover:opacity-90 text-white rounded-xl text-[10px] sm:text-xs font-bold transition-all disabled:opacity-30 shadow-sm"
            title="Vylepšiť model na základe vašich úprav v texte"
          >
            {isLearning ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-brain"></i>}
            <span className="hidden xs:inline">VYLEPŠIŤ ŠTÝL</span>
            <span className="xs:hidden">VYLEPŠIŤ</span>
          </button>
        </div>
      </div>
      
      <div className="flex-grow bg-[#FDFDFD]">
        {!isPreview ? (
          <textarea
            className="w-full min-h-[400px] lg:h-[650px] p-4 sm:p-8 focus:outline-none font-mono text-[13px] sm:text-sm leading-relaxed text-gray-700 bg-transparent border-none placeholder-gray-300 resize-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Obsah news sa objaví tu..."
          />
        ) : (
          <div className="w-full min-h-[400px] lg:h-[650px] p-6 sm:p-12 overflow-y-auto preview-content custom-scrollbar">
            {value ? (
              <div className="max-w-3xl mx-auto">
                <div className="preview-metadata">
                  <span>Novinky</span>
                  <span className="hidden sm:inline">|</span>
                  <span>DASE Team</span>
                  <span className="hidden sm:inline">|</span>
                  <span>{new Date().toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                {value.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h1 key={i}>{line.replace('# ', '')}</h1>;
                  if (line.startsWith('## ') || line.startsWith('### ')) return <h2 key={i}>{line.replace(/#+\s/, '')}</h2>;
                  if (line.startsWith('Viac na:')) return <p key={i} className="mb-5 text-dase-accent font-bold italic">{line}</p>;
                  if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc mb-3 text-gray-600 leading-relaxed font-medium">{line.replace('- ', '')}</li>;
                  if (line.trim() === '') return <div key={i} className="h-6" />;
                  return <p key={i} className="mb-5 text-gray-600 leading-relaxed text-[16px] font-medium">{line}</p>;
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 min-h-[300px]">
                <i className="fas fa-newspaper text-5xl sm:text-6xl mb-4"></i>
                <p className="font-bold uppercase tracking-widest text-[10px] sm:text-xs">Zatiaľ prázdne</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
