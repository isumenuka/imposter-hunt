import React, { useEffect, useState } from 'react';
import { Player, RoomState } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';
import { MessageCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface Props {
  roomState: RoomState;
  currentPlayer: Player;
}

export const Discussion: React.FC<Props> = ({ roomState, currentPlayer }) => {
  const [timeLeft, setTimeLeft] = useState(roomState.config.roundDuration);
  const firstSpeaker = roomState.players.find(p => p.id === roomState.firstSpeakerId);
  const [showIntro, setShowIntro] = useState(true);
  const [showReRandomizeConfirm, setShowReRandomizeConfirm] = useState(false);
  const [isReRandomizing, setIsReRandomizing] = useState(false);
  const [showWord, setShowWord] = useState(false);

  const isAdmin = roomState.gameMode === 'OFFLINE' ? true : currentPlayer.isHost;

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

  // Auto-transition to voting when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0) {
      gameService.startVoting();
    }
  }, [timeLeft]);

  const handleVoteStart = () => {
    gameService.startVoting();
  };

  const handleReRandomize = () => {
    setIsReRandomizing(true);
    gameService.reRandomizeSecretWord();
    setShowReRandomizeConfirm(false);

    // Show brief success feedback
    setTimeout(() => {
      setIsReRandomizing(false);
    }, 1000);
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

        {/* Speaking Order Display */}
        {roomState.speakingOrder && roomState.speakingOrder.length > 0 && (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
              <span className="text-xs font-bold tracking-widest uppercase text-purple-400 dark:text-purple-300">
                Speaking Order
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {roomState.speakingOrder.map((playerId, index) => {
                const player = roomState.players.find(p => p.id === playerId);
                if (!player) return null;

                const isFirstSpeaker = index === 0;

                return (
                  <div
                    key={playerId}
                    className={`
                      flex items-center gap-3 p-2.5 rounded-xl border backdrop-blur-sm transition-all
                      ${isFirstSpeaker
                        ? 'bg-purple-100/80 dark:bg-purple-900/40 border-purple-300 dark:border-purple-500/40 shadow-md'
                        : 'bg-white/40 dark:bg-slate-800/40 border-white/40 dark:border-white/10'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-7 h-7 rounded-full font-black text-xs
                      ${isFirstSpeaker
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }
                    `}>
                      {index + 1}
                    </div>

                    <span className="text-2xl filter drop-shadow-sm">{player.avatar}</span>

                    <div className="flex-1">
                      <span className="font-bold text-sm text-slate-800 dark:text-white">
                        {player.name}
                      </span>
                      {isFirstSpeaker && (
                        <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          First Speaker
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Admin Re-Randomize Button */}
      {isAdmin && (
        <div className="space-y-3">
          <Button
            fullWidth
            onClick={() => setShowReRandomizeConfirm(true)}
            variant="secondary"
            className="shadow-lg"
            disabled={isReRandomizing}
          >
            <RefreshCw size={16} className={isReRandomizing ? 'animate-spin' : ''} />
            {isReRandomizing ? 'Re-randomizing...' : 'Re-Randomize Secret Word'}
          </Button>

          <Button fullWidth onClick={handleVoteStart} variant="primary" className="shadow-xl">
            Start Voting
          </Button>
        </div>
      )}

      {!isAdmin && (
        <Button fullWidth onClick={handleVoteStart} variant="primary" className="shadow-xl">
          Start Voting
        </Button>
      )}

      {/* Confirmation Dialog */}
      {showReRandomizeConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/10 animate-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw size={32} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                Re-Randomize Secret Word?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This will assign a new secret word to all players while keeping their roles intact. Use this if players accidentally got the same word.
              </p>
            </div>

            <div className="space-y-2">
              <Button fullWidth onClick={handleReRandomize} variant="primary">
                Yes, Re-Randomize
              </Button>
              <Button
                fullWidth
                onClick={() => setShowReRandomizeConfirm(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};