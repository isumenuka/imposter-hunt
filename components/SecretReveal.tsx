import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';

interface Props {
  player: Player;
  secretWord?: string;
  associationWord?: string;
}

export const SecretReveal: React.FC<Props> = ({ player, secretWord, associationWord }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const startHolding = () => setIsHolding(true);
  const stopHolding = () => setIsHolding(false);

  useEffect(() => {
    if (isHolding && !revealed) {
      intervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setRevealed(true);
            return 100;
          }
          return prev + 4;
        });
      }, 30);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!revealed) setProgress(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHolding, revealed]);

  const handleNext = () => {
    gameService.markReady(player.id);
  };

  if (player.isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <div className="relative">
          <div className="text-6xl animate-bounce filter drop-shadow-md">⏳</div>
          <div className="absolute -bottom-2 w-full h-2 bg-black/10 rounded-full blur-sm"></div>
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Waiting for others...</h2>
        <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-1/2 animate-[shimmer_1s_infinite] translate-x-[-100%]"></div>
        </div>
      </div>
    );
  }

  if (revealed) {
    const isInnocent = player.role === 'innocent';
    const showAssociation = !isInnocent && !!associationWord;

    return (
      <div className="flex flex-col h-full p-6 items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className={`
          relative w-full aspect-[3/4] rounded-[2.5rem] p-8 flex flex-col items-center justify-between shadow-2xl overflow-hidden border
          ${isInnocent
            ? 'bg-gradient-to-br from-white/80 to-blue-50/50 dark:from-slate-800/80 dark:to-slate-900/80 border-white/50 dark:border-white/10'
            : 'bg-gradient-to-br from-red-50/80 to-red-100/50 dark:from-red-950/80 dark:to-red-900/80 border-red-500/30'}
        `}>
          {/* Background FX */}
          <div className={`absolute inset-0 opacity-30 ${isInnocent ? 'bg-blue-500/10' : 'bg-red-500/20'}`}></div>

          <div className="flex items-center gap-2 mt-4 z-10 bg-white/50 dark:bg-black/30 px-3 py-1 rounded-full border border-white/20">
            <div className={`w-2 h-2 rounded-full ${isInnocent ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'} animate-pulse`}></div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-300">Identity Confirmed</span>
          </div>

          <div className="text-center z-10 space-y-4">
            <div className="text-9xl mb-6 transform hover:scale-110 transition-transform filter drop-shadow-xl">
              {isInnocent ? player.avatar : '👺'}
            </div>

            <div className={`
              px-8 py-3 rounded-2xl border-2 font-black text-3xl tracking-wider uppercase backdrop-blur-sm shadow-lg
              ${isInnocent
                ? 'border-blue-500/20 text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-slate-800/50'
                : 'border-red-500/20 text-red-600 dark:text-red-500 bg-red-100/50 dark:bg-red-900/30'}
            `}>
              {isInnocent ? 'Innocent' : 'Imposter'}
            </div>
          </div>

          <div className={`
            w-full p-6 rounded-2xl z-10 text-center backdrop-blur-md border border-white/20
            ${isInnocent ? 'bg-slate-100/50 dark:bg-slate-700/30' : 'bg-red-100/50 dark:bg-red-900/20'}
          `}>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 font-bold">
              {isInnocent ? 'Secret Word' : showAssociation ? 'Association Word' : 'Mission'}
            </p>
            <p className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
              {isInnocent ? secretWord : (showAssociation ? associationWord : 'Blend In')}
            </p>
            {!isInnocent && !showAssociation && (
              <p className="text-xs font-medium text-red-500/70 dark:text-red-300/50 mt-2">
                (No association word available)
              </p>
            )}
          </div>
        </div>

        <Button fullWidth className="mt-8 shadow-xl" onClick={handleNext}>
          I Understand &rarr;
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 items-center justify-center space-y-12">
      <div className="text-center space-y-3">
        <div className="bg-white/50 dark:bg-slate-800/50 px-6 py-2 rounded-full inline-block mb-2 border border-white/20 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{player.name}</h3>
        </div>
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest uppercase">
          <div className={`w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 ${!isHolding ? 'animate-pulse' : ''}`}></div>
          Security Check
          <span className="ml-1">🔒</span>
        </div>
      </div>

      <div className="relative w-72 h-72 select-none group">
        {/* Progress Ring Background */}
        <div className="absolute inset-0 rounded-full border-[12px] border-slate-200 dark:border-slate-800 opacity-50"></div>

        {/* Active Ring */}
        <svg className="w-full h-full transform -rotate-90 absolute inset-0 pointer-events-none">
          <circle
            cx="144" cy="144" r="130"
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 130}
            strokeDashoffset={2 * Math.PI * 130 * (1 - progress / 100)}
            className="transition-all duration-75 ease-linear"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Fingerprint Button */}
        <button
          className={`
            absolute inset-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center 
            active:scale-95 transition-all duration-300 outline-none touch-none no-select shadow-[inset_0_4px_20px_rgba(0,0,0,0.1)]
            ${isHolding ? 'ring-4 ring-blue-500/20' : ''}
          `}
          onMouseDown={startHolding}
          onMouseUp={stopHolding}
          onMouseLeave={stopHolding}
          onTouchStart={startHolding}
          onTouchEnd={stopHolding}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-40 h-40 transition-colors duration-200 ${isHolding ? 'text-blue-500 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}
          >
            <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 6" />
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
            <path d="M8.65 22c.21-.66.45-1.32.57-2" />
            <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 .95-.17 1.4" />
            <path d="M16 22c-.25-.9-.6-2.6-.6-5 0-1.8.6-3.2 1.7-4" />
            <path d="M19 14c1.45-.6 3-1.4 3-5" />
          </svg>
        </button>

        {/* Scan line animation */}
        {isHolding && (
          <div className="absolute inset-6 rounded-full overflow-hidden pointer-events-none z-10">
            <div className="w-full h-2 bg-blue-500/80 shadow-[0_0_25px_rgba(59,130,246,0.8)] absolute animate-scan"></div>
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Press & hold to reveal</h3>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-medium">Biometric Access Required</p>
      </div>

      <div className="px-4 py-2 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30 flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-400 font-bold">
        <span>⚠️</span> Keep your screen private from others
      </div>
    </div>
  );
};