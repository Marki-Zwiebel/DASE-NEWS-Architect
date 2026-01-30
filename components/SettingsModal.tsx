
import React from 'react';
import { StorageConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StorageConfig;
  onSave: (config: StorageConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = React.useState<StorageConfig>(config);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-end bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-white shadow-2xl p-8 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-dase-dark">Nastavenia úložiska</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-dase-accent">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Typ úložiska</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button 
                onClick={() => setLocalConfig({ ...localConfig, type: 'local' })}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${localConfig.type === 'local' ? 'bg-white shadow-sm text-dase-blue' : 'text-gray-500'}`}
              >
                LOKÁLNE (Browser)
              </button>
              <button 
                onClick={() => setLocalConfig({ ...localConfig, type: 'remote' })}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${localConfig.type === 'remote' ? 'bg-white shadow-sm text-dase-accent' : 'text-gray-500'}`}
              >
                VZDIAĽANÉ (Firebase)
              </button>
            </div>
          </div>

          {localConfig.type === 'remote' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Firebase Database URL</label>
                <input 
                  type="text" 
                  value={localConfig.apiUrl || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiUrl: e.target.value })}
                  placeholder="https://vash-projekt.firebasedatabase.app/"
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-dase-accent"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Database Secret (Voliteľné)</label>
                <input 
                  type="password" 
                  value={localConfig.apiKey || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                  placeholder="Zadajte ak máte zamknutú DB"
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-dase-accent"
                />
              </div>
              <p className="text-[10px] text-gray-400 italic">
                * Pre Firebase vložte základnú URL. Systém automaticky pridá .json vetvy.
              </p>
            </div>
          )}

          <div className="pt-8">
            <button 
              onClick={() => {
                onSave(localConfig);
                onClose();
              }}
              className="w-full bg-dase-dark text-white font-black py-4 rounded-2xl hover:bg-black transition-all text-xs uppercase tracking-widest"
            >
              Uložiť a synchronizovať
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
