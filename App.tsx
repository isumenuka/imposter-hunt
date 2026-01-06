import React, { useEffect, useState } from 'react';
import { gameService } from './services/gameService';
import { RoomState, GamePhase } from './types';
import { Lobby } from './components/Lobby';
import { GameSettings } from './components/GameSettings';
import { SecretReveal } from './components/SecretReveal';
import { Discussion } from './components/Discussion';
import { Voting } from './components/Voting';
import { Results } from './components/Results';
import { ChatBox } from './components/ChatBox';
import { Button } from './components/Button';
import { Credits } from './components/Credits';
import { Gamepad2 } from 'lucide-react';
import Squares from './components/Squares';

const App: React.FC = () => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showReconnectionBanner, setShowReconnectionBanner] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);

  useEffect(() => {
    const unsubscribe = gameService.subscribe((state) => {
      setRoomState(state);
    });
    return unsubscribe;
  }, []);

  // Detect room code from URL parameter for shareable links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('room');

    if (roomCode) {
      // Store the room code for auto-join
      sessionStorage.setItem('auto_join_room', roomCode.toUpperCase());

      // Clean up URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
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

  // Monitor connection status and show reconnection banner
  useEffect(() => {
    if (roomState && roomState.gameMode === 'ONLINE') {
      // If we detect disconnection during an active game (not in lobby)
      if (roomState.connectionStatus === 'DISCONNECTED' && roomState.players.length > 0 && roomState.phase !== 'LOBBY') {
        setShowReconnectionBanner(true);
        setWasDisconnected(true);
      }
      // If reconnected after being disconnected, briefly show success then hide
      else if (roomState.connectionStatus === 'CONNECTED' && wasDisconnected) {
        setTimeout(() => {
          setShowReconnectionBanner(false);
          setWasDisconnected(false);
        }, 3000); // Show success message for 3 seconds
      }
    }
  }, [roomState?.connectionStatus, roomState?.gameMode, wasDisconnected]);



  if (!roomState) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
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
        <div className="flex flex-col items-center justify-center h-full p-3 sm:p-4 space-y-3 sm:space-y-4 animate-in fade-in">
          <div className="text-center space-y-1.5 sm:space-y-2">
            <p className="text-slate-500 uppercase tracking-wider text-[10px] sm:text-xs font-semibold">Pass Device To</p>
            <div className="text-3xl sm:text-4xl animate-bounce">{currentPlayer.avatar}</div>
            <h1 className="text-lg sm:text-xl font-bold text-white">{currentPlayer.name}</h1>
          </div>

          <div className="p-3 sm:p-4 bg-slate-900/70 rounded-xl sm:rounded-2xl border border-white/5 text-center max-w-xs backdrop-blur-sm">
            <p className="text-slate-400 mb-3 sm:mb-4 font-normal text-xs sm:text-sm">Ensure no one else is looking</p>
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
            roomState={roomState}
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
      <div className="relative min-h-screen w-full bg-slate-900 overflow-hidden transition-colors duration-300 font-sans text-white">

        {/* === ANIMATED SQUARES BACKGROUND === */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Squares
            speed={0.5}
            squareSize={40}
            direction='diagonal'
            borderColor='rgba(139, 92, 246, 0.15)'
            hoverFillColor='rgba(139, 92, 246, 0.05)'
          />
        </div>

        {/* === MAIN CONTENT CONTAINER === */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-1 sm:p-3 md:p-6">

          {/* Glass Card */}
          <div className="w-full max-w-full sm:max-w-md md:max-w-lg glass-panel rounded-none sm:rounded-2xl md:rounded-3xl shadow-xl overflow-hidden min-h-screen sm:min-h-[500px] md:h-[700px] relative flex flex-col transition-all duration-200">
            {/* Header Phase Indicator */}
            {roomState.phase !== GamePhase.LOBBY && (
              <div className="absolute top-2 left-0 w-full text-center z-20 pointer-events-none">
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/5 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase text-slate-400 backdrop-blur-sm border border-white/5 inline-block">
                  {roomState.phase.replace('_', ' ')} {isOffline ? '• OFFLINE' : ''}
                </span>
              </div>
            )}

            {/* Render Phase Content */}
            {renderContent()}
          </div>

          {/* Chat Box - Only in online mode */}
          {roomState.gameMode === 'ONLINE' &&
            currentPlayer &&
            (roomState.phase === GamePhase.LOBBY ||
              roomState.phase === GamePhase.DISCUSSION ||
              roomState.phase === GamePhase.VOTING) && (
              <ChatBox roomState={roomState} currentPlayer={currentPlayer} />
            )}

          {/* Reconnection Banner */}
          {showReconnectionBanner && roomState.gameMode === 'ONLINE' && (
            <div className={`fixed bottom-20 left-0 right-0 mx-auto max-w-sm px-4 z-50 animate-in slide-in-from-bottom-4 fade-in`}>
              <div className={`glass-panel rounded-2xl p-4 border ${roomState.connectionStatus === 'CONNECTED'
                ? 'border-green-500/50 bg-green-900/20'
                : 'border-yellow-500/50 bg-yellow-900/20'} shadow-2xl`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${roomState.connectionStatus === 'CONNECTED'
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-yellow-500 animate-pulse'}`}></div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${roomState.connectionStatus === 'CONNECTED'
                      ? 'text-green-300' : 'text-yellow-300'}`}>
                      {roomState.connectionStatus === 'CONNECTED' ? '✓ Reconnected!' : '⚠ Connection Lost'}
                    </p>
                    <p className="text-xs text-slate-300">
                      {roomState.connectionStatus === 'CONNECTED'
                        ? 'You\'re back in the game'
                        : 'Attempting to reconnect...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Credit */}
          <button
            onClick={() => setShowCredits(true)}
            className="mt-3 text-[10px] font-normal text-slate-500 hover:text-purple-500 transition-colors duration-200 text-center opacity-50 hover:opacity-100 group relative"
          >
            <span className="relative z-10 flex items-center gap-1 justify-center">
              <Gamepad2 size={12} className="text-purple-500 group-hover:scale-105 transition-transform duration-200" />
              <span>Imposter Hunt</span>
              <span className="text-[8px] opacity-40">•</span>
              <span className="text-[8px] opacity-40 group-hover:opacity-80 transition-opacity">Credits</span>
            </span>
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