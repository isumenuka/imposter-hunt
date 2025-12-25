import { io, Socket } from 'socket.io-client';
import { RoomState, GamePhase, Player, GameConfig, GameAction } from '../types';
import { DEFAULT_ROUND_DURATION, DEFAULT_IMPOSTER_COUNT, DEFAULT_ASSOCIATION_WORD_ENABLED, SERVER_URL } from '../constants';

const STORAGE_KEY = 'imposter-hunt-game-state';
const PLAYER_ID_KEY = 'imposter_player_id';
const SAVE_DEBOUNCE_MS = 500;

// Initial empty state
const initialState: RoomState = {
    gameMode: 'ONLINE',
    roomCode: '',
    players: [],
    phase: GamePhase.LOBBY,
    config: {
        category: 'Everything',
        selectedCategories: [],
        roundDuration: DEFAULT_ROUND_DURATION,
        imposterCount: DEFAULT_IMPOSTER_COUNT,
        associationWordEnabled: DEFAULT_ASSOCIATION_WORD_ENABLED,
    },
    connectionStatus: 'DISCONNECTED',
    activePlayerId: undefined,
    isTurnHidden: false
};

/**
 * Game Service with Socket.IO WebSocket connection
 * Replaces the old PeerJS implementation with a client-server architecture
 */
class GameService {
    private socket: Socket | null = null;
    private state: RoomState;
    private listeners: ((state: RoomState) => void)[] = [];
    private playerId: string | null = null;
    private saveTimeout: number | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    constructor() {
        // Recover or generate player ID
        const savedId = sessionStorage.getItem(PLAYER_ID_KEY);
        if (savedId) {
            this.playerId = savedId;
        } else {
            this.playerId = crypto.randomUUID();
            sessionStorage.setItem(PLAYER_ID_KEY, this.playerId);
        }

        // Try to restore state from localStorage
        const savedState = this.loadState();

        // Validate restored state
        if (savedState && savedState.gameMode === 'ONLINE' && savedState.phase !== GamePhase.LOBBY) {
            const playerExists = savedState.players.some(p => p.id === this.playerId);
            if (!playerExists) {
                console.log('Player not found in saved state, resetting to lobby');
                this.clearSavedState();
                this.state = initialState;
            } else {
                this.state = savedState;
                // If we have a saved online state, attempt to reconnect
                if (this.state.roomCode) {
                    console.log(`Attempting to reconnect to room ${this.state.roomCode}`);
                    this.setState({ connectionStatus: 'CONNECTING' });
                }
            }
        } else {
            this.state = savedState || initialState;
        }

        // Set up state persistence listeners
        this.setupStatePersistence();

        console.log('🎮 Game Service initialized with Socket.IO');
        console.log(`📡 Server URL: ${SERVER_URL}`);
    }

    public getPlayerId(): string {
        return this.playerId!;
    }

    public subscribe(callback: (state: RoomState) => void) {
        this.listeners.push(callback);
        callback(this.state);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notify() {
        this.listeners.forEach(l => l(this.state));
    }

    private setState(updates: Partial<RoomState>) {
        this.state = { ...this.state, ...updates };
        this.notify();
        this.debouncedSaveState();
    }

    // =========================================
    // STATE PERSISTENCE
    // =========================================

    private loadState(): RoomState | null {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log('State restored from localStorage');
                return parsed;
            }
        } catch (error) {
            console.error('Failed to load state:', error);
            localStorage.removeItem(STORAGE_KEY);
        }
        return null;
    }

    private saveState() {
        try {
            if (this.state.connectionStatus === 'DISCONNECTED' && this.state.players.length === 0) {
                return;
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    private debouncedSaveState() {
        if (this.saveTimeout !== null) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = window.setTimeout(() => {
            this.saveState();
            this.saveTimeout = null;
        }, SAVE_DEBOUNCE_MS);
    }

    private setupStatePersistence() {
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveState();
            }
        });
    }

    public clearSavedState() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Saved state cleared');
    }

    public resetToInitialState() {
        this.clearSavedState();
        this.disconnectSocket();
        this.state = { ...initialState };
        this.notify();
        console.log('Game reset to initial state');
    }

    // =========================================
    // SOCKET.IO CONNECTION
    // =========================================

    private connectSocket() {
        if (this.socket?.connected) {
            console.log('✅ Already connected');
            return;
        }

        console.log(`🔌 Connecting to ${SERVER_URL}...`);
        this.setState({ connectionStatus: 'CONNECTING' });

        this.socket = io(SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 10000
        });

        // Connection successful
        this.socket.on('connect', () => {
            console.log('✅ Connected to server');
            this.setState({ connectionStatus: 'CONNECTED', error: undefined });
            this.reconnectAttempts = 0;

            // If we have a room code, try to rejoin
            if (this.state.roomCode && this.state.phase !== GamePhase.LOBBY) {
                console.log(`🔄 Reconnecting to room ${this.state.roomCode}`);
                const currentPlayer = this.state.players.find(p => p.id === this.playerId);
                if (currentPlayer) {
                    this.joinGame(this.state.roomCode, currentPlayer);
                }
            }
        });

        // Room state update from server
        this.socket.on('room_state', (roomState: RoomState) => {
            console.log('📥 Room state update:', roomState.phase);
            this.setState(roomState);
        });

        // Error from server
        this.socket.on('error', (data: { message: string }) => {
            console.error('❌ Server error:', data.message);
            this.setState({ error: data.message });
        });

        // Player disconnected
        this.socket.on('player_disconnected', (data: { playerId: string; playerName: string }) => {
            console.log(`👋 Player disconnected: ${data.playerName}`);
        });

        // Player reconnected
        this.socket.on('player_reconnected', (data: { playerId: string }) => {
            console.log(`🔄 Player reconnected: ${data.playerId}`);
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error.message);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.setState({
                    connectionStatus: 'DISCONNECTED',
                    error: 'Failed to connect to server. Please check your internet connection.'
                });
            }
        });

        // Disconnected
        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Disconnected:', reason);
            this.setState({ connectionStatus: 'DISCONNECTED' });
        });
    }

    private disconnectSocket() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // =========================================
    // ONLINE MODE
    // =========================================

    public async createGame(player: Player): Promise<string> {
        this.connectSocket();

        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Socket not initialized'));
                return;
            }

            const playerData = { ...player, id: this.playerId };

            this.socket.emit('create_room', { player: playerData }, (response: any) => {
                if (response.success) {
                    console.log(`✅ Room created: ${response.roomCode}`);
                    resolve(response.roomCode);
                } else {
                    console.error('❌ Failed to create room:', response.error);
                    reject(new Error(response.error));
                }
            });
        });
    }

    public async joinGame(roomCode: string, player: Player): Promise<void> {
        this.connectSocket();

        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Socket not initialized'));
                return;
            }

            const playerData = { ...player, id: this.playerId };

            this.socket.emit('join_room', { roomCode: roomCode.toUpperCase(), player: playerData }, (response: any) => {
                if (response.success) {
                    console.log(`✅ Joined room: ${response.roomCode}`);
                    resolve();
                } else {
                    console.error('❌ Failed to join room:', response.error);
                    this.setState({
                        connectionStatus: 'DISCONNECTED',
                        error: response.error
                    });
                    reject(new Error(response.error));
                }
            });
        });
    }

    // =========================================
    // OFFLINE MODE
    // =========================================

    public startOfflineMode() {
        this.state = {
            ...initialState,
            gameMode: 'OFFLINE',
            connectionStatus: 'CONNECTED',
            players: []
        };
        this.notify();
    }

    public addOfflinePlayer(name: string, avatar: string) {
        const newPlayer: Player = {
            id: crypto.randomUUID(),
            name,
            avatar,
            isHost: this.state.players.length === 0
        };
        this.setState({ players: [...this.state.players, newPlayer] });
    }

    public removeOfflinePlayer(playerId: string) {
        if (this.state.gameMode === 'OFFLINE') {
            this.setState({
                players: this.state.players.filter(p => p.id !== playerId)
            });
        }
    }

    // =========================================
    // GAME ACTIONS (emit to server)
    // =========================================

    private emitAction(event: string, data?: any) {
        if (this.state.gameMode === 'OFFLINE') {
            // Offline mode: handle locally (existing offline logic)
            console.warn('Offline mode actions not implemented in Socket.IO version');
            return;
        }

        if (!this.socket || !this.socket.connected) {
            console.warn('Not connected to server');
            this.setState({ error: 'Not connected to server' });
            return;
        }

        this.socket.emit(event, data);
    }

    public goToSettings() {
        // Offline mode: handle locally
        if (this.state.gameMode === 'OFFLINE') {
            this.setState({ phase: GamePhase.SETTINGS });
            return;
        }
        // Online mode: emit to server
        this.emitAction('go_to_settings');
    }

    public updateSettings(settings: Partial<GameConfig>) {
        // Offline mode: update local config
        if (this.state.gameMode === 'OFFLINE') {
            this.setState({
                config: { ...this.state.config, ...settings }
            });
            return;
        }
        // Online mode: emit to server
        this.emitAction('update_settings', { settings });
    }

    public updatePlayerCategories(playerId: string, categories: string[]) {
        this.emitAction('update_player_categories', { categories });
    }

    public startGame(config: GameConfig) {
        // Offline mode: start offline game
        if (this.state.gameMode === 'OFFLINE') {
            this.startOfflineGame(config);
            return;
        }
        // Online mode: emit to server
        this.emitAction('start_game', { config });
    }

    private startOfflineGame(config: GameConfig) {
        const players = [...this.state.players];

        // Randomly select a category from selectedCategories
        const selectedCategory = config.selectedCategories.length > 0
            ? config.selectedCategories[Math.floor(Math.random() * config.selectedCategories.length)]
            : 'Everything';

        // Import and use the game content generator
        const { getGameContent } = require('../data/gameContent');
        const { word, associationWord } = getGameContent(selectedCategory);

        // Assign roles randomly
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        const imposterCount = Math.min(config.imposterCount, Math.floor(players.length / 2));

        const playersWithRoles = shuffled.map((p, i) => ({
            ...p,
            role: (i < imposterCount ? 'imposter' : 'innocent') as 'innocent' | 'imposter',
            isReady: false,
            vote: undefined
        }));

        // Pick random first speaker
        const firstSpeakerId = playersWithRoles[Math.floor(Math.random() * playersWithRoles.length)].id;

        // Update state to REVEAL phase
        this.setState({
            players: playersWithRoles,
            phase: GamePhase.REVEAL,
            config: {
                ...config,
                category: selectedCategory,
                word,
                associationWord: config.associationWordEnabled ? associationWord : undefined
            },
            firstSpeakerId,
            activePlayerId: playersWithRoles[0].id,
            isTurnHidden: true,
            startTime: Date.now()
        });
    }

    public markReady(playerId: string) {
        // Offline mode: handle turn-based reveal
        if (this.state.gameMode === 'OFFLINE') {
            this.nextOfflineRevealTurn();
            return;
        }
        // Online mode: emit to server
        this.emitAction('player_ready', { playerId });
    }

    private nextOfflineRevealTurn() {
        const currentIndex = this.state.players.findIndex(p => p.id === this.state.activePlayerId);
        const nextIndex = currentIndex + 1;

        if (nextIndex >= this.state.players.length) {
            // All players have seen their role, move to discussion
            this.setState({
                phase: GamePhase.DISCUSSION,
                activePlayerId: undefined,
                isTurnHidden: false
            });
        } else {
            // Move to next player
            this.setState({
                activePlayerId: this.state.players[nextIndex].id,
                isTurnHidden: true
            });
        }
    }

    public startVoting() {
        // Offline mode: start turn-based voting
        if (this.state.gameMode === 'OFFLINE') {
            this.setState({
                phase: GamePhase.VOTING,
                activePlayerId: this.state.players[0].id,
                isTurnHidden: true
            });
            return;
        }
        // Online mode: emit to server
        this.emitAction('start_voting');
    }

    public castVote(voterId: string, suspectId: string) {
        // Offline mode: handle turn-based voting
        if (this.state.gameMode === 'OFFLINE') {
            this.castOfflineVote(suspectId);
            return;
        }
        // Online mode: emit to server
        this.emitAction('cast_vote', { suspectId });
    }

    private castOfflineVote(suspectId: string) {
        const currentPlayerId = this.state.activePlayerId;
        if (!currentPlayerId) return;

        // Update current player's vote
        const updatedPlayers = this.state.players.map(p =>
            p.id === currentPlayerId ? { ...p, vote: suspectId } : p
        );

        const currentIndex = updatedPlayers.findIndex(p => p.id === currentPlayerId);
        const nextIndex = currentIndex + 1;

        if (nextIndex >= updatedPlayers.length) {
            // All votes cast, calculate results and move to RESULTS phase
            this.calculateOfflineResults(updatedPlayers);
        } else {
            // Move to next voter
            this.setState({
                players: updatedPlayers,
                activePlayerId: updatedPlayers[nextIndex].id,
                isTurnHidden: true
            });
        }
    }

    private calculateOfflineResults(players: Player[]) {
        // Count votes
        const voteCounts: { [playerId: string]: number } = {};
        players.forEach(p => {
            if (p.vote) {
                voteCounts[p.vote] = (voteCounts[p.vote] || 0) + 1;
            }
        });

        // Find player with most votes
        let maxVotes = 0;
        let eliminatedPlayerId: string | undefined;
        Object.entries(voteCounts).forEach(([playerId, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                eliminatedPlayerId = playerId;
            }
        });

        // Determine winners
        const eliminatedPlayer = eliminatedPlayerId ? players.find(p => p.id === eliminatedPlayerId) : undefined;
        const winners = eliminatedPlayer?.role === 'imposter' ? 'innocent' : 'imposter';

        this.setState({
            players,
            phase: GamePhase.RESULTS,
            winners,
            activePlayerId: undefined,
            isTurnHidden: false
        });
    }

    public resetGame() {
        // Offline mode: reset to lobby with same players
        if (this.state.gameMode === 'OFFLINE') {
            this.setState({
                phase: GamePhase.LOBBY,
                activePlayerId: undefined,
                isTurnHidden: false,
                winners: undefined,
                startTime: undefined,
                firstSpeakerId: undefined,
                config: {
                    ...this.state.config,
                    word: undefined,
                    associationWord: undefined
                },
                players: this.state.players.map(p => ({
                    ...p,
                    role: undefined,
                    vote: undefined,
                    isReady: false
                }))
            });
            return;
        }
        // Online mode: emit to server
        this.emitAction('reset_game');
    }

    public revealTurn() {
        // Offline mode only
        if (this.state.gameMode === 'OFFLINE') {
            this.setState({ isTurnHidden: false });
        }
    }
}

export const gameService = new GameService();