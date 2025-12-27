import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { gameManager } from './gameManager.js';
import { gameLogic } from './gameLogic.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure CORS
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000
});

// Health check endpoint (for Render)
app.get('/health', (req, res) => {
    const stats = gameManager.getStats();
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        ...stats
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Imposter Game Server',
        version: '1.0.0',
        status: 'running'
    });
});

// Stats endpoint
app.get('/stats', (req, res) => {
    res.json(gameManager.getStats());
});

// ==========================================
// SOCKET.IO EVENT HANDLERS
// ==========================================

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // ========== CREATE ROOM ==========
    socket.on('create_room', (data, callback) => {
        try {
            const { player } = data;
            const result = gameManager.createRoom(socket, player);

            if (callback) callback({ success: true, ...result });

            // Send initial state to creator
            socket.emit('room_state', result.roomState);
        } catch (error) {
            console.error('Error creating room:', error);
            if (callback) callback({ success: false, error: error.message });
        }
    });

    // ========== JOIN ROOM ==========
    socket.on('join_room', (data, callback) => {
        try {
            const { roomCode, player } = data;
            const result = gameManager.joinRoom(socket, roomCode, player);

            if (result.error) {
                if (callback) callback({ success: false, error: result.error });
                return;
            }

            if (callback) callback({ success: true, roomCode: result.roomCode });

            // Broadcast to all players in room
            const room = gameManager.getRoom(result.roomCode);
            if (room) {
                io.to(result.roomCode).emit('room_state', room.roomState);

                if (result.reconnected) {
                    io.to(result.roomCode).emit('player_reconnected', { playerId: player.id });
                }
            }
        } catch (error) {
            console.error('Error joining room:', error);
            if (callback) callback({ success: false, error: error.message });
        }
    });

    // ========== LEAVE ROOM ==========
    socket.on('leave_room', (data) => {
        handlePlayerDisconnect(socket);
    });

    // ========== GO TO SETTINGS ==========
    socket.on('go_to_settings', async (data) => {
        try {
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (!roomCode) return;

            const room = gameManager.getRoom(roomCode);
            if (!room) return;

            // Assign unique avatars
            const playersWithAvatars = gameLogic.assignUniqueAvatars(room.roomState.players);

            gameManager.updateRoomState(roomCode, {
                phase: 'SETTINGS',
                players: playersWithAvatars
            });

            io.to(roomCode).emit('room_state', room.roomState);
        } catch (error) {
            console.error('Error going to settings:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // ========== UPDATE SETTINGS ==========
    socket.on('update_settings', (data) => {
        try {
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (!roomCode) return;

            const room = gameManager.getRoom(roomCode);
            if (!room) return;

            // Verify requester is host
            const playerId = gameManager.getPlayerIdFromSocket(socket.id, roomCode);
            const player = room.roomState.players.find(p => p.id === playerId);

            if (!player?.isHost) {
                socket.emit('error', { message: 'Only host can update settings' });
                return;
            }

            gameManager.updateRoomState(roomCode, {
                config: { ...room.roomState.config, ...data.settings }
            });

            io.to(roomCode).emit('room_state', room.roomState);
        } catch (error) {
            console.error('Error updating settings:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // ========== UPDATE PLAYER CATEGORIES ==========
    socket.on('update_player_categories', (data) => {
        try {
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (!roomCode) return;

            const room = gameManager.getRoom(roomCode);
            if (!room) return;

            const playerId = gameManager.getPlayerIdFromSocket(socket.id, roomCode);
            const { categories } = data;

            // Update this player's categories
            const updatedPlayers = room.roomState.players.map(p =>
                p.id === playerId ? { ...p, selectedCategories: categories } : p
            );

            // Merge all player categories
            const allSelectedCategories = Array.from(
                new Set(updatedPlayers.flatMap(p => p.selectedCategories || []))
            );

            gameManager.updateRoomState(roomCode, {
                players: updatedPlayers,
                config: {
                    ...room.roomState.config,
                    selectedCategories: allSelectedCategories
                }
            });

            io.to(roomCode).emit('room_state', room.roomState);
        } catch (error) {
            console.error('Error updating categories:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // ========== START GAME ==========
    socket.on('start_game', async (data) => {
        try {
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (!roomCode) return;

            const room = gameManager.getRoom(roomCode);
            if (!room) return;

            // Verify requester is host
            const playerId = gameManager.getPlayerIdFromSocket(socket.id, roomCode);
            const player = room.roomState.players.find(p => p.id === playerId);

            if (!player?.isHost) {
                socket.emit('error', { message: 'Only host can start game' });
                return;
            }

            // Start game (this is async due to AI word generation)
            const gameState = await gameLogic.startGame(
                room.roomState.players,
                room.roomState.config
            );

            gameManager.updateRoomState(roomCode, gameState);

            // Send filtered state to each player
            room.roomState.players.forEach(p => {
                const playerSocket = gameManager.getRoom(roomCode).players.get(p.id);
                if (playerSocket) {
                    const filteredState = gameLogic.filterStateForPlayer(room.roomState, p.id);
                    io.to(playerSocket).emit('room_state', filteredState);
                }
            });

        } catch (error) {
            console.error('Error starting game:', error);
            socket.emit('error', { message: error.message });

            // Revert to settings phase on error
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (roomCode) {
                const room = gameManager.getRoom(roomCode);
                if (room) {
                    gameManager.updateRoomState(roomCode, {
                        phase: 'SETTINGS',
                        error: error.message
                    });
                    io.to(roomCode).emit('room_state', room.roomState);
                }
            }
        }
    });

    // ========== PLAYER READY ==========
    socket.on('player_ready', (data) => {
        try {
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (!roomCode) return;

            const room = gameManager.getRoom(roomCode);
            if (!room) return;

            const playerId = gameManager.getPlayerIdFromSocket(socket.id, roomCode);

            // Mark player as ready
            const updatedPlayers = room.roomState.players.map(p =>
                p.id === playerId ? { ...p, isReady: true } : p
            );

            gameManager.updateRoomState(roomCode, { players: updatedPlayers });

            // Check if all players are ready
            if (updatedPlayers.every(p => p.isReady)) {
                // Start discussion phase
                const discussionState = gameLogic.startDiscussion(updatedPlayers);
                gameManager.updateRoomState(roomCode, discussionState);
            }

            // Broadcast state
            room.roomState.players.forEach(p => {
                const playerSocket = gameManager.getRoom(roomCode).players.get(p.id);
                if (playerSocket) {
                    const filteredState = gameLogic.filterStateForPlayer(room.roomState, p.id);
                    io.to(playerSocket).emit('room_state', filteredState);
                }
            });

        } catch (error) {
            console.error('Error marking ready:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // ========== START VOTING ==========
    socket.on('start_voting', (data) => {
        try {
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (!roomCode) return;

            const room = gameManager.getRoom(roomCode);
            if (!room) return;

            gameManager.updateRoomState(roomCode, { phase: 'VOTING' });

            // Broadcast to all
            room.roomState.players.forEach(p => {
                const playerSocket = gameManager.getRoom(roomCode).players.get(p.id);
                if (playerSocket) {
                    const filteredState = gameLogic.filterStateForPlayer(room.roomState, p.id);
                    io.to(playerSocket).emit('room_state', filteredState);
                }
            });
        } catch (error) {
            console.error('Error starting voting:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // ========== CAST VOTE ==========
    socket.on('cast_vote', (data) => {
        try {
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (!roomCode) return;

            const room = gameManager.getRoom(roomCode);
            if (!room) return;

            const voterId = gameManager.getPlayerIdFromSocket(socket.id, roomCode);
            const { suspectId } = data;

            // Validate vote
            const validation = gameLogic.validateVote(voterId, suspectId, room.roomState.players);
            if (!validation.valid) {
                socket.emit('error', { message: validation.error });
                return;
            }

            // Cast vote
            const updatedPlayers = gameLogic.castVote(voterId, suspectId, room.roomState.players);
            gameManager.updateRoomState(roomCode, { players: updatedPlayers });

            // Check if all voted
            if (gameLogic.allPlayersVoted(updatedPlayers)) {
                // Calculate results
                const results = gameLogic.calculateResults(updatedPlayers);
                gameManager.updateRoomState(roomCode, results);
            }

            // Broadcast updated state
            io.to(roomCode).emit('room_state', room.roomState);

        } catch (error) {
            console.error('Error casting vote:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // ========== RESET GAME ==========
    socket.on('reset_game', (data) => {
        try {
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (!roomCode) return;

            const room = gameManager.getRoom(roomCode);
            if (!room) return;

            const resetState = gameLogic.resetGame(
                room.roomState.players,
                room.roomState.config
            );

            gameManager.updateRoomState(roomCode, resetState);
            io.to(roomCode).emit('room_state', room.roomState);

        } catch (error) {
            console.error('Error resetting game:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // ========== SEND CHAT MESSAGE ==========
    socket.on('send_chat_message', (data) => {
        try {
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (!roomCode) return;

            const room = gameManager.getRoom(roomCode);
            if (!room) return;

            const playerId = gameManager.getPlayerIdFromSocket(socket.id, roomCode);
            const player = room.roomState.players.find(p => p.id === playerId);

            if (!player) return;

            // Validate message
            if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
                return;
            }

            // Create chat message
            const chatMessage = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                playerId: player.id,
                playerName: player.name,
                avatar: player.avatar,
                message: data.message.trim().substring(0, 500), // Limit to 500 characters
                timestamp: Date.now()
            };

            // Add message to room state
            const messages = room.roomState.messages || [];
            messages.push(chatMessage);

            gameManager.updateRoomState(roomCode, { messages });

            // Broadcast updated state to all players in room
            io.to(roomCode).emit('room_state', room.roomState);

        } catch (error) {
            console.error('Error sending chat message:', error);
        }
    });

    // ========== RE-RANDOMIZE SECRET WORD ==========
    socket.on('re_randomize_secret_word', async (data) => {
        try {
            const roomCode = gameManager.getRoomCodeForSocket(socket.id);
            if (!roomCode) return;

            const room = gameManager.getRoom(roomCode);
            if (!room) return;

            // Verify requester is host
            const playerId = gameManager.getPlayerIdFromSocket(socket.id, roomCode);
            const player = room.roomState.players.find(p => p.id === playerId);

            if (!player?.isHost) {
                socket.emit('error', { message: 'Only host can re-randomize' });
                return;
            }

            // Only allow during DISCUSSION or VOTING phase
            if (room.roomState.phase !== 'DISCUSSION' && room.roomState.phase !== 'VOTING') {
                socket.emit('error', { message: 'Can only re-randomize during discussion or voting' });
                return;
            }

            // Re-randomize secret word (async due to AI generation)
            const newGameState = await gameLogic.reRandomizeSecretWord(
                room.roomState.config,
                room.roomState.players
            );

            // Keep firstSpeakerId and startTime
            gameManager.updateRoomState(roomCode, {
                ...newGameState,
                firstSpeakerId: room.roomState.firstSpeakerId,
                startTime: Date.now()
            });

            // Send filtered state to each player
            room.roomState.players.forEach(p => {
                const playerSocket = gameManager.getRoom(roomCode).players.get(p.id);
                if (playerSocket) {
                    const filteredState = gameLogic.filterStateForPlayer(room.roomState, p.id);
                    io.to(playerSocket).emit('room_state', filteredState);
                }
            });

            console.log(`🔄 Secret word re-randomized in room ${roomCode}`);

        } catch (error) {
            console.error('Error re-randomizing secret word:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // ========== DISCONNECT ==========
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        handlePlayerDisconnect(socket);
    });
});

// Helper function to handle player disconnect
function handlePlayerDisconnect(socket) {
    const result = gameManager.removePlayer(socket.id);

    if (result && !result.deleted) {
        // Notify remaining players
        io.to(result.roomCode).emit('player_disconnected', {
            playerId: result.playerId,
            playerName: result.player?.name
        });

        // Broadcast updated state
        io.to(result.roomCode).emit('room_state', result.roomState);
    }
}

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Frontend URL: ${FRONTEND_URL}`);
    console.log(`📡 WebSocket server ready`);
});
