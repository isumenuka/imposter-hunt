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
        <div className="flex flex-col h-full p-6 overflow-y-auto w-full">
            {/* Header Banner */}
            <div className={`
            p-8 rounded-3xl text-center mb-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]
            ${impostersWon
                    ? 'bg-gradient-to-br from-red-500 to-rose-700'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-700'}
        `}>
                {/* Confetti or particles could go here */}
                <div className="relative z-10">
                    <div className="mb-4">
                        {impostersWon ? (
                            <Eye size={72} className="text-white animate-bounce" strokeWidth={2.5} />
                        ) : (
                            <Trophy size={72} className="text-yellow-300 animate-bounce" strokeWidth={2.5} />
                        )}
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter filter drop-shadow-md">
                        {impostersWon ? 'IMPOSTERS WIN!' : 'INNOCENTS WIN!'}
                    </h1>
                    <p className="text-white/90 font-medium mt-2 text-sm bg-black/20 px-4 py-1 rounded-full inline-block backdrop-blur-sm">
                        {impostersWon
                            ? (votedOutPlayer ? `${votedOutPlayer.name} was Innocent` : 'No one was caught')
                            : 'The Imposter was caught'}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-4 mb-8">
                <div className="bg-white/40 dark:bg-slate-800/40 p-5 rounded-2xl border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
                    <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 text-center">Voted Out</h3>
                    {votedOutPlayer ? (
                        <div className="flex flex-col items-center">
                            <span className="text-5xl mb-2 filter drop-shadow-md">{votedOutPlayer.avatar}</span>
                            <span className="font-bold text-lg text-slate-900 dark:text-white">{votedOutPlayer.name}</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold mt-1 ${votedOutPlayer.role === 'imposter' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                                {votedOutPlayer.role === 'imposter' ? 'IMPOSTER' : 'INNOCENT'}
                            </span>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 dark:text-slate-400 italic font-medium">No one was voted out</div>
                    )}
                </div>

                <div className="bg-white/40 dark:bg-slate-800/40 p-5 rounded-2xl border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
                    <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 text-center">The Imposters</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {imposters.map(imp => (
                            <div key={imp.id} className="flex flex-col items-center bg-white/50 dark:bg-black/30 p-3 rounded-xl border border-red-200 dark:border-red-900/30">
                                <span className="text-3xl mb-1 filter drop-shadow-sm">{imp.avatar}</span>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{imp.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-2xl border border-white/40 dark:border-white/10 text-center shadow-lg">
                    <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Secret Word</h3>
                    <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">{roomState.config.word}</p>
                </div>
            </div>

            {isHost ? (
                <Button fullWidth onClick={() => gameService.resetGame()} variant="primary" className="shadow-xl">
                    ↺ Play Again
                </Button>
            ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 animate-pulse py-4 text-sm font-medium">
                    Waiting for host to start new game...
                </div>
            )}
        </div>
    );
};