import { RoomState, GamePhase, Player, GameConfig, GameAction, GameStateMessage } from '../types';
import { DEFAULT_ROUND_DURATION, DEFAULT_IMPOSTER_COUNT, DEFAULT_IMPOSTER_CLUE_ENABLED, GAME_CATEGORIES } from '../constants';
import { aiService } from './aiService';

// Declare PeerJS type
declare const Peer: any;

const PEER_PREFIX = 'imposter-hunt-game-v1-';

// Initial empty state
const initialState: RoomState = {
    gameMode: 'ONLINE',
    roomCode: '',
    players: [],
    phase: GamePhase.LOBBY,
    config: {
        category: 'Everything',
        selectedCategories: [], // Empty by default - host must select categories
        roundDuration: DEFAULT_ROUND_DURATION,
        imposterCount: DEFAULT_IMPOSTER_COUNT,
        imposterClueEnabled: DEFAULT_IMPOSTER_CLUE_ENABLED,
    },
    connectionStatus: 'DISCONNECTED',
    activePlayerId: undefined,
    isTurnHidden: false
};

class GameService {
    private peer: any;
    private state: RoomState;
    private listeners: ((state: RoomState) => void)[] = [];

    private isHost: boolean = false;
    private playerId: string | null = null;

    // Host variables (Online)
    private connections: any[] = [];

    // Client variables (Online)
    private hostConnection: any = null;

    constructor() {
        this.state = initialState;

        // Attempt to recover player ID
        const savedId = sessionStorage.getItem('imposter_player_id');
        if (savedId) this.playerId = savedId;
        else {
            this.playerId = crypto.randomUUID();
            sessionStorage.setItem('imposter_player_id', this.playerId);
        }
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

        if (this.state.gameMode === 'ONLINE' && this.isHost) {
            this.broadcastState();
        }
    }

    // =========================================
    // SETUP MODES
    // =========================================

    public startOfflineMode() {
        this.state = {
            ...initialState,
            gameMode: 'OFFLINE',
            connectionStatus: 'CONNECTED', // Mock connection
            players: []
        };
        this.notify();
    }

    public addOfflinePlayer(name: string, avatar: string) {
        const newPlayer: Player = {
            id: crypto.randomUUID(),
            name,
            avatar,
            isHost: this.state.players.length === 0 // First player is nominally host
        };
        this.setState({ players: [...this.state.players, newPlayer] });
    }

    // =========================================
    // PEER JS SETUP (ONLINE)
    // =========================================

    public async createGame(player: Player): Promise<string> {
        this.isHost = true;
        const roomCode = this.generateRoomCode();
        const peerId = PEER_PREFIX + roomCode;

        // Reset state for new game
        this.state = {
            ...initialState,
            gameMode: 'ONLINE',
            roomCode,
            players: [{ ...player, isHost: true }],
            connectionStatus: 'CONNECTING'
        };
        this.notify();

        return new Promise((resolve, reject) => {
            try {
                this.peer = new Peer(peerId, { debug: 1 });

                this.peer.on('open', (id: string) => {
                    console.log('Host Peer ID:', id);
                    this.setState({ connectionStatus: 'CONNECTED' });
                    resolve(roomCode);
                });

                this.peer.on('error', (err: any) => {
                    console.error('Peer error:', err);
                    this.setState({ connectionStatus: 'DISCONNECTED' });
                    reject(err);
                });

                this.peer.on('connection', (conn: any) => {
                    this.handleHostConnection(conn);
                });

            } catch (e) {
                reject(e);
            }
        });
    }

    public async joinGame(roomCode: string, player: Player): Promise<void> {
        this.isHost = false;
        const hostPeerId = PEER_PREFIX + roomCode.toUpperCase();

        this.state = {
            ...initialState,
            gameMode: 'ONLINE',
            roomCode: roomCode.toUpperCase(),
            connectionStatus: 'CONNECTING'
        };
        this.notify();

        return new Promise((resolve, reject) => {
            try {
                this.peer = new Peer(); // Client gets random ID

                this.peer.on('open', (id: string) => {
                    // Connect to host
                    const conn = this.peer.connect(hostPeerId, { reliable: true });

                    conn.on('open', () => {
                        this.hostConnection = conn;
                        this.setState({ connectionStatus: 'CONNECTED' });
                        // Send Join Request immediately
                        this.sendAction({ type: 'JOIN_REQUEST', payload: player, playerId: this.playerId! });
                        resolve();
                    });

                    conn.on('data', (data: any) => {
                        this.handleClientData(data);
                    });

                    conn.on('close', () => {
                        this.setState({ connectionStatus: 'DISCONNECTED' });
                    });

                    conn.on('error', (err: any) => {
                        console.error("Connection Error", err);
                        this.setState({ connectionStatus: 'DISCONNECTED' });
                    });
                });

                this.peer.on('error', (err: any) => {
                    console.error('Peer error:', err);
                    this.setState({ connectionStatus: 'DISCONNECTED' });
                    reject(err);
                });

            } catch (e) {
                reject(e);
            }
        });
    }

    // =========================================
    // HOST / LOGIC
    // =========================================

    private handleHostConnection(conn: any) {
        this.connections.push(conn);

        conn.on('data', (data: GameAction) => {
            this.processAction(data);
        });

        conn.on('close', () => {
            this.connections = this.connections.filter(c => c !== conn);
        });

        conn.send({ type: 'STATE_UPDATE', payload: this.state });
    }

    private broadcastState() {
        const msg: GameStateMessage = { type: 'STATE_UPDATE', payload: this.state };
        this.connections.forEach(conn => {
            if (conn.open) conn.send(msg);
        });
    }

    private async processAction(action: GameAction) {
        console.log('Processing action:', action.type);

        switch (action.type) {
            case 'JOIN_REQUEST':
                const newPlayer = action.payload;
                const existingIdx = this.state.players.findIndex(p => p.id === newPlayer.id);
                let updatedPlayers = [...this.state.players];
                if (existingIdx >= 0) {
                    updatedPlayers[existingIdx] = { ...updatedPlayers[existingIdx], ...newPlayer };
                } else {
                    updatedPlayers.push({ ...newPlayer, isHost: false });
                }
                this.setState({ players: updatedPlayers });
                break;

            case 'UPDATE_SETTINGS':
                this.setState({ config: { ...this.state.config, ...action.payload } });
                break;

            case 'GO_TO_SETTINGS':
                this.setState({ phase: GamePhase.SETTINGS });
                break;

            case 'START_GAME':
                // Handle async word generation here
                await this.startGameLogic(action.payload);
                break;

            case 'PLAYER_READY':
                if (this.state.gameMode === 'OFFLINE') {
                    this.advanceOfflineTurn();
                } else {
                    const readyPlayers = this.state.players.map(p =>
                        p.id === action.payload.playerId ? { ...p, isReady: true } : p
                    );
                    this.setState({ players: readyPlayers });

                    if (readyPlayers.every(p => p.isReady)) {
                        setTimeout(() => {
                            this.processAction({ type: 'START_VOTING', payload: { phase: GamePhase.DISCUSSION } });
                        }, 500);
                    }
                }
                break;

            case 'START_VOTING':
                const nextPhase = action.payload?.phase || GamePhase.VOTING;
                let phaseUpdate: Partial<RoomState> = { phase: nextPhase };

                if (nextPhase === GamePhase.DISCUSSION) {
                    const randomIdx = Math.floor(Math.random() * this.state.players.length);
                    phaseUpdate.firstSpeakerId = this.state.players[randomIdx].id;
                    phaseUpdate.startTime = Date.now();
                    phaseUpdate.activePlayerId = undefined;
                } else if (nextPhase === GamePhase.VOTING && this.state.gameMode === 'OFFLINE') {
                    phaseUpdate.activePlayerId = this.state.players[0].id;
                    phaseUpdate.isTurnHidden = true;
                }

                this.setState(phaseUpdate);
                break;

            case 'CAST_VOTE':
                const { voterId, suspectId } = action.payload;
                const votedPlayers = this.state.players.map(p =>
                    p.id === voterId ? { ...p, vote: suspectId } : p
                );
                this.setState({ players: votedPlayers });

                if (this.state.gameMode === 'OFFLINE') {
                    this.advanceOfflineTurn();
                } else {
                    if (votedPlayers.every(p => !!p.vote)) {
                        this.calculateResults(votedPlayers);
                    }
                }
                break;

            case 'RESET_GAME':
                this.setState({
                    phase: GamePhase.LOBBY,
                    players: this.state.players.map(p => ({ ...p, role: undefined, vote: undefined, isReady: undefined })),
                    startTime: undefined,
                    firstSpeakerId: undefined,
                    winners: undefined,
                    activePlayerId: undefined,
                    isTurnHidden: false
                });
                break;

            case 'REVEAL_TURN':
                this.setState({ isTurnHidden: false });
                break;
        }
    }

    private async startGameLogic(config: GameConfig) {
        const playerCount = this.state.players.length;
        const imposterCount = Math.min(config.imposterCount, Math.floor(playerCount / 2)) || 1;

        const assignedPlayers = this.assignRandomRoles([...this.state.players], imposterCount);
        const shuffled = assignedPlayers;

        // --- LOGIC: Select ONE category from the ticked list ---
        // If none selected, default to "Everything"
        const availableCategories = config.selectedCategories && config.selectedCategories.length > 0
            ? config.selectedCategories
            : GAME_CATEGORIES;

        const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];

        try {
            // Generate word using the CHOSEN category
            const { word, clue } = await aiService.generateGameContent(randomCategory);

            const update: Partial<RoomState> = {
                phase: GamePhase.REVEAL,
                config: {
                    ...config,
                    category: randomCategory,
                    word,
                    imposterClue: config.imposterClueEnabled ? clue : undefined
                },
                players: assignedPlayers,
                startTime: undefined,
                error: undefined
            };

            if (this.state.gameMode === 'OFFLINE') {
                update.activePlayerId = assignedPlayers[0].id;
                update.isTurnHidden = true;
            }

            this.setState(update);
        } catch (error) {
            console.error("Failed to generate game content:", error);
            this.setState({
                error: error instanceof Error ? error.message : "Failed to generate game content. Please check your API key and try again.",
                phase: GamePhase.SETTINGS
            });
        }
    }

    private assignRandomRoles(players: Player[], imposterCount: number): Player[] {
        const indices = Array.from({ length: players.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        return players.map((p, index) => ({
            ...p,
            role: (indices.indexOf(index) < imposterCount ? 'imposter' : 'innocent') as 'imposter' | 'innocent',
            isReady: false,
            vote: undefined
        }));
    }

    private advanceOfflineTurn() {
        const currentIndex = this.state.players.findIndex(p => p.id === this.state.activePlayerId);
        const nextIndex = currentIndex + 1;

        if (nextIndex < this.state.players.length) {
            this.setState({
                activePlayerId: this.state.players[nextIndex].id,
                isTurnHidden: true
            });
        } else {
            if (this.state.phase === GamePhase.REVEAL) {
                this.processAction({ type: 'START_VOTING', payload: { phase: GamePhase.DISCUSSION } });
            } else if (this.state.phase === GamePhase.VOTING) {
                this.calculateResults(this.state.players);
            }
        }
    }

    private calculateResults(players: Player[]) {
        const votes: Record<string, number> = {};
        players.forEach(p => { if (p.vote) votes[p.vote] = (votes[p.vote] || 0) + 1; });

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

        let winners: 'innocent' | 'imposter' = 'imposter';
        if (votedOutId && !tie) {
            const votedPlayer = players.find(p => p.id === votedOutId);
            if (votedPlayer?.role === 'imposter') {
                winners = 'innocent';
            }
        }

        this.setState({
            phase: GamePhase.RESULTS,
            winners
        });
    }

    // =========================================
    // CLIENT LOGIC
    // =========================================

    private handleClientData(data: GameStateMessage) {
        if (data.type === 'STATE_UPDATE') {
            this.state = data.payload;
            this.notify();
        }
    }

    // =========================================
    // PUBLIC ACTIONS
    // =========================================

    private sendAction(action: GameAction) {
        if (this.state.gameMode === 'OFFLINE' || this.isHost) {
            this.processAction(action);
        } else {
            if (this.hostConnection && this.hostConnection.open) {
                this.hostConnection.send(action);
            } else {
                console.warn("Not connected to host");
            }
        }
    }

    public updateSettings(settings: Partial<GameConfig>) {
        this.sendAction({ type: 'UPDATE_SETTINGS', payload: settings });
    }

    public goToSettings() {
        this.sendAction({ type: 'GO_TO_SETTINGS' });
    }

    public startGame(config: GameConfig) {
        this.sendAction({ type: 'START_GAME', payload: config });
    }

    public markReady(playerId: string) {
        this.sendAction({ type: 'PLAYER_READY', payload: { playerId } });
    }

    public startVoting() {
        this.sendAction({ type: 'START_VOTING', payload: { phase: GamePhase.VOTING } });
    }

    public castVote(voterId: string, suspectId: string) {
        this.sendAction({ type: 'CAST_VOTE', payload: { voterId, suspectId } });
    }

    public resetGame() {
        this.sendAction({ type: 'RESET_GAME' });
    }

    public revealTurn() {
        this.sendAction({ type: 'REVEAL_TURN' });
    }

    private generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

export const gameService = new GameService();