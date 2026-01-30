
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Editor from './components/Editor';
import SettingsModal from './components/SettingsModal';
import { NewsletterDraft, StyleProfile, AppStatus, NewsTopic, StorageConfig } from './types';
import { INITIAL_STYLE_PROFILE } from './constants';
import { GeminiService } from './services/geminiService';
import { StorageService } from './services/storageService';

const App: React.FC = () => {
  const [topics, setTopics] = useState<NewsTopic[]>([
    { id: '1', notes: '' },
    { id: '2', notes: '' },
    { id: '3', notes: '' },
    { id: '4', notes: '' },
  ]);
  const [language, setLanguage] = useState('sk');
  const [currentDraft, setCurrentDraft] = useState<string>('');
  const [originalDraft, setOriginalDraft] = useState<string>('');
  const [styleProfile, setStyleProfile] = useState<StyleProfile>(INITIAL_STYLE_PROFILE);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<NewsletterDraft[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [storageConfig, setStorageConfig] = useState<StorageConfig>(() => {
    const saved = localStorage.getItem('storageConfig');
    return saved ? JSON.parse(saved) : { type: 'local' };
  });

  const storage = useMemo(() => new StorageService(storageConfig), [storageConfig]);
  const gemini = useMemo(() => new GeminiService(), []);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      const profile = await storage.loadProfile();
      if (profile) setStyleProfile(profile);
      const hist = await storage.loadHistory();
      setHistory(hist);
    };
    loadData();
  }, [storage]);

  // Save config changes
  useEffect(() => {
    localStorage.setItem('storageConfig', JSON.stringify(storageConfig));
  }, [storageConfig]);

  const handleTopicChange = (id: string, value: string) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, notes: value } : t));
  };

  const addTopic = () => {
    setTopics(prev => [...prev, { id: Date.now().toString(), notes: '' }]);
  };

  const removeTopic = (id: string) => {
    if (topics.length <= 1) return;
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  const handleGenerate = async () => {
    const hasNotes = topics.some(t => t.notes.trim().length > 0);
    if (!hasNotes) return;
    
    setStatus(AppStatus.GENERATING);
    try {
      const result = await gemini.generateNewsletter(topics, language, styleProfile);
      setCurrentDraft(result);
      setOriginalDraft(result);
    } catch (error) {
      console.error(error);
      alert("Chyba spojenia s AI.");
    } finally {
      setStatus(AppStatus.IDLE);
    }
  };

  const handleLearnStyle = async () => {
    if (!currentDraft || !originalDraft) return;
    setStatus(AppStatus.LEARNING);
    try {
      const updatedProfile = await gemini.learnStyle(originalDraft, currentDraft, styleProfile);
      setStyleProfile(updatedProfile);
      await storage.saveProfile(updatedProfile);
      
      const newHistoryItem: NewsletterDraft = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        language,
        topics: [...topics],
        content: currentDraft,
        isLearned: true
      };
      
      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      await storage.saveHistory(updatedHistory);
      
      alert("Model bol úspešne adaptovaný a dáta synchronizované!");
    } catch (error) {
      console.error(error);
      alert("Chyba pri trénovaní modelu.");
    } finally {
      setStatus(AppStatus.IDLE);
    }
  };

  const handleSelectHistory = (item: NewsletterDraft) => {
    if (confirm("Načítať z archívu?")) {
      setTopics(item.topics);
      setCurrentDraft(item.content);
      setOriginalDraft(item.content);
      setLanguage(item.language);
    }
  };

  return (
    <Layout>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={storageConfig}
        onSave={setStorageConfig}
      />

      {/* Loading Overlay */}
      {status === AppStatus.GENERATING && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-dase-blue/20 border-t-dase-blue rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-chart-bar text-dase-accent text-2xl animate-pulse"></i>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-dase-dark mb-2 tracking-tight">Pripravujem váš článok</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Model analyzuje podklady...</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-8 sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-4 custom-scrollbar">
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative">
            <div className="absolute top-8 right-8">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-gray-300 hover:text-dase-blue transition-colors"
                title="Nastavenia úložiska"
              >
                <i className="fas fa-cog text-sm"></i>
              </button>
            </div>

            <h2 className="text-sm font-black uppercase tracking-widest text-dase-accent mb-6 flex items-center gap-2">
               PODKLADY PRE NEWS
            </h2>

            <div className="space-y-6 mb-8">
              {topics.map((topic, index) => (
                <div key={topic.id} className="relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-dase-blue uppercase">Správa č. {index + 1}</span>
                    {topics.length > 1 && (
                      <button onClick={() => removeTopic(topic.id)} className="text-gray-200 hover:text-red-400">
                        <i className="fas fa-trash text-[10px]"></i>
                      </button>
                    )}
                  </div>
                  <textarea
                    className="w-full h-32 p-4 border border-gray-100 rounded-2xl focus:border-dase-blue focus:ring-4 focus:ring-dase-light focus:outline-none transition-all resize-none text-sm bg-gray-50/50 leading-relaxed font-medium text-gray-600"
                    placeholder="Sem vložte poznámky a link na zdroj..."
                    value={topic.notes}
                    onChange={(e) => handleTopicChange(topic.id, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addTopic}
              className="w-full py-3 mb-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-300 text-[10px] font-black hover:border-dase-blue hover:text-dase-blue transition-all uppercase tracking-widest"
            >
              + Pridať ďalšiu správu
            </button>

            <button
              onClick={handleGenerate}
              disabled={status === AppStatus.GENERATING}
              className="w-full bg-dase-blue hover:opacity-90 disabled:bg-gray-200 text-white font-black py-4 px-4 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-blue-50 tracking-widest text-xs uppercase"
            >
              {status === AppStatus.GENERATING ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : null}
              {status === AppStatus.GENERATING ? 'Pripravujem...' : 'Generovať správy'}
            </button>
          </div>

          {/* DASE STYLE DNA */}
          <div className="bg-dase-light p-8 rounded-3xl border border-dase-blue/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] text-dase-blue font-black uppercase tracking-widest">ADAPTÍVNY MODEL</h2>
              <span className={`text-[9px] font-black uppercase ${storageConfig.type === 'remote' ? 'text-dase-accent' : 'text-gray-400'}`}>
                {storageConfig.type === 'remote' ? <><i className="fas fa-cloud mr-1"></i> Cloud Sync On</> : <><i className="fas fa-hdd mr-1"></i> Local Only</>}
              </span>
            </div>
            <div className="space-y-4">
              <div className="text-xs text-gray-500 font-bold italic leading-relaxed">
                "{styleProfile.tone}"
              </div>
              <div className="flex flex-wrap gap-2">
                {styleProfile.vocabulary.slice(0, 6).map((v, i) => (
                  <span key={i} className="text-[9px] bg-white text-dase-blue border border-dase-blue/20 px-2 py-0.5 rounded-lg font-bold">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ARCHIVE */}
          <div className="bg-white p-8 rounded-3xl border border-gray-50">
             <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">ARCHÍV</h2>
             <div className="space-y-3">
               {history.length > 0 ? history.slice(0, 5).map(item => (
                 <div 
                  key={item.id} 
                  onClick={() => handleSelectHistory(item)}
                  className="p-3 bg-gray-50 rounded-xl hover:bg-dase-light cursor-pointer transition-all border border-transparent hover:border-dase-blue"
                 >
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-black text-dase-accent">{new Date(item.date).toLocaleDateString()}</p>
                      {item.isLearned && <i className="fas fa-brain text-[8px] text-dase-blue" title="Prispôsobené štýlu"></i>}
                    </div>
                    <p className="text-xs font-bold text-gray-600 truncate">{item.content.split('\n')[0].replace('# ', '') || 'Bez názvu'}</p>
                 </div>
               )) : (
                 <p className="text-[10px] text-gray-300 italic">Žiadne záznamy v databáze.</p>
               )}
             </div>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-dase-dark">Editor správ</h2>
              {(status === AppStatus.LEARNING) && (
                <span className="text-[10px] font-black text-dase-accent animate-pulse uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">
                  Trénujem model...
                </span>
              )}
            </div>
          </div>
          
          <Editor 
            value={currentDraft} 
            onChange={setCurrentDraft}
            onSave={() => {}}
            isSaving={false}
            onLearn={handleLearnStyle}
            isLearning={status === AppStatus.LEARNING}
          />
        </div>

      </div>
    </Layout>
  );
};

export default App;
