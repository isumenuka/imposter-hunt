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
        this.emitAction('go_to_settings');
    }

    public updateSettings(settings: Partial<GameConfig>) {
        this.emitAction('update_settings', { settings });
    }

    public updatePlayerCategories(playerId: string, categories: string[]) {
        this.emitAction('update_player_categories', { categories });
    }

    public startGame(config: GameConfig) {
        this.emitAction('start_game', { config });
    }

    public markReady(playerId: string) {
        this.emitAction('player_ready', { playerId });
    }

    public startVoting() {
        this.emitAction('start_voting');
    }

    public castVote(voterId: string, suspectId: string) {
        this.emitAction('cast_vote', { suspectId });
    }

    public resetGame() {
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