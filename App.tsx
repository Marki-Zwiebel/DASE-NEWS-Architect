
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
    if (saved) return JSON.parse(saved);
    return { 
      type: 'remote', 
      apiUrl: 'https://dase-news-architect-default-rtdb.europe-west1.firebasedatabase.app/' 
    };
  });

  const storage = useMemo(() => new StorageService(storageConfig), [storageConfig]);
  const gemini = useMemo(() => new GeminiService(), []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await storage.loadProfile();
        if (profile) setStyleProfile(profile);
        const hist = await storage.loadHistory();
        setHistory(hist);
      } catch (e) {
        console.warn("Sync failed - running in local mode.");
      }
    };
    loadData();
  }, [storage]);

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
    
    // Diagnostika kľúča pred spustením
    if (!process.env.API_KEY) {
      alert("CHYBA: API_KEY nie je definovaný v process.env. Ak ste vo Verceli, pridajte premennú a urobte Redeploy.");
      return;
    }

    setStatus(AppStatus.GENERATING);
    try {
      const result = await gemini.generateNewsletter(topics, language, styleProfile);
      setCurrentDraft(result);
      setOriginalDraft(result);
    } catch (error: any) {
      console.error("Newsletter Generation Failed:", error);
      alert("Nepodarilo sa vygenerovať draft.\n\nDetail: " + (error?.message || "Neznáma chyba"));
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
      
      alert("DASE Architect sa úspešne naučil váš štýl!");
    } catch (error) {
      alert("Nepodarilo sa aktualizovať štýlový profil.");
    } finally {
      setStatus(AppStatus.IDLE);
    }
  };

  const handleSelectHistory = (item: NewsletterDraft) => {
    if (confirm("Obnoviť tento draft z histórie?")) {
      setTopics(item.topics);
      setCurrentDraft(item.content);
      setOriginalDraft(item.content);
      setLanguage(item.language);
    }
  };

  return (
    <Layout isCloud={storageConfig.type === 'remote' && !!storageConfig.apiUrl}>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={storageConfig}
        onSave={setStorageConfig}
      />

      {status === AppStatus.GENERATING && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 border-4 border-dase-blue/10 border-t-dase-blue rounded-full animate-spin mb-6"></div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">KREUJEM NEWSLETTER...</h3>
            <p className="text-slate-400 text-sm font-medium">Analýza vašich podkladov pomocou Gemini 3</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Panel: NEWS Builder */}
        <div className="lg:col-span-4 space-y-8 sticky top-28 h-fit max-h-[calc(100vh-160px)] overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-dase-blue"></div>
            <div className="absolute top-8 right-8">
              <button onClick={() => setIsSettingsOpen(true)} title="Nastavenia" className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-300 rounded-full hover:bg-slate-100 hover:text-dase-blue transition-all">
                <i className="fas fa-cog text-sm"></i>
              </button>
            </div>
            
            <h2 className="text-[11px] font-black uppercase tracking-widest text-dase-blue mb-8">NEWS Builder</h2>
            
            <div className="space-y-6 mb-8">
              {topics.map((topic, index) => (
                <div key={topic.id} className="group animate-in slide-in-from-left duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400">0{index + 1} NEWS ITEM</span>
                    {topics.length > 1 && (
                      <button onClick={() => removeTopic(topic.id)} className="text-slate-200 hover:text-dase-accent transition-colors">
                        <i className="fas fa-times-circle text-sm"></i>
                      </button>
                    )}
                  </div>
                  <textarea
                    className="w-full h-24 p-4 border border-slate-100 bg-slate-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-dase-blue/10 focus:border-dase-blue outline-none text-sm font-medium text-slate-600 transition-all placeholder:text-slate-300 resize-none"
                    placeholder="Čo sa stalo? (Vložte link a poznámky)"
                    value={topic.notes}
                    onChange={(e) => handleTopicChange(topic.id, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={addTopic} 
              className="w-full py-3 mb-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-dase-blue hover:text-dase-blue transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i> Pridať tému
            </button>

            <button
              onClick={handleGenerate}
              className="w-full bg-dase-dark text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-200 text-xs uppercase tracking-[0.15em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
            >
              <i className="fas fa-sparkles"></i>
              Generovať Draft
            </button>
          </div>

          {/* Style DNA Panel */}
          <div className="bg-gradient-to-br from-dase-blue/5 to-white p-8 rounded-[32px] border border-dase-blue/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-dase-blue rounded-lg flex items-center justify-center text-white text-xs">
                <i className="fas fa-dna"></i>
              </div>
              <h2 className="text-[11px] font-black text-dase-blue uppercase tracking-widest">Style DNA</h2>
            </div>
            <p className="text-xs text-slate-500 font-bold italic leading-relaxed mb-6">"{styleProfile.tone}"</p>
            <div className="flex flex-wrap gap-2">
              {styleProfile.vocabulary.slice(0, 6).map((v, i) => (
                <span key={i} className="text-[9px] bg-white text-dase-blue border border-dase-blue/20 px-3 py-1.5 rounded-full font-black uppercase tracking-wider">{v}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Editor Area */}
        <div className="lg:col-span-8">
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
