import React, { useState } from 'react';
import { Player, RoomState } from '../types';
import { gameService } from '../services/gameService';
import { Button } from './Button';
import { Users, User, X, UserPlus, Shield, Copy, Check } from 'lucide-react';
import SplitText from './SplitText';

interface Props {
  roomState: RoomState;
  currentPlayer: Player | null;
}

export const Lobby: React.FC<Props> = ({ roomState, currentPlayer }) => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'MAIN' | 'JOIN_INPUT'>('MAIN');
  const [inputCode, setInputCode] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inputClass = "w-full bg-slate-800/60 p-2.5 sm:p-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-sm border border-slate-700/50 transition-all";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomState.roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareLink = `${window.location.origin}/?room=${roomState.roomCode}`;
      await navigator.clipboard.writeText(shareLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Check for auto-join room code from URL
  React.useEffect(() => {
    const autoJoinRoom = sessionStorage.getItem('auto_join_room');
    if (autoJoinRoom && !currentPlayer && roomState.connectionStatus !== 'CONNECTED') {
      setInputCode(autoJoinRoom);
      setMode('JOIN_INPUT');
      sessionStorage.removeItem('auto_join_room');
    }
  }, []);

  // === OFFLINE MODE LOBBY ===
  if (roomState.gameMode === 'OFFLINE') {
    const canStart = roomState.players.length >= 3;

    const handleAddOfflinePlayer = () => {
      if (!name.trim()) return;
      gameService.addOfflinePlayer(name.trim(), '👤'); // Avatar still emoji for player identity
      setName('');
    };

    return (
      <div className="flex flex-col h-full p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            Offline Setup
          </h1>
          <Button variant="ghost" className="!p-1.5 text-[10px] sm:text-xs" onClick={() => gameService.resetToInitialState()}>Exit</Button>
        </div>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 p-1 scroll-smooth">
          {roomState.players.length === 0 && (
            <div className="text-center text-slate-500 dark:text-slate-400 py-6 sm:py-8 flex flex-col items-center">
              <Users size={24} className="mb-1.5 opacity-40 sm:w-8 sm:h-8" />
              <span className="text-[10px] sm:text-xs">Add at least 3 players to start</span>
            </div>
          )}
          <div className="space-y-2">
            {roomState.players.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border backdrop-blur-sm ${p.disconnected
                ? 'bg-slate-900/30 border-red-800/40 opacity-60'
                : 'bg-slate-800/60 border-slate-700/50'
                }`}>
                <div className="flex items-center flex-1 gap-2">
                  <span className={`text-lg ${p.disconnected ? 'opacity-50' : ''}`}>{p.avatar}</span>
                  <div className="flex flex-col flex-1">
                    <span className={`font-semibold text-xs ${p.disconnected ? 'text-slate-500' : 'text-white'}`}>
                      {p.name}
                    </span>
                    {p.disconnected && (
                      <span className="text-[9px] text-red-400 uppercase tracking-wide font-bold">
                        Disconnected
                      </span>
                    )}
                  </div>
                </div>
                {p.isHost && (
                  <div className="bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded text-[9px] font-bold border border-purple-700/50 uppercase tracking-wide">
                    Host
                  </div>
                )}
                <button
                  className="text-red-500 opacity-40 hover:opacity-100 px-1.5 transition-opacity"
                  onClick={() => gameService.removeOfflinePlayer(p.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Player Form */}
        <div className="bg-slate-800/40 p-2.5 sm:p-3 rounded-xl border border-slate-700/30 space-y-2 backdrop-blur-sm">
          <div className="flex gap-1.5 sm:gap-2">
            <input
              type="text"
              placeholder="Player Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddOfflinePlayer()}
              maxLength={12}
              className={`flex-1 ${inputClass}`}
            />
            <Button onClick={handleAddOfflinePlayer} disabled={!name.trim()} className="!py-2 !px-3 sm:!py-2.5 sm:!px-4 shadow-none">
              <UserPlus size={14} className="sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        <Button
          fullWidth
          disabled={!canStart}
          onClick={() => gameService.goToSettings()}
          className={canStart ? 'animate-pulse' : ''}
        >
          Continue ({roomState.players.length}) &rarr;
        </Button>
      </div>
    );
  }

  // === ONLINE LOBBY (Connected) ===
  if (currentPlayer && roomState.connectionStatus === 'CONNECTED') {
    const isHost = currentPlayer.isHost;
    const canStart = roomState.players.length >= 3;

    return (
      <div className="flex flex-col h-full p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="bg-slate-800/40 p-3 sm:p-4 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="!p-1.5 text-[10px] sm:text-xs"
                onClick={() => gameService.leaveRoom()}
              >
                ← Back
              </Button>
              <h1 className="text-base sm:text-lg font-bold text-white">Player Lobby</h1>
            </div>
            <div className="bg-slate-700/50 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-slate-300 border border-slate-600/50 flex items-center gap-1">
              <Users size={10} className="sm:w-3 sm:h-3" />
              {roomState.players.length}/12
            </div>
          </div>
          <div className="relative">
            <div className="text-center p-2.5 sm:p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 mb-2 sm:mb-3 relative overflow-hidden">
              <p className="text-slate-400 text-[9px] uppercase tracking-wider mb-0.5 font-semibold">Room Code</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-xl sm:text-2xl font-mono font-black text-purple-400 tracking-widest select-all relative z-10">{roomState.roomCode}</p>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 transition-all hover:scale-105 active:scale-95"
                  title="Copy room code"
                >
                  {copiedCode ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} className="text-slate-300" />
                  )}
                </button>
              </div>
              {copiedCode && (
                <div className="absolute top-0 right-0 m-2 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg animate-in fade-in slide-in-from-top-2">
                  Copied!
                </div>
              )}
            </div>

            {/* Share Link Button */}
            {isHost && (
              <button
                onClick={handleCopyLink}
                className="w-full mt-2 p-2.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/50 transition-all flex items-center justify-center gap-2 group"
              >
                {copiedLink ? (
                  <>
                    <Check size={16} className="text-green-400" />
                    <span className="text-sm font-bold text-green-400">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-purple-300 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-purple-300">Share Lobby Link</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500"
              style={{ width: `${Math.min((roomState.players.length / 3) * 100, 100)}%` }}
            />
          </div>
          <p className={`text-[10px] font-semibold text-center ${canStart ? 'text-green-400' : 'text-red-400'}`}>
            {canStart ? 'Ready!' : `${3 - roomState.players.length} more needed`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 p-1">
          {roomState.players.map((p) => (
            <div key={p.id} className="flex items-center bg-slate-800/40 p-2 sm:p-3 rounded-2xl border border-slate-700/30 shadow-sm">
              <span className="text-2xl sm:text-3xl mr-3 sm:mr-4 filter drop-shadow-sm">{p.avatar}</span>
              <div className="flex-1">
                <p className="font-bold text-sm sm:text-base text-white">{p.name} {p.id === currentPlayer.id && '(You)'}</p>
                {p.isHost && <p className="text-[9px] sm:text-[10px] text-yellow-400 font-bold bg-yellow-900/30 inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full mt-1"><Shield size={9} className="sm:w-[10px] sm:h-[10px]" />HOST</p>}
              </div>
            </div>
          ))}
        </div>

        {isHost ? (
          <Button
            disabled={!canStart}
            fullWidth
            onClick={() => gameService.goToSettings()}
          >
            Continue to Settings &rarr;
          </Button>
        ) : (
          <div className="text-center text-slate-400 animate-pulse pb-4 text-sm font-medium">
            Waiting for host to start...
          </div>
        )}
      </div>
    );
  }

  // === CONNECTING SPINNER ===
  if (roomState.connectionStatus === 'CONNECTING' || isBusy) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-slate-700 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-slate-400 font-bold animate-pulse">Connecting...</p>
      </div>
    );
  }

  // === MAIN ENTRY (Create / Join / Offline) ===
  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsBusy(true);
    const player: Player = {
      id: gameService.getPlayerId(),
      name: name.trim(),
      avatar: '👤',
      isHost: true
    };
    try {
      await gameService.createGame(player);
    } catch (e) {
      alert('Failed to create room. Please try again.');
      setIsBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !inputCode.trim()) return;
    setIsBusy(true);
    const player: Player = {
      id: gameService.getPlayerId(),
      name: name.trim(),
      avatar: '👤',
      isHost: false
    };
    try {
      await gameService.joinGame(inputCode.trim(), player);
    } catch (e) {
      alert('Could not find room with that code.');
      setIsBusy(false);
    }
  };

  const handleOfflineStart = () => {
    gameService.startOfflineMode();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 w-full">
      <div className="w-full space-y-6">
        <div className="text-center space-y-2 mb-8">
          <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white [text-shadow:_0_0_20px_rgb(168_85_247_/_40%)] tracking-tighter flex flex-col items-center">
            <SplitText
              text="IMPOSTER"
              className="bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"
              delay={100}
            />
            <SplitText
              text="HUNT"
              className="bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"
              delay={500}
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Deception • Strategy • Party</p>
        </div>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            className={inputClass}
          />

          <div className="h-px bg-slate-700/50 my-6 w-1/2 mx-auto"></div>

          {mode === 'MAIN' ? (
            <div className="space-y-3 pt-2">
              <Button fullWidth onClick={handleCreate} disabled={!name} variant="primary" className="shadow-blue-500/20">
                Create Online Room
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button fullWidth onClick={() => setMode('JOIN_INPUT')} disabled={!name} variant="secondary">
                  Join Room
                </Button>
                <Button fullWidth onClick={handleOfflineStart} variant="secondary">
                  Offline Mode
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Room Code</label>
                <input
                  type="text"
                  placeholder="ABCD"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="w-full bg-slate-800/60 p-4 rounded-2xl text-center font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-black text-3xl tracking-[0.5em] uppercase border border-slate-700/50 text-white"
                />
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => setMode('MAIN')} variant="secondary">
                  Back
                </Button>
                <Button className="flex-[2]" onClick={handleJoin} disabled={!name || inputCode.length < 4} variant="primary">
                  Enter
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};