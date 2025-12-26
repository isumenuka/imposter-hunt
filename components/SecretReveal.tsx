import React, { useState, useEffect, useRef } from 'react';
import { Player, RoomState } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';
import { Timer, Lock, Eye, AlertCircle, BadgeCheck } from 'lucide-react';
import { soundManager } from '../utils/sounds';

interface Props {
  player: Player;
  secretWord?: string;
  associationWord?: string;
  roomState: RoomState;
}

export const SecretReveal: React.FC<Props> = ({ player, secretWord, associationWord, roomState }) => {
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

  // Play sound when role is revealed
  useEffect(() => {
    if (revealed) {
      // Small delay to let the animation start
      setTimeout(() => {
        if (player.role === 'imposter') {
          soundManager.playImposterReveal();
        } else {
          soundManager.playInnocentReveal();
        }
      }, 100);
    }
  }, [revealed, player.role]);

  const handleNext = () => {
    gameService.markReady(player.id);
  };

  if (player.isReady) {
    const notReady = roomState.players.filter(p => !p.isReady);

    return (
      <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
        <div className="relative">
          <Timer size={48} className="animate-bounce text-blue-500" />
          <div className="absolute -bottom-1.5 w-full h-1.5 bg-black/10 rounded-full blur-sm"></div>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white">Waiting for others...</h2>

        {notReady.length > 0 && (
          <div className="w-full max-w-xs space-y-2">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Not Ready</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {notReady.map(p => (
                <div key={p.id} className="flex items-center gap-1 bg-white/20 dark:bg-slate-900/40 px-2 py-1 rounded-lg border border-white/10">
                  <span className="text-base">{p.avatar}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-36 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-1/2 animate-[shimmer_1s_infinite] translate-x-[-100%]"></div>
        </div>
      </div>
    );
  }

  if (revealed) {
    const isInnocent = player.role === 'innocent';
    const showAssociation = !isInnocent && !!associationWord;

    return (
      <div className="flex flex-col h-full p-3 sm:p-4 items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className={`
          relative w-full aspect-[3/4] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-between shadow-xl overflow-hidden border
          ${isInnocent
            ? 'bg-gradient-to-br from-white/70 to-blue-50/40 dark:from-slate-900/70 dark:to-slate-950/70 border-white/30 dark:border-white/5'
            : 'bg-gradient-to-br from-red-50/70 to-red-100/40 dark:from-red-950/70 dark:to-red-900/70 border-red-500/20'}
        `}>
          {/* Background FX */}
          <div className={`absolute inset-0 opacity-20 ${isInnocent ? 'bg-blue-500/10' : 'bg-red-500/20'}`}></div>

          <div className="flex items-center gap-1.5 mt-2 z-10 bg-white/40 dark:bg-black/40 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-white/10">
            <div className={`w-1.5 h-1.5 rounded-full ${isInnocent ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]'} animate-pulse`}></div>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-400 flex items-center gap-0.5 sm:gap-1">
              <BadgeCheck size={10} className="text-green-500" />
              Confirmed
            </span>
          </div>

          <div className="text-center z-10 space-y-2 sm:space-y-3">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 transform hover:scale-105 transition-transform">
              {isInnocent ? player.avatar : (
                <div className="flex items-center justify-center w-full">
                  <Eye size={64} className="text-red-600 dark:text-red-500 sm:w-20 sm:h-20" strokeWidth={2} />
                </div>
              )}
            </div>

            <div className={`
              px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl border font-black text-xl sm:text-2xl tracking-wide uppercase backdrop-blur-sm
              ${isInnocent
                ? 'border-blue-500/20 text-blue-600 dark:text-blue-400 bg-white/40 dark:bg-slate-800/40'
                : 'border-red-500/20 text-red-600 dark:text-red-500 bg-red-100/40 dark:bg-red-900/30'}
            `}>
              {isInnocent ? 'Innocent' : 'Imposter'}
            </div>
          </div>

          {(isInnocent || showAssociation) && (
            <div className={`
              w-full p-3 sm:p-4 rounded-xl z-10 text-center backdrop-blur-sm border border-white/10
              ${isInnocent ? 'bg-slate-900/40' : 'bg-red-900/30'}
            `}>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 mb-1 sm:mb-1.5 font-semibold">
                {isInnocent ? 'Secret Word' : 'Association Word'}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {isInnocent ? secretWord : associationWord}
              </p>
            </div>
          )}
        </div>

        <Button fullWidth className="mt-4 sm:mt-6" onClick={handleNext}>
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
          <Lock size={12} className="ml-1 text-slate-400 dark:text-slate-600" />
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
        <AlertCircle size={16} className="flex-shrink-0" />
        <span>Keep your screen private from others</span>
      </div>
    </div>
  );
};