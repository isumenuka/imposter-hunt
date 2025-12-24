import React, { useEffect, useState } from 'react';
import { gameService } from './services/gameService';
import { RoomState, GamePhase } from './types';
import { Lobby } from './components/Lobby';
import { GameSettings } from './components/GameSettings';
import { SecretReveal } from './components/SecretReveal';
import { Discussion } from './components/Discussion';
import { Voting } from './components/Voting';
import { Results } from './components/Results';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  useEffect(() => {
    const unsubscribe = gameService.subscribe((state) => {
      setRoomState(state);
    });
    return unsubscribe;
  }, []);



  if (!roomState) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  let currentPlayer = null;
  const isOffline = roomState.gameMode === 'OFFLINE';

  if (isOffline) {
      if (roomState.phase === GamePhase.LOBBY) {
          currentPlayer = null; 
      } else {
          currentPlayer = roomState.players.find(p => p.id === roomState.activePlayerId) || roomState.players[0];
      }
  } else {
      const myId = gameService.getPlayerId();
      currentPlayer = roomState.players.find(p => p.id === myId) || null;
  }

  // --- CONTENT RENDERER ---
  const renderContent = () => {
    // Interstitial Screen (Pass Phone)
    if (isOffline && roomState.isTurnHidden && roomState.phase !== GamePhase.DISCUSSION && roomState.phase !== GamePhase.RESULTS && currentPlayer) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 animate-in fade-in">
                 <div className="text-center space-y-4">
                     <p className="text-slate-400 uppercase tracking-widest text-sm font-bold">Pass Device To</p>
                     <div className="text-8xl animate-bounce filter drop-shadow-xl">{currentPlayer.avatar}</div>
                     <h1 className="text-4xl font-black text-white">{currentPlayer.name}</h1>
                 </div>
                 
                 <div className="p-6 bg-slate-800/50 rounded-3xl border border-white/10 text-center max-w-xs backdrop-blur-md shadow-xl">
                     <p className="text-slate-300 mb-6 font-medium">Ensure no one else is looking at the screen!</p>
                     <Button fullWidth onClick={() => gameService.revealTurn()}>
                         I am {currentPlayer.name}
                     </Button>
                 </div>
            </div>
        );
    }

    switch (roomState.phase) {
      case GamePhase.LOBBY:
        return <Lobby roomState={roomState} currentPlayer={currentPlayer} />;

      case GamePhase.SETTINGS:
        const isHost = isOffline ? true : !!currentPlayer?.isHost;
        return (
            <GameSettings
                isHost={isHost}
                config={roomState.config}
                playerCount={roomState.players.length}
                error={roomState.error}
                roomState={roomState}
            />
        );

      case GamePhase.REVEAL:
        if (!currentPlayer) return <div>Error: Player not found</div>;
        return (
          <SecretReveal 
            player={currentPlayer} 
            secretWord={roomState.config.word} 
            imposterClue={roomState.config.imposterClue}
          />
        );

      case GamePhase.DISCUSSION:
        if (!currentPlayer) return <div>Error: Player not found</div>;
        return <Discussion roomState={roomState} currentPlayer={currentPlayer} />;

      case GamePhase.VOTING:
        if (!currentPlayer) return <div>Error: Player not found</div>;
        return <Voting roomState={roomState} currentPlayer={currentPlayer} />;

      case GamePhase.RESULTS:
        return <Results roomState={roomState} />;

      default:
        return <div>Unknown Phase</div>;
    }
  };

  return (
    <div className="dark">
      <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden transition-colors duration-500 font-sans text-white">
        
        {/* === LIQUID BACKGROUND BLOB ANIMATIONS === */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600/40 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-600/40 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-600/40 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        {/* === MAIN CONTENT CONTAINER === */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
            
            {/* Glass Card */}
            <div className="w-full max-w-lg glass-panel rounded-[3rem] shadow-2xl overflow-hidden h-[85vh] md:h-[800px] relative flex flex-col transition-all duration-300">
                 {/* Header Phase Indicator */}
                {roomState.phase !== GamePhase.LOBBY && (
                    <div className="absolute top-4 left-0 w-full text-center z-20 pointer-events-none">
                         <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase text-slate-300 backdrop-blur-sm border border-white/10 shadow-lg">
                            {roomState.phase.replace('_', ' ')} {isOffline ? '• OFFLINE' : ''}
                         </span>
                    </div>
                )}

                {/* Render Phase Content */}
                {renderContent()}
            </div>

            {/* Footer Credit */}
            <div className="mt-6 text-xs font-medium text-slate-400 text-center opacity-60">
                Imposter Hunt • Multiplayer Party Game
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;