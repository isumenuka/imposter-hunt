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
      <div className="flex flex-col items-center justify-center h-full p-3 sm:p-4 animate-in zoom-in duration-300">
        <div className="bg-blue-900/30 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wider text-blue-400 mb-4 sm:mb-6 border border-blue-800/40">
          RANDOM SELECTION
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-white">First to Speak</h1>
        <p className="text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 font-normal">Discussion starts with...</p>

        <div className="bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col items-center backdrop-blur-sm">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">{firstSpeaker?.avatar}</div>
          <div className="bg-slate-900/60 px-4 py-1.5 sm:px-6 sm:py-2 rounded-xl font-black text-xl sm:text-2xl text-white border border-slate-700/50">
            {firstSpeaker?.name}
          </div>
        </div>
      </div>
    );
  }

  // Main Timer Screen
  return (
    <div className="flex flex-col h-full p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-start space-y-4 sm:space-y-6 md:space-y-8 py-4 max-w-2xl mx-auto w-full">
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

        <div className="text-center">
          <MessageCircle size={40} className="mb-2 sm:mb-3 text-purple-500" strokeWidth={2} />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Discussion</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-normal">Describe your word, find the liar</p>
        </div>

        <div className="relative w-60 h-28 sm:w-64 sm:h-32 flex items-center justify-center bg-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <div className="text-5xl sm:text-6xl font-black tracking-tighter tabular-nums text-white font-mono">
            {formatTime(timeLeft)}
          </div>
          <div className="absolute -bottom-2 text-[9px] sm:text-[10px] font-semibold bg-black/70 text-white px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
            TIME LEFT
          </div>
        </div>

        {/* Speaking Order Display */}
        {roomState.speakingOrder && roomState.speakingOrder.length > 0 && (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
              <span className="text-xs font-bold tracking-widest uppercase text-purple-300">
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
                        ? 'bg-purple-900/50 border-purple-500/50 shadow-md'
                        : 'bg-slate-800/50 border-slate-700/40'
                      }
                    `}
                  >
                    <div className={`
                      flex items-center justify-center w-7 h-7 rounded-full font-black text-xs
                      ${isFirstSpeaker
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-slate-700 text-slate-300'
                      }
                    `}>
                      {index + 1}
                    </div>

                    <span className="text-lg sm:text-xl">{player.avatar}</span>

                    <div className="flex-1">
                      <span className="font-bold text-sm text-white">
                        {player.name}
                      </span>
                      {isFirstSpeaker && (
                        <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
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
        <div className="space-y-3 max-w-2xl mx-auto w-full">
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
          <div className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-700/50 animate-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw size={32} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                Re-Randomize Secret Word?
              </h3>
              <p className="text-sm text-slate-400">
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