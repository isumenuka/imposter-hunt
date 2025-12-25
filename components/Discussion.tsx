import React, { useEffect, useState } from 'react';
import { Player, RoomState } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';
import { MessageCircle } from 'lucide-react';

interface Props {
  roomState: RoomState;
  currentPlayer: Player;
}

export const Discussion: React.FC<Props> = ({ roomState, currentPlayer }) => {
  const [timeLeft, setTimeLeft] = useState(roomState.config.roundDuration);
  const firstSpeaker = roomState.players.find(p => p.id === roomState.firstSpeakerId);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // 3 second intro for "First to speak"
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!roomState.startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (roomState.startTime || 0)) / 1000);
      const remaining = Math.max(0, roomState.config.roundDuration - elapsed);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [roomState.startTime, roomState.config.roundDuration]);

  const handleVoteStart = () => {
    gameService.startVoting();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Intro Screen: "Who Speaks First?"
  if (showIntro) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 animate-in zoom-in duration-500">
        <div className="bg-blue-100 dark:bg-blue-900/40 px-4 py-1.5 rounded-full text-xs font-black tracking-widest text-blue-600 dark:text-blue-300 mb-8 border border-blue-200 dark:border-blue-500/30 shadow-sm">
          RANDOM SELECTION
        </div>

        <h1 className="text-4xl font-black mb-2 text-slate-900 dark:text-white">First to Speak</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-12 font-medium">The discussion starts with...</p>

        <div className="bg-white/60 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-8 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-2xl flex flex-col items-center backdrop-blur-md">
          <div className="text-8xl mb-6 filter drop-shadow-xl animate-bounce">{firstSpeaker?.avatar}</div>
          <div className="bg-white/50 dark:bg-black/30 px-8 py-3 rounded-2xl font-black text-3xl text-slate-800 dark:text-white border border-white/20">
            {firstSpeaker?.name}
          </div>
        </div>
      </div>
    );
  }

  // Main Timer Screen
  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="text-center">
          <MessageCircle size={56} className="mb-4 text-purple-500 dark:text-purple-400" strokeWidth={2} />
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Discussion</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Describe your word, find the liar.</p>
        </div>

        <div className="relative w-72 h-36 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-lg backdrop-blur-md">
          <div className="text-7xl font-black tracking-tighter tabular-nums text-slate-900 dark:text-white font-mono filter drop-shadow-sm">
            {formatTime(timeLeft)}
          </div>
          <div className="absolute -bottom-3 text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-1.5 rounded-full shadow-lg">
            TIME LEFT
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          {roomState.players.map(p => (
            <div key={p.id} className="bg-white/30 dark:bg-slate-800/30 p-2 rounded-xl flex flex-col items-center border border-white/30 dark:border-white/5 opacity-80">
              <span className="text-xl filter drop-shadow-sm">{p.avatar}</span>
              <span className="font-bold text-xs mt-1 truncate max-w-full text-slate-700 dark:text-slate-300">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Button fullWidth onClick={handleVoteStart} variant="primary" className="shadow-xl">
        Start Voting
      </Button>
    </div>
  );
};