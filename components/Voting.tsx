import React, { useState } from 'react';
import { Player, RoomState } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';

interface Props {
  roomState: RoomState;
  currentPlayer: Player;
}

export const Voting: React.FC<Props> = ({ roomState, currentPlayer }) => {
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);

  const handleVote = () => {
    if (selectedSuspect && currentPlayer) {
      gameService.castVote(currentPlayer.id, selectedSuspect);
    }
  };

  const hasVoted = !!currentPlayer.vote;

  if (hasVoted) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
            <div className="text-6xl animate-pulse filter drop-shadow-lg">🗳️</div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Vote Locked</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Waiting for others...</p>
            
            <div className="w-full max-w-xs p-4 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-white/40 dark:border-white/10 backdrop-blur-md">
                 <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div 
                        className="bg-blue-500 h-full transition-all duration-500 relative"
                        style={{ width: `${(roomState.players.filter(p => !!p.vote).length / roomState.players.length) * 100}%`}}
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
                    <div className="absolute top-2 right-2 bg-white text-red-500 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md">
                        ✓
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
            {selectedSuspect ? '🔒 Lock Vote' : 'Select a Suspect'}
        </Button>
      </div>
    </div>
  );
};