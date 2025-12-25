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
import { Credits } from './components/Credits';
import { Gamepad2 } from 'lucide-react';

const App: React.FC = () => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  useEffect(() => {
    const unsubscribe = gameService.subscribe((state) => {
      setRoomState(state);
    });
    return unsubscribe;
  }, []);

  // PWA Install Prompt Handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt after 3 seconds on first visit
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
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

  // --- PWA INSTALL HANDLER ---
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // --- CONTENT RENDERER ---
  const renderContent = () => {
    // Interstitial Screen (Pass Phone)
    if (isOffline && roomState.isTurnHidden && roomState.phase !== GamePhase.DISCUSSION && roomState.phase !== GamePhase.RESULTS && currentPlayer) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in">
          <div className="text-center space-y-2 sm:space-y-3">
            <p className="text-slate-400 uppercase tracking-widest text-xs sm:text-sm font-bold">Pass Device To</p>
            <div className="text-5xl sm:text-6xl md:text-7xl animate-bounce filter drop-shadow-xl">{currentPlayer.avatar}</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{currentPlayer.name}</h1>
          </div>

          <div className="p-4 sm:p-6 bg-slate-800/50 rounded-2xl sm:rounded-3xl border border-white/10 text-center max-w-xs backdrop-blur-md shadow-xl">
            <p className="text-slate-300 mb-4 sm:mb-6 font-medium text-sm sm:text-base">Ensure no one else is looking at the screen!</p>
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
        if (!currentPlayer) {
          gameService.resetToInitialState();
          return <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-slate-500 dark:text-slate-400">Returning to lobby...</p>
          </div>;
        }
        return (
          <SecretReveal
            player={currentPlayer}
            secretWord={roomState.config.word}
            associationWord={roomState.config.associationWord}
          />
        );

      case GamePhase.DISCUSSION:
        if (!currentPlayer) {
          gameService.resetToInitialState();
          return <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-slate-500 dark:text-slate-400">Returning to lobby...</p>
          </div>;
        }
        return <Discussion roomState={roomState} currentPlayer={currentPlayer} />;

      case GamePhase.VOTING:
        if (!currentPlayer) {
          gameService.resetToInitialState();
          return <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-slate-500 dark:text-slate-400">Returning to lobby...</p>
          </div>;
        }
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
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 md:p-8">

          {/* Glass Card */}
          <div className="w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl glass-panel rounded-none sm:rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden min-h-screen sm:min-h-[600px] md:h-[800px] relative flex flex-col transition-all duration-300">
            {/* Header Phase Indicator */}
            {roomState.phase !== GamePhase.LOBBY && (
              <div className="absolute top-4 left-0 w-full text-center z-20 pointer-events-none">
                <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/10 rounded-full text-xs sm:text-[10px] font-bold tracking-widest uppercase text-slate-300 backdrop-blur-sm border border-white/10 shadow-lg inline-block">
                  {roomState.phase.replace('_', ' ')} {isOffline ? '• OFFLINE' : ''}
                </span>
              </div>
            )}

            {/* Render Phase Content */}
            {renderContent()}
          </div>

          {/* Footer Credit */}
          <button
            onClick={() => setShowCredits(true)}
            className="mt-6 text-xs font-medium text-slate-400 hover:text-purple-400 transition-colors duration-300 text-center opacity-60 hover:opacity-100 group relative"
          >
            <span className="relative z-10 flex items-center gap-1.5 justify-center">
              <Gamepad2 size={16} className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />
              <span>Imposter Hunt</span>
              <span className="text-[10px] opacity-50">•</span>
              <span className="text-[10px] opacity-50 group-hover:opacity-100 transition-opacity">Click for credits</span>
            </span>
            <div className="absolute inset-0 bg-purple-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          {/* PWA Install Prompt */}
          {showInstallPrompt && deferredPrompt && (
            <div className="install-prompt">
              <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-4 max-w-sm mx-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1">Install App</p>
                  <p className="text-xs text-slate-300">Add to home screen for better experience</p>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Credits Modal */}
        {showCredits && <Credits onClose={() => setShowCredits(false)} />}
      </div>
    </div>
  );
};

export default App;