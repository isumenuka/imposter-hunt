import { gameLogic } from './gameLogic.js';

/**
 * Manages all game rooms and player connections
 * Handles room creation, joining, leaving, and cleanup
 */
class GameManager {
    constructor() {
        // rooms: { roomCode: { roomState, players: Map, createdAt, lastActivity } }
        this.rooms = new Map();

        // socketToRoom: Map socket.id to roomCode for quick lookup
        this.socketToRoom = new Map();

        // playerToSocket: Map playerId to socket.id for reconnection
        this.playerToSocket = new Map();

        // Start cleanup interval (every 5 minutes)
        this.startCleanupInterval();

        console.log('🎮 Game Manager initialized');
    }

    /**
     * Generate a unique 4-letter room code
     * @returns {string}
     */
    generateRoomCode() {
        const chars = '0123456789';
        let code;

        do {
            code = '';
            for (let i = 0; i < 4; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.rooms.has(code));

        return code;
    }

    /**
     * Create a new room
     * @param {Object} socket - Socket.IO socket
     * @param {Object} player - Player data
     * @returns {Object} Room code and initial state
     */
    createRoom(socket, player) {
        const roomCode = this.generateRoomCode();

        const hostPlayer = {
            ...player,
            id: player.id || socket.id,
            isHost: true,
            socketId: socket.id
        };

        const initialState = {
            gameMode: 'ONLINE',
            roomCode,
            phase: 'LOBBY',
            players: [hostPlayer],
            config: {
                category: 'Everything',
                selectedCategories: [],
                roundDuration: 180,
                imposterCount: 1,
                imposterClueEnabled: true
            }
        };

        this.rooms.set(roomCode, {
            roomState: initialState,
            players: new Map([[hostPlayer.id, socket.id]]),
            createdAt: Date.now(),
            lastActivity: Date.now()
        });

        this.socketToRoom.set(socket.id, roomCode);
        this.playerToSocket.set(hostPlayer.id, socket.id);

        socket.join(roomCode);

        console.log(`✅ Room ${roomCode} created by ${player.name}`);

        return { roomCode, roomState: initialState };
    }

    /**
     * Join an existing room
     * @param {Object} socket - Socket.IO socket
     * @param {string} roomCode - Room code to join
     * @param {Object} player - Player data
     * @returns {Object} Room state or error
     */
    joinRoom(socket, roomCode, player) {
        const room = this.rooms.get(roomCode);

        if (!room) {
            return { error: 'Room not found' };
        }

        const playerId = player.id || socket.id;

        // Check if player is reconnecting
        const existingPlayer = room.roomState.players.find(p => p.id === playerId);

        if (existingPlayer) {
            // Reconnection - allow regardless of phase
            console.log(`🔄 Player ${player.name} reconnecting to ${roomCode}`);

            // Clear disconnection state
            existingPlayer.disconnected = false;
            existingPlayer.disconnectedAt = undefined;

            // Update socket mapping
            room.players.set(playerId, socket.id);
            this.playerToSocket.set(playerId, socket.id);
            this.socketToRoom.set(socket.id, roomCode);

            socket.join(roomCode);

            return { roomCode, roomState: room.roomState, reconnected: true };
        }

        // Prevent new players from joining if game is in progress
        const activePhases = ['REVEAL', 'DISCUSSION', 'VOTING', 'RESULTS'];
        if (activePhases.includes(room.roomState.phase)) {
            return { error: 'Game already in progress. Cannot join mid-game.' };
        }

        // New player joining
        const newPlayer = {
            ...player,
            id: playerId,
            isHost: false,
            socketId: socket.id,
            disconnected: false
        };

        room.roomState.players.push(newPlayer);
        room.players.set(playerId, socket.id);
        room.lastActivity = Date.now();

        this.socketToRoom.set(socket.id, roomCode);
        this.playerToSocket.set(playerId, socket.id);

        socket.join(roomCode);

        console.log(`✅ Player ${player.name} joined room ${roomCode}`);

        return { roomCode, roomState: room.roomState };
    }

    /**
     * Get room state for a specific player (filtered)
     * @param {string} roomCode 
     * @param {string} playerId 
     * @returns {Object|null}
     */
    getRoomState(roomCode, playerId) {
        const room = this.rooms.get(roomCode);
        if (!room) return null;

        // Filter state based on what this player should see
        return gameLogic.filterStateForPlayer(room.roomState, playerId);
    }

    /**
     * Update room state
     * @param {string} roomCode 
     * @param {Object} updates 
     */
    updateRoomState(roomCode, updates) {
        const room = this.rooms.get(roomCode);
        if (room) {
            room.roomState = { ...room.roomState, ...updates };
            room.lastActivity = Date.now();
        }
    }

    /**
     * Get room code for a socket
     * @param {string} socketId 
     * @returns {string|null}
     */
    getRoomCodeForSocket(socketId) {
        return this.socketToRoom.get(socketId);
    }

    /**
     * Get player ID from socket
     * @param {string} socketId 
     * @param {string} roomCode 
     * @returns {string|null}
     */
    getPlayerIdFromSocket(socketId, roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room) return null;

        for (const [playerId, sockId] of room.players.entries()) {
            if (sockId === socketId) return playerId;
        }

        return null;
    }

    /**
     * Mark a player as disconnected (not removed)
     * @param {string} socketId 
     * @returns {Object|null} Room info if player was disconnected
     */
    removePlayer(socketId) {
        const roomCode = this.socketToRoom.get(socketId);
        if (!roomCode) return null;

        const room = this.rooms.get(roomCode);
        if (!room) return null;

        const playerId = this.getPlayerIdFromSocket(socketId, roomCode);
        if (!playerId) return null;

        const player = room.roomState.players.find(p => p.id === playerId);
        if (!player) return null;

        // Remove from socket maps
        this.socketToRoom.delete(socketId);
        this.playerToSocket.delete(playerId);
        room.players.delete(playerId);

        console.log(`❌ Player ${player.name} disconnected from room ${roomCode}`);

        // If in LOBBY, remove player immediately
        if (room.roomState.phase === 'LOBBY') {
            // If host left, assign new host
            if (player.isHost) {
                const remainingPlayers = room.roomState.players.filter(p => p.id !== playerId);

                if (remainingPlayers.length > 0) {
                    remainingPlayers[0].isHost = true;
                    room.roomState.players = remainingPlayers;
                    console.log(`👑 New host: ${remainingPlayers[0].name}`);
                } else {
                    // No players left, delete room
                    this.rooms.delete(roomCode);
                    console.log(`🗑️  Room ${roomCode} deleted (empty)`);
                    return { roomCode, deleted: true };
                }
            } else {
                // Remove non-host player from lobby
                room.roomState.players = room.roomState.players.filter(p => p.id !== playerId);
            }
        } else {
            // Game in progress - mark as disconnected, don't remove
            player.disconnected = true;
            player.disconnectedAt = Date.now();

            // If host disconnected during game, transfer host to first connected player
            if (player.isHost) {
                const newHost = room.roomState.players.find(p => p.id !== playerId && !p.disconnected);
                if (newHost) {
                    player.isHost = false;
                    newHost.isHost = true;
                    console.log(`👑 Host transferred to: ${newHost.name}`);
                }
            }

            // Schedule permanent removal after 5 minutes
            setTimeout(() => {
                this.permanentlyRemovePlayer(roomCode, playerId);
            }, 5 * 60 * 1000); // 5 minutes
        }

        room.lastActivity = Date.now();

        return { roomCode, playerId, player, roomState: room.roomState };
    }

    /**
     * Permanently remove a disconnected player after timeout
     * @param {string} roomCode 
     * @param {string} playerId 
     */
    permanentlyRemovePlayer(roomCode, playerId) {
        const room = this.rooms.get(roomCode);
        if (!room) return;

        const player = room.roomState.players.find(p => p.id === playerId);

        // Only remove if still disconnected (player didn't reconnect)
        if (player && player.disconnected) {
            console.log(`🗑️  Permanently removing ${player.name} from room ${roomCode} (timeout)`);

            room.roomState.players = room.roomState.players.filter(p => p.id !== playerId);

            // If no connected players left, delete room
            const connectedPlayers = room.roomState.players.filter(p => !p.disconnected);
            if (connectedPlayers.length === 0) {
                this.rooms.delete(roomCode);
                console.log(`🗑️  Room ${roomCode} deleted (no connected players)`);
            }
        }
    }

    /**
     * Clean up old rooms (called periodically)
     */
    cleanupOldRooms() {
        const now = Date.now();
        const MAX_ROOM_AGE = 2 * 60 * 60 * 1000; // 2 hours
        const MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 minutes

        for (const [roomCode, room] of this.rooms.entries()) {
            const age = now - room.createdAt;
            const inactiveTime = now - room.lastActivity;

            if (age > MAX_ROOM_AGE || inactiveTime > MAX_INACTIVE_TIME) {
                console.log(`🧹 Cleaning up room ${roomCode} (age: ${Math.floor(age / 60000)}m, inactive: ${Math.floor(inactiveTime / 60000)}m)`);

                // Remove all player mappings
                for (const playerId of room.players.keys()) {
                    const socketId = this.playerToSocket.get(playerId);
                    if (socketId) {
                        this.socketToRoom.delete(socketId);
                    }
                    this.playerToSocket.delete(playerId);
                }

                this.rooms.delete(roomCode);
            }
        }
    }

    /**
     * Start periodic cleanup
     */
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupOldRooms();
        }, 5 * 60 * 1000); // Run every 5 minutes
    }

    /**
     * Get room instance
     * @param {string} roomCode 
     * @returns {Object|null}
     */
    getRoom(roomCode) {
        return this.rooms.get(roomCode);
    }

    /**
     * Get stats for monitoring
     * @returns {Object}
     */
    getStats() {
        const totalPlayers = Array.from(this.rooms.values())
            .reduce((sum, room) => sum + room.players.size, 0);

        return {
            totalRooms: this.rooms.size,
            totalPlayers,
            rooms: Array.from(this.rooms.entries()).map(([code, room]) => ({
                code,
                players: room.players.size,
                phase: room.roomState.phase,
                age: Math.floor((Date.now() - room.createdAt) / 1000)
            }))
        };
    }
}

export const gameManager = new GameManager();
