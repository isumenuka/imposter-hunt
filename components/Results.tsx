import React, { useEffect } from 'react';
import { RoomState } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';
import { Trophy, Eye } from 'lucide-react';
import { soundManager } from '../utils/sounds';

interface Props {
    roomState: RoomState;
}

export const Results: React.FC<Props> = ({ roomState }) => {
    const impostersWon = roomState.winners === 'imposter';
    const imposters = roomState.players.filter(p => p.role === 'imposter');

    const myId = gameService.getPlayerId();
    const isHost = roomState.gameMode === 'OFFLINE' || roomState.players.find(p => p.id === myId)?.isHost;

    const myPlayer = roomState.players.find(p => p.id === myId);
    const iWon = (myPlayer?.role === 'imposter' && impostersWon) || (myPlayer?.role === 'innocent' && !impostersWon);

    // Play victory or defeat sound when results appear
    useEffect(() => {
        setTimeout(() => {
            if (iWon) {
                soundManager.playVictory();
            } else {
                soundManager.playDefeat();
            }
        }, 300);
    }, [iWon]);

    const votes: Record<string, number> = {};
    roomState.players.forEach(p => { if (p.vote) votes[p.vote] = (votes[p.vote] || 0) + 1; });
    let maxVotes = 0;
    let votedOutId: string | null = null;
    let tie = false;
    Object.entries(votes).forEach(([id, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            votedOutId = id;
            tie = false;
        } else if (count === maxVotes) {
            tie = true;
        }
    });

    const votedOutPlayer = !tie && votedOutId ? roomState.players.find(p => p.id === votedOutId) : null;

    return (
        <div className="flex flex-col h-full p-3 sm:p-4 overflow-y-auto w-full">
            {/* Header Banner */}
            <div className={`
            p-4 sm:p-6 rounded-2xl text-center mb-4 sm:mb-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[140px] sm:min-h-[180px]
            ${impostersWon
                    ? 'bg-gradient-to-br from-red-600 to-rose-800'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-800'}
        `}>
                <div className="relative z-10">
                    <div className="mb-2 sm:mb-3">
                        {impostersWon ? (
                            <Eye size={48} className="text-white animate-bounce sm:w-14 sm:h-14" strokeWidth={2} />
                        ) : (
                            <Trophy size={48} className="text-yellow-300 animate-bounce sm:w-14 sm:h-14" strokeWidth={2} />
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                        {impostersWon ? 'IMPOSTERS WIN!' : 'INNOCENTS WIN!'}
                    </h1>
                    <p className="text-white/80 font-normal mt-1 text-[10px] sm:text-xs bg-black/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full inline-block backdrop-blur-sm">
                        {impostersWon
                            ? (votedOutPlayer ? `${votedOutPlayer.name} was Innocent` : 'No one was caught')
                            : 'The Imposter was caught'}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                    <h3 className="text-slate-600 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-2 sm:mb-3 text-center">Voted Out</h3>
                    {votedOutPlayer ? (
                        <div className="flex flex-col items-center">
                            <span className="text-3xl sm:text-4xl mb-1 sm:mb-1.5">{votedOutPlayer.avatar}</span>
                            <span className="font-bold text-sm sm:text-base text-white">{votedOutPlayer.name}</span>
                            <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-semibold mt-0.5 sm:mt-1 ${votedOutPlayer.role === 'imposter' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'}`}>
                                {votedOutPlayer.role === 'imposter' ? 'IMPOSTER' : 'INNOCENT'}
                            </span>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 text-xs italic font-normal">No one was voted out</div>
                    )}
                </div>

                {/* Vote Breakdown Section */}
                <div className="bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                    <h3 className="text-slate-600 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-2 sm:mb-3 text-center">Vote Breakdown</h3>

                    {Object.keys(votes).length > 0 ? (
                        <div className="space-y-2">
                            {Object.entries(votes)
                                .sort(([, a], [, b]) => b - a) // Sort by vote count (descending)
                                .map(([playerId, voteCount]) => {
                                    const player = roomState.players.find(p => p.id === playerId);
                                    if (!player) return null;

                                    const percentage = (voteCount / roomState.players.length) * 100;

                                    return (
                                        <div key={playerId} className="bg-white/20 dark:bg-slate-800/40 p-2 sm:p-2.5 rounded-lg">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                                    <span className="text-lg sm:text-xl flex-shrink-0">{player.avatar}</span>
                                                    <span className="font-bold text-xs sm:text-sm text-white truncate">{player.name}</span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-black text-white flex-shrink-0 ml-2">
                                                    {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                                                </span>
                                            </div>

                                            {/* Vote Progress Bar */}
                                            <div className="w-full bg-slate-700/50 h-1.5 sm:h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 text-xs italic font-normal">No votes were cast</div>
                    )}
                </div>

                <div className="bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                    <h3 className="text-slate-600 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-2 sm:mb-3 text-center">The Imposters</h3>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {imposters.map(imp => (
                            <div key={imp.id} className="flex flex-col items-center bg-slate-800/50 p-2 sm:p-2.5 rounded-lg border border-red-900/30">
                                <span className="text-2xl sm:text-3xl mb-0.5 sm:mb-1">{imp.avatar}</span>
                                <span className="font-semibold text-white text-[10px] sm:text-xs">{imp.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/70 p-3 sm:p-4 rounded-xl border border-slate-700/50 text-center">
                    <h3 className="text-slate-600 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-1 sm:mb-1.5">Secret Word</h3>
                    <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">{roomState.config.word}</p>
                </div>

                {roomState.config.imposterClueEnabled && roomState.config.associationWord && (
                    <div className="bg-slate-900/70 p-3 sm:p-4 rounded-xl border border-slate-700/50 text-center">
                        <h3 className="text-slate-600 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-1 sm:mb-1.5">Imposter Clue</h3>
                        <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">{roomState.config.associationWord}</p>
                    </div>
                )}
            </div>

            {isHost ? (
                <Button fullWidth onClick={() => gameService.resetGame()} variant="primary" className="shadow-xl">
                    ↺ Play Again
                </Button>
            ) : (
                <div className="text-center text-slate-400 animate-pulse py-4 text-sm font-medium">
                    Waiting for host to start new game...
                </div>
            )}
        </div>
    );
};