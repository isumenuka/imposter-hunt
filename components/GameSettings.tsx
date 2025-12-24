import React, { useState, useEffect } from 'react';
import { GameConfig } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';
import { GAME_CATEGORIES } from '../constants';

interface Props {
  isHost: boolean;
  config: GameConfig;
  playerCount: number;
  error?: string;
}

export const GameSettings: React.FC<Props> = ({ isHost, config, playerCount, error }) => {
  const [localConfig, setLocalConfig] = useState<GameConfig>(config);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (error) {
      setIsStarting(false);
    }
  }, [error]);

  const update = (key: keyof GameConfig, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    gameService.updateSettings(newConfig);
  };

  const toggleCategory = (cat: string) => {
      const current = localConfig.selectedCategories || [];
      let next: string[];
      if (current.includes(cat)) {
          next = current.filter(c => c !== cat);
      } else {
          next = [...current, cat];
      }
      update('selectedCategories', next);
  };

  const handleStart = async () => {
    setIsStarting(true);
    gameService.startGame(localConfig);
  };

  if (!isHost) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
        <div className="relative">
            <div className="text-6xl animate-bounce filter drop-shadow-lg">⚙️</div>
            <div className="absolute -bottom-2 w-full h-2 bg-black/20 rounded-full blur-md"></div>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Host is configuring...</h2>
        <div className="space-y-3 w-full max-w-sm">
            {[
                { l: 'Categories', v: `${config.selectedCategories?.length || 0} selected` },
                { l: 'Imposters', v: config.imposterCount },
                { l: 'Hints', v: config.imposterClueEnabled ? 'ON' : 'OFF' },
                { l: 'Time', v: `${config.roundDuration / 60} min` }
            ].map((item) => (
                <div key={item.l} className="flex justify-between bg-white/40 dark:bg-slate-800/40 p-4 rounded-xl border border-white/30 dark:border-white/5 backdrop-blur-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{item.l}</span>
                    <span className="text-slate-900 dark:text-white font-bold">{item.v}</span>
                </div>
            ))}
        </div>
      </div>
    );
  }

  const selectedCount = localConfig.selectedCategories?.length || 0;

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex-1">Game Settings</h1>
      </div>

      <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-3xl space-y-4 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-end">
             <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-wider uppercase pl-1">
                 Select Categories ({selectedCount})
             </h3>
             <span className="text-[10px] text-slate-400">Game picks one at random</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
            {GAME_CATEGORIES.map(cat => {
                const isSelected = localConfig.selectedCategories?.includes(cat);
                return (
                    <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`
                            px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 border flex items-center justify-between group
                            ${isSelected 
                                ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20' 
                                : 'bg-white/40 dark:bg-black/20 text-slate-600 dark:text-slate-300 border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-black/40'}
                        `}
                    >
                        <span>{cat}</span>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${isSelected ? 'bg-white text-blue-500 border-transparent' : 'border-slate-400 dark:border-slate-500'}`}>
                            {isSelected && '✓'}
                        </span>
                    </button>
                );
            })}
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-3xl space-y-8 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-slate-800 dark:text-white">Imposters</label>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{localConfig.imposterCount}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/30 dark:bg-black/20 p-2 rounded-2xl border border-white/20 dark:border-white/5">
                <Button 
                    className="w-10 h-10 !p-0 rounded-xl text-xl shadow-none" 
                    variant="secondary"
                    onClick={() => update('imposterCount', Math.max(1, localConfig.imposterCount - 1))}
                >-</Button>
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-red-400 to-red-600 h-full transition-all" style={{ width: `${(localConfig.imposterCount / (Math.floor(playerCount/2) || 1)) * 100}%` }}></div>
                </div>
                <Button 
                    className="w-10 h-10 !p-0 rounded-xl text-xl shadow-none" 
                    variant="secondary"
                    onClick={() => update('imposterCount', Math.min(Math.floor(playerCount / 2) || 1, localConfig.imposterCount + 1))}
                >+</Button>
            </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-slate-800 dark:text-white">Imposter Hints</label>
            </div>
            <button 
                onClick={() => update('imposterClueEnabled', !localConfig.imposterClueEnabled)}
                className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${localConfig.imposterClueEnabled ? 'bg-purple-500/20 border-purple-500/50' : 'bg-white/30 dark:bg-black/20 border-white/20'}`}
            >
                <div className="flex flex-col items-start">
                    <span className={`font-bold ${localConfig.imposterClueEnabled ? 'text-purple-600 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {localConfig.imposterClueEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {localConfig.imposterClueEnabled ? 'Imposters see a vague hint' : 'Imposters see nothing (Hard Mode)'}
                    </span>
                </div>
                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 relative ${localConfig.imposterClueEnabled ? 'bg-purple-500' : 'bg-slate-400/50'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${localConfig.imposterClueEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-slate-800 dark:text-white">Duration</label>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{localConfig.roundDuration / 60}m</span>
            </div>
            <div className="flex items-center gap-4 bg-white/30 dark:bg-black/20 p-2 rounded-2xl border border-white/20 dark:border-white/5">
                <Button 
                    className="w-10 h-10 !p-0 rounded-xl text-xl shadow-none" 
                    variant="secondary"
                    onClick={() => update('roundDuration', Math.max(60, localConfig.roundDuration - 60))}
                >-</Button>
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all" style={{ width: `${(localConfig.roundDuration / 600) * 100}%` }}></div>
                </div>
                <Button 
                    className="w-10 h-10 !p-0 rounded-xl text-xl shadow-none" 
                    variant="secondary"
                    onClick={() => update('roundDuration', Math.min(600, localConfig.roundDuration + 60))}
                >+</Button>
            </div>
          </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-bold text-red-800 dark:text-red-300 mb-1">Generation Failed</h4>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Button fullWidth onClick={handleStart} className="mt-auto shadow-xl" disabled={isStarting || selectedCount === 0}>
        {isStarting ? 'Generating Round...' : selectedCount === 0 ? 'Select a Category' : error ? 'Try Again' : 'Start Game ▷'}
      </Button>
    </div>
  );
};