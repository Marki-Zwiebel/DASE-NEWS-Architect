
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
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button 
            onClick={() => setIsPreview(false)}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${!isPreview ? 'bg-white shadow-sm text-dase-accent' : 'text-gray-500 hover:text-gray-700'}`}
          >
            EDITOR
          </button>
          <button 
            onClick={() => setIsPreview(true)}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${isPreview ? 'bg-white shadow-sm text-dase-accent' : 'text-gray-500 hover:text-gray-700'}`}
          >
            NÁHĽAD
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
              alert("Markdown bol skopírovaný.");
            }}
            className="px-3 py-2 text-gray-400 hover:text-dase-blue transition-colors text-xs font-bold uppercase flex items-center gap-1"
          >
            <i className="fas fa-copy"></i> MD
          </button>

          <button
            onClick={copyAsHTML}
            className="px-4 py-2 bg-dase-blue hover:opacity-90 text-white transition-all text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm"
          >
            <i className="fas fa-code"></i> KOPÍROVAŤ HTML
          </button>

          <div className="h-6 w-[1px] bg-gray-100 mx-1"></div>

          <button
            onClick={onLearn}
            disabled={isLearning || !value}
            className="flex items-center gap-2 px-5 py-2 bg-dase-accent hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 shadow-sm"
            title="Vylepšiť model na základe vašich úprav v texte"
          >
            {isLearning ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-brain"></i>}
            VYLEPŠIŤ MOJÍM ŠTÝLOM
          </button>
        </div>
      </div>
      
      <div className="flex-grow bg-[#FDFDFD]">
        {!isPreview ? (
          <textarea
            className="w-full h-[650px] p-8 focus:outline-none font-mono text-sm leading-relaxed text-gray-700 bg-transparent border-none placeholder-gray-300"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Obsah news sa objaví tu..."
          />
        ) : (
          <div className="w-full h-[650px] p-12 overflow-y-auto preview-content custom-scrollbar">
            {value ? (
              <>
                <div className="preview-metadata">
                  <span>Novinky</span>
                  <span>|</span>
                  <span>DASE Team</span>
                  <span>|</span>
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
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <i className="fas fa-newspaper text-6xl mb-4"></i>
                <p className="font-bold uppercase tracking-widest text-xs">Zatiaľ prázdne</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
