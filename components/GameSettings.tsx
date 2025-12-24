import React, { useState, useEffect } from 'react';
import { GameConfig, RoomState } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';
import { GAME_CATEGORIES } from '../constants';

interface Props {
  isHost: boolean;
  config: GameConfig;
  playerCount: number;
  error?: string;
  roomState?: RoomState;
}

export const GameSettings: React.FC<Props> = ({ isHost, config, playerCount, error, roomState }) => {
  const [localConfig, setLocalConfig] = useState<GameConfig>(config);
  const [isStarting, setIsStarting] = useState(false);
  const myPlayerId = gameService.getPlayerId();
  const myPlayer = roomState?.players.find(p => p.id === myPlayerId);
  const isOnline = roomState?.gameMode === 'ONLINE';

  useEffect(() => {
    if (error) {
      setIsStarting(false);
    }
  }, [error]);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const update = (key: keyof GameConfig, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    gameService.updateSettings(newConfig);
  };

  const toggleCategory = (cat: string) => {
    if (isOnline) {
      const myCategories = myPlayer?.selectedCategories || [];
      let next: string[];
      if (myCategories.includes(cat)) {
        next = myCategories.filter(c => c !== cat);
      } else {
        next = [...myCategories, cat];
      }
      gameService.updatePlayerCategories(myPlayerId, next);
    } else {
      const current = localConfig.selectedCategories || [];
      let next: string[];
      if (current.includes(cat)) {
        next = current.filter(c => c !== cat);
      } else {
        next = [...current, cat];
      }
      update('selectedCategories', next);
    }
  };

  const handleStart = async () => {
    setIsStarting(true);
    gameService.startGame(localConfig);
  };

  const getPlayersForCategory = (category: string) => {
    return roomState?.players.filter(p => p.selectedCategories?.includes(category)) || [];
  };

  const isCategorySelected = (cat: string) => {
    if (isOnline) {
      return myPlayer?.selectedCategories?.includes(cat) || false;
    }
    return localConfig.selectedCategories?.includes(cat) || false;
  };

  const selectedCount = localConfig.selectedCategories?.length || 0;

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex-1">Game Settings</h1>
      </div>

      <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-3xl space-y-4 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-end">
             <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-wider uppercase pl-1">
                 {isOnline ? 'Vote for Categories' : 'Select Categories'} ({selectedCount})
             </h3>
             <span className="text-[10px] text-slate-400">Game picks one at random</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
            {GAME_CATEGORIES.map(cat => {
                const selected = isCategorySelected(cat);
                const playersWhoSelected = isOnline ? getPlayersForCategory(cat) : [];
                return (
                    <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`
                            px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 border flex flex-col items-start gap-2 group relative
                            ${selected
                                ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/20'
                                : 'bg-white/40 dark:bg-black/20 text-slate-600 dark:text-slate-300 border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-black/40'}
                        `}
                    >
                        <div className="flex items-center justify-between w-full">
                            <span>{cat}</span>
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0 ${selected ? 'bg-white text-blue-500 border-transparent' : 'border-slate-400 dark:border-slate-500'}`}>
                                {selected && '✓'}
                            </span>
                        </div>
                        {isOnline && playersWhoSelected.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                                {playersWhoSelected.map(player => (
                                    <span
                                        key={player.id}
                                        className="text-base filter drop-shadow-sm"
                                        title={player.name}
                                    >
                                        {player.avatar}
                                    </span>
                                ))}
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
        {isOnline && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                Everyone can select categories. Avatars show who voted for each.
            </p>
        )}
      </div>

      <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-3xl space-y-8 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
          {isOnline && !isHost && (
              <div className="bg-yellow-100/50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-200 dark:border-yellow-900/30 text-center">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 font-bold">Host controls other settings</p>
              </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-3">
                <label className="font-bold text-slate-800 dark:text-white">Imposters</label>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{localConfig.imposterCount}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/30 dark:bg-black/20 p-2 rounded-2xl border border-white/20 dark:border-white/5">
                <Button
                    className="w-10 h-10 !p-0 rounded-xl text-xl shadow-none"
                    variant="secondary"
                    disabled={isOnline && !isHost}
                    onClick={() => update('imposterCount', Math.max(1, localConfig.imposterCount - 1))}
                >-</Button>
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-red-400 to-red-600 h-full transition-all" style={{ width: `${(localConfig.imposterCount / (Math.floor(playerCount/2) || 1)) * 100}%` }}></div>
                </div>
                <Button
                    className="w-10 h-10 !p-0 rounded-xl text-xl shadow-none"
                    variant="secondary"
                    disabled={isOnline && !isHost}
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
                disabled={isOnline && !isHost}
                className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${localConfig.imposterClueEnabled ? 'bg-purple-500/20 border-purple-500/50' : 'bg-white/30 dark:bg-black/20 border-white/20'} ${isOnline && !isHost ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    disabled={isOnline && !isHost}
                    onClick={() => update('roundDuration', Math.max(60, localConfig.roundDuration - 60))}
                >-</Button>
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all" style={{ width: `${(localConfig.roundDuration / 600) * 100}%` }}></div>
                </div>
                <Button
                    className="w-10 h-10 !p-0 rounded-xl text-xl shadow-none"
                    variant="secondary"
                    disabled={isOnline && !isHost}
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

      {isHost ? (
        <Button fullWidth onClick={handleStart} className="mt-auto shadow-xl" disabled={isStarting || selectedCount === 0}>
          {isStarting ? 'Generating Round...' : selectedCount === 0 ? 'Select a Category' : error ? 'Try Again' : 'Start Game ▷'}
        </Button>
      ) : (
        <div className="text-center text-slate-500 dark:text-slate-400 animate-pulse pb-4 text-sm font-medium">
          Waiting for host to start...
        </div>
      )}
    </div>
  );
};