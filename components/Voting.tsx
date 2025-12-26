import React, { useState } from 'react';
import { Player, RoomState } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';
import { CheckCircle2, Inbox, Lock, Eye, EyeOff, ArrowRight, Users, Vote } from 'lucide-react';
import { ChatBox } from './ChatBox';

interface Props {
  roomState: RoomState;
  currentPlayer: Player;
}

export const Voting: React.FC<Props> = ({ roomState, currentPlayer }) => {
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [showWord, setShowWord] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleVote = () => {
    if (selectedSuspect && currentPlayer) {
      gameService.castVote(currentPlayer.id, selectedSuspect);
      setConfirming(false);
    }
  };

  const hasVoted = !!currentPlayer.vote;
  const allVoted = roomState.players.every(p => !!p.vote);

  // Build vote map: playerId -> array of voters
  const voteMap: Record<string, Player[]> = {};
  roomState.players.forEach(player => {
    if (player.vote) {
      if (!voteMap[player.vote]) {
        voteMap[player.vote] = [];
      }
      voteMap[player.vote].push(player);
    }
  });

  // Count votes for each player
  const voteCounts: Record<string, number> = {};
  roomState.players.forEach(p => {
    if (p.vote) {
      voteCounts[p.vote] = (voteCounts[p.vote] || 0) + 1;
    }
  });

  if (hasVoted) {
    const notVoted = roomState.players.filter(p => !p.vote);
    const votedCount = roomState.players.filter(p => !!p.vote).length;

    return (
      <div className="flex flex-col h-full p-4 sm:p-6 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="flex-1 flex flex-col items-center justify-start space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-900/40 px-4 py-2 rounded-full border border-blue-500/30">
              <Vote size={20} className="text-blue-400" />
              <span className="text-sm font-bold text-blue-300 uppercase tracking-wider">Voting in Progress</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Vote Submitted</h2>
            <p className="text-slate-400 text-sm">Waiting for others to vote...</p>
          </div>

          {/* Progress */}
          <div className="w-full max-w-md">
            <div className="bg-slate-800/60 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 relative"
                style={{ width: `${(votedCount / roomState.players.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2 text-center font-semibold">
              {votedCount} / {roomState.players.length} players voted
            </p>
          </div>

          {/* Voting Grid - Among Us Style */}
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {roomState.players.map(player => {
                const voters = voteMap[player.id] || [];
                const voteCount = voteCounts[player.id] || 0;
                const playerVoted = !!player.vote;

                return (
                  <div
                    key={player.id}
                    className={`relative bg-slate-800/80 rounded-2xl p-4 border-2 transition-all ${voteCount > 0
                      ? 'border-red-500/60 bg-red-900/20'
                      : 'border-slate-700/50'
                      }`}
                  >
                    {/* Vote Count Badge */}
                    {voteCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-black text-sm shadow-lg border-2 border-slate-900 z-10">
                        {voteCount}
                      </div>
                    )}

                    {/* Player Info */}
                    <div className="flex flex-col items-center space-y-2">
                      {/* Avatar */}
                      <div className={`text-5xl ${!playerVoted ? 'opacity-50 grayscale' : ''}`}>
                        {player.avatar}
                      </div>

                      {/* Name */}
                      <div className="text-center w-full">
                        <p className="font-bold text-sm text-white truncate">
                          {player.name}
                        </p>
                        {player.id === currentPlayer.id && (
                          <p className="text-xs text-blue-400 font-semibold">(You)</p>
                        )}
                      </div>

                      {/* Voted Status */}
                      {playerVoted ? (
                        <div className="flex items-center gap-1 bg-green-900/40 px-2 py-1 rounded-full border border-green-500/30">
                          <CheckCircle2 size={12} className="text-green-400" />
                          <span className="text-xs text-green-300 font-semibold">Voted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-slate-700/40 px-2 py-1 rounded-full border border-slate-600/30">
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-slate-400 font-semibold">Waiting</span>
                        </div>
                      )}

                      {/* Voter Emojis - Among Us Style */}
                      {voters.length > 0 && (
                        <div className="w-full mt-2 pt-2 border-t border-slate-700">
                          <p className="text-xs text-slate-500 font-semibold mb-1 text-center">
                            Voted by:
                          </p>
                          <div className="flex flex-wrap justify-center gap-1">
                            {voters.map(voter => (
                              <div
                                key={voter.id}
                                className="text-2xl filter drop-shadow-lg"
                                title={voter.name}
                              >
                                {voter.avatar}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Not Voted List */}
          {notVoted.length > 0 && (
            <div className="w-full max-w-md bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 text-center">
                Still Deciding ({notVoted.length})
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {notVoted.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 bg-slate-700/40 px-3 py-1.5 rounded-lg border border-slate-600/30"
                  >
                    <span className="text-lg">{p.avatar}</span>
                    <span className="text-xs text-slate-300 font-medium">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Box - Only in Online Mode */}
        {roomState.gameMode === 'ONLINE' && <ChatBox roomState={roomState} currentPlayer={currentPlayer} />}
      </div>
    );
  }

  // === VOTING UI - Among Us Style ===
  return (
    <div className="flex flex-col h-full p-4 sm:p-6 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Word Reminder Section - Only in Online Mode */}
      {roomState.gameMode === 'ONLINE' && (
        <div className="w-full bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 shadow-lg backdrop-blur-md mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
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
            <div className={`text-2xl font-black text-white text-center py-2 transition-all ${showWord ? '' : 'blur-md select-none'}`}>
              {currentPlayer.role === 'innocent'
                ? roomState.config.word
                : (roomState.config.imposterClueEnabled && roomState.config.associationWord
                  ? roomState.config.associationWord
                  : '(No Clue)')}
            </div>
            {!showWord && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-400 bg-slate-700/80 px-3 py-1 rounded-full">
                  Click Show to reveal
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 bg-red-900/40 px-4 py-2 rounded-full border border-red-500/30">
          <Vote size={20} className="text-red-400" />
          <span className="text-sm font-bold text-red-300 uppercase tracking-wider">Emergency Meeting</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Who is the Imposter?</h2>
        <p className="text-slate-400 text-sm">Vote for the player you suspect</p>
      </div>

      {/* Voting Grid - Among Us Style */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {roomState.players.map(player => {
            const isSelected = selectedSuspect === player.id;
            const isCurrentPlayer = player.id === currentPlayer.id;

            return (
              <button
                key={player.id}
                onClick={() => !isCurrentPlayer && setSelectedSuspect(player.id)}
                disabled={isCurrentPlayer}
                className={`relative bg-slate-800/80 rounded-2xl p-4 border-2 transition-all duration-200 ${isSelected
                  ? 'border-red-500 bg-red-900/30 scale-105 shadow-xl shadow-red-500/20'
                  : isCurrentPlayer
                    ? 'border-slate-700/30 opacity-50 cursor-not-allowed'
                    : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/90'
                  }`}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 z-10">
                    <CheckCircle2 size={18} strokeWidth={3} />
                  </div>
                )}

                {/* Player Info */}
                <div className="flex flex-col items-center space-y-2">
                  {/* Avatar */}
                  <div className="text-5xl">
                    {player.avatar}
                  </div>

                  {/* Name */}
                  <div className="text-center w-full">
                    <p className="font-bold text-sm text-white truncate">
                      {player.name}
                    </p>
                    {isCurrentPlayer && (
                      <p className="text-xs text-blue-400 font-semibold">(You)</p>
                    )}
                  </div>

                  {/* Status */}
                  {isCurrentPlayer ? (
                    <div className="bg-slate-700/40 px-3 py-1 rounded-full border border-slate-600/30">
                      <span className="text-xs text-slate-400 font-semibold">Can't vote self</span>
                    </div>
                  ) : isSelected ? (
                    <div className="bg-red-500/20 px-3 py-1 rounded-full border border-red-500/50">
                      <span className="text-xs text-red-300 font-semibold">Selected</span>
                    </div>
                  ) : (
                    <div className="bg-slate-700/20 px-3 py-1 rounded-full border border-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-slate-400 font-semibold">Click to vote</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vote Button */}
      <div className="mt-auto pt-4">
        {selectedSuspect && !confirming && (
          <Button
            fullWidth
            onClick={() => setConfirming(true)}
            variant="danger"
            className="shadow-xl animate-pulse"
          >
            <span className="flex items-center gap-2 justify-center">
              <Lock size={18} />
              Confirm Vote for {roomState.players.find(p => p.id === selectedSuspect)?.name}
            </span>
          </Button>
        )}

        {confirming && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-center">
              <p className="text-white font-bold mb-2">Are you sure?</p>
              <p className="text-sm text-slate-300">
                You're voting for <span className="font-bold text-red-400">{roomState.players.find(p => p.id === selectedSuspect)?.name}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setConfirming(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVote}
                variant="danger"
                className="shadow-xl"
              >
                <Lock size={18} />
                Lock Vote
              </Button>
            </div>
          </div>
        )}

        {!selectedSuspect && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-sm font-semibold">
              Select a player to vote
            </p>
          </div>
        )}
      </div>

      {/* Chat Box - Only in Online Mode */}
      {roomState.gameMode === 'ONLINE' && <ChatBox roomState={roomState} currentPlayer={currentPlayer} />}
    </div>
  );
};