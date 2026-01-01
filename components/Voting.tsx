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
  const connectedPlayers = roomState.players.filter(p => !p.disconnected);
  const disconnectedPlayers = roomState.players.filter(p => p.disconnected);

  if (hasVoted) {
    const notVoted = connectedPlayers.filter(p => !p.vote);

    return (
      <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
        <Inbox size={48} className="animate-pulse text-blue-500" />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Vote Locked</h2>
        <p className="text-slate-500 text-xs sm:text-sm font-normal">Waiting for others...</p>

        <div className="w-full max-w-xs p-3 bg-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500 relative"
              style={{ width: `${(connectedPlayers.filter(p => !!p.vote).length / connectedPlayers.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5 font-semibold">
            {connectedPlayers.filter(p => !!p.vote).length} / {connectedPlayers.length} voted
            {disconnectedPlayers.length > 0 && (
              <span className="block text-[9px] text-red-400 mt-0.5">
                ({disconnectedPlayers.length} disconnected)
              </span>
            )}
          </p>
        </div>

        {notVoted.length > 0 && (
          <div className="w-full max-w-xs space-y-2">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Not Voted</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {notVoted.map(p => (
                <div key={p.id} className="flex items-center gap-1 bg-slate-800/40 px-2 py-1 rounded-lg border border-slate-700/30">
                  <span className="text-base">{p.avatar}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Word Reminder Section - Only in Online Mode */}
      {roomState.gameMode === 'ONLINE' && (
        <div className="w-full bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 shadow-lg backdrop-blur-md">
          <div className="text-center mb-2">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
              {currentPlayer.role === 'innocent' ? 'Your Secret Word' : 'Your Clue'}
            </span>
          </div>

          <div
            onClick={() => setShowWord(!showWord)}
            className="cursor-pointer select-none"
          >
            <div className={`text-2xl font-black text-white text-center py-2 transition-all ${showWord ? '' : 'blur-md'}`}>
              {currentPlayer.role === 'innocent'
                ? roomState.config.word
                : (roomState.config.imposterClueEnabled && roomState.config.associationWord
                  ? roomState.config.associationWord
                  : '(No Clue)')}
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-1.5">
        <div className="bg-red-900/40 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase text-red-400 inline-block">Whodunnit?</div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Cast Your Vote</h2>
        <p className="text-slate-500 text-[10px] sm:text-xs font-normal">Tap the player you suspect</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 overflow-y-auto pb-2 scrollbar-hide">
        {connectedPlayers.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedSuspect(p.id)}
            disabled={p.id === currentPlayer.id}
            className={`
                    relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-all duration-200 group
                    ${selectedSuspect === p.id
                ? 'bg-red-500/90 text-white border-red-400 shadow-lg shadow-red-500/20 scale-105 z-10'
                : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800/70'}
                    ${p.id === currentPlayer.id ? 'opacity-30 cursor-not-allowed grayscale' : ''}
                `}
          >
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-1.5 transition-transform group-hover:scale-105">{p.avatar}</div>
            <div className={`font-semibold text-xs sm:text-sm ${selectedSuspect === p.id ? 'text-white' : 'text-white'}`}>{p.name}</div>
            {selectedSuspect === p.id && (
              <div className="absolute top-1.5 right-1.5 bg-white text-red-500 w-5 h-5 rounded-full flex items-center justify-center">
                <CheckCircle2 size={14} strokeWidth={3} />
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