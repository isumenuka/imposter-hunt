import React, { useState } from 'react';
import { Player, RoomState } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';
import { CheckCircle2, Inbox, Lock, Eye, EyeOff } from 'lucide-react';

interface Props {
  roomState: RoomState;
  currentPlayer: Player;
}

export const Voting: React.FC<Props> = ({ roomState, currentPlayer }) => {
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [showWord, setShowWord] = useState(false);

  const handleVote = () => {
    if (selectedSuspect && currentPlayer) {
      gameService.castVote(currentPlayer.id, selectedSuspect);
    }
  };

  const hasVoted = !!currentPlayer.vote;

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <Inbox size={64} className="animate-pulse text-blue-500 dark:text-blue-400" />
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Vote Locked</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Waiting for others...</p>

        <div className="w-full max-w-xs p-4 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-white/40 dark:border-white/10 backdrop-blur-md">
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500 relative"
              style={{ width: `${(roomState.players.filter(p => !!p.vote).length / roomState.players.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">{roomState.players.filter(p => !!p.vote).length} / {roomState.players.length} voted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Word Reminder Section - Only in Online Mode */}
      {roomState.gameMode === 'ONLINE' && (
        <div className="w-full bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-white/40 dark:border-white/10 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-600 dark:text-slate-400">
              {currentPlayer.role === 'innocent' ? 'Your Secret Word' : 'Your Clue'}
            </span>
            <button
              onClick={() => setShowWord(!showWord)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
            >
              {showWord ? (
                <>
                  <EyeOff size={14} />
                  Hide
                </>
              ) : (
                <>
                  <Eye size={14} />
                  Show
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <div className={`text-2xl font-black text-slate-900 dark:text-white text-center py-2 transition-all ${showWord ? '' : 'blur-md select-none'}`}>
              {currentPlayer.role === 'innocent'
                ? roomState.config.word
                : (roomState.config.imposterClueEnabled && roomState.config.associationWord
                  ? roomState.config.associationWord
                  : '(No Clue)')}
            </div>
            {!showWord && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-700/80 px-3 py-1 rounded-full">
                  Click Show to reveal
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center space-y-2">
        <div className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full text-xs font-black uppercase text-red-600 dark:text-red-400 inline-block">Whodunnit?</div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Cast Your Vote</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tap the player you suspect most.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-4 scrollbar-hide">
        {roomState.players.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedSuspect(p.id)}
            disabled={p.id === currentPlayer.id}
            className={`
                    relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 group
                    ${selectedSuspect === p.id
                ? 'bg-red-500/90 text-white border-red-400 shadow-xl shadow-red-500/30 scale-105 z-10'
                : 'bg-white/40 dark:bg-slate-800/40 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-700/60'}
                    ${p.id === currentPlayer.id ? 'opacity-40 cursor-not-allowed grayscale' : ''}
                `}
          >
            <div className="text-5xl mb-2 filter drop-shadow-sm transition-transform group-hover:scale-110">{p.avatar}</div>
            <div className={`font-bold text-sm ${selectedSuspect === p.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{p.name}</div>
            {selectedSuspect === p.id && (
              <div className="absolute top-2 right-2 bg-white text-red-500 w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                <CheckCircle2 size={16} strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <Button
          fullWidth
          onClick={handleVote}
          disabled={!selectedSuspect}
          variant={selectedSuspect ? 'danger' : 'secondary'}
          className="shadow-xl"
        >
          {selectedSuspect ? (
            <span className="flex items-center gap-2 justify-center">
              <Lock size={18} />
              Lock Vote
            </span>
          ) : 'Select a Suspect'}
        </Button>
      </div>
    </div>
  );
};