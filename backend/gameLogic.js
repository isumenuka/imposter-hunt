import { aiService } from './aiService.js';

/**
 * Server-side game logic for Imposter Guess Word
 * All game rules, validation, and state transitions happen here
 */

const GAME_CATEGORIES = [
    'Animals', 'Food', 'Sports', 'Technology', 'Movies',
    'Music', 'Countries', 'Professions', 'Everything'
];

const AVATARS = ['🦊', '🐼', '🦁', '🐸', '🐙', '🦄', '🐲', '🦉', '🐺', '🦈'];

/**
 * Fisher-Yates shuffle algorithm for fair randomization
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function fisherYatesShuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

class GameLogic {
    /**
     * Assign random unique avatars to players
     * @param {Array} players 
     * @returns {Array} Players with avatars
     */
    assignUniqueAvatars(players) {
        const shuffledAvatars = [...AVATARS].sort(() => Math.random() - 0.5);
        return players.map((player, index) => ({
            ...player,
            avatar: shuffledAvatars[index % shuffledAvatars.length]
        }));
    }

    /**
     * Assign random roles to players
     * @param {Array} players 
     * @param {number} imposterCount 
     * @returns {Array} Players with roles assigned
     */
    assignRandomRoles(players, imposterCount) {
        const playerCount = players.length;

        // Validate imposter count
        const validImposterCount = Math.min(
            Math.max(1, imposterCount),
            Math.floor(playerCount / 2)
        );

        // Shuffle indices
        const indices = Array.from({ length: playerCount }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        // Assign roles
        return players.map((player, index) => ({
            ...player,
            role: indices.indexOf(index) < validImposterCount ? 'imposter' : 'innocent',
            isReady: false,
            vote: null
        }));
    }

    /**
     * Start a new game round
     * @param {Array} players 
     * @param {Object} config 
     * @returns {Promise<Object>} Updated game state
     */
    async startGame(players, config) {
        const playerCount = players.length;

        // Validate player count
        if (playerCount < 3) {
            throw new Error('Need at least 3 players to start');
        }

        // Determine imposter count
        const imposterCount = Math.min(
            config.imposterCount || 1,
            Math.floor(playerCount / 2)
        );

        // Assign roles
        const playersWithRoles = this.assignRandomRoles(players, imposterCount);

        // Select category from available categories
        const availableCategories = config.selectedCategories?.length > 0
            ? config.selectedCategories
            : GAME_CATEGORIES;

        const selectedCategory = availableCategories[
            Math.floor(Math.random() * availableCategories.length)
        ];

        // Generate word and association word
        const { word, associationWord } = await aiService.generateGameContent(selectedCategory);

        return {
            players: playersWithRoles,
            config: {
                ...config,
                category: selectedCategory,
                word,
                associationWord: config.imposterClueEnabled ? associationWord : undefined
            },
            phase: 'REVEAL'
        };
    }

    /**
     * Start the discussion phase
     * @param {Array} players 
     * @returns {Object} Discussion phase state
     */
    startDiscussion(players) {
        const randomIndex = Math.floor(Math.random() * players.length);
        const firstSpeakerId = players[randomIndex].id;

        // Generate speaking order: first speaker + shuffled remaining players
        const remainingPlayers = players.filter(p => p.id !== firstSpeakerId);
        const shuffledRemaining = fisherYatesShuffle(remainingPlayers);
        const speakingOrder = [firstSpeakerId, ...shuffledRemaining.map(p => p.id)];

        // Reset votingReady for all players
        const playersWithResetVotingReady = players.map(p => ({
            ...p,
            votingReady: false
        }));

        return {
            phase: 'DISCUSSION',
            firstSpeakerId,
            speakingOrder,
            startTime: Date.now(),
            players: playersWithResetVotingReady
        };
    }

    /**
     * Mark a player as ready for voting
     * @param {string} playerId 
     * @param {Array} players 
     * @returns {Array} Updated players
     */
    markPlayerVotingReady(playerId, players) {
        return players.map(player =>
            player.id === playerId
                ? { ...player, votingReady: true }
                : player
        );
    }

    /**
     * Check if all players are ready for voting
     * @param {Array} players 
     * @returns {boolean}
     */
    allPlayersVotingReady(players) {
        return players.every(p => p.votingReady === true);
    }

    /**
     * Validate and record a vote
     * @param {string} voterId 
     * @param {string} suspectId 
     * @param {Array} players 
     * @returns {Object} Validation result
     */
    validateVote(voterId, suspectId, players) {
        const voter = players.find(p => p.id === voterId);
        const suspect = players.find(p => p.id === suspectId);

        if (!voter) {
            return { valid: false, error: 'Voter not found' };
        }

        if (!suspect) {
            return { valid: false, error: 'Suspect not found' };
        }

        if (voter.vote) {
            return { valid: false, error: 'Already voted' };
        }

        if (voterId === suspectId) {
            return { valid: false, error: 'Cannot vote for yourself' };
        }

        return { valid: true };
    }

    /**
     * Cast a vote and update player state
     * @param {string} voterId 
     * @param {string} suspectId 
     * @param {Array} players 
     * @returns {Array} Updated players
     */
    castVote(voterId, suspectId, players) {
        return players.map(player =>
            player.id === voterId
                ? { ...player, vote: suspectId }
                : player
        );
    }

    /**
     * Check if all players have voted
     * @param {Array} players 
     * @returns {boolean}
     */
    allPlayersVoted(players) {
        return players.every(p => p.vote !== null && p.vote !== undefined);
    }

    /**
     * Calculate game results
     * @param {Array} players 
     * @returns {Object} Results with winner and vote counts
     */
    calculateResults(players) {
        // Count votes
        const votes = {};
        players.forEach(player => {
            if (player.vote) {
                votes[player.vote] = (votes[player.vote] || 0) + 1;
            }
        });

        // Find player with most votes
        let maxVotes = 0;
        let votedOutId = null;
        let isTie = false;

        Object.entries(votes).forEach(([playerId, voteCount]) => {
            if (voteCount > maxVotes) {
                maxVotes = voteCount;
                votedOutId = playerId;
                isTie = false;
            } else if (voteCount === maxVotes && maxVotes > 0) {
                isTie = true;
            }
        });

        // Determine winner
        let winners = 'imposter'; // Default: imposters win

        if (votedOutId && !isTie) {
            const votedPlayer = players.find(p => p.id === votedOutId);
            if (votedPlayer?.role === 'imposter') {
                winners = 'innocent';
            }
        }

        return {
            phase: 'RESULTS',
            winners,
            votedOutId: isTie ? null : votedOutId,
            voteCount: votes
        };
    }

    /**
     * Filter room state for a specific player (hide sensitive info)
     * @param {Object} roomState 
     * @param {string} playerId 
     * @returns {Object} Filtered room state
     */
    filterStateForPlayer(roomState, playerId) {
        const currentPlayer = roomState.players.find(p => p.id === playerId);

        // During REVEAL and DISCUSSION phases, hide other players' roles
        if (roomState.phase === 'REVEAL' || roomState.phase === 'DISCUSSION' || roomState.phase === 'VOTING') {
            const filteredPlayers = roomState.players.map(player => {
                if (player.id === playerId) {
                    // Current player: show their role and appropriate word
                    return player;
                } else {
                    // Other players: hide role
                    return {
                        ...player,
                        role: undefined // Hide other players' roles
                    };
                }
            });

            // Determine what word to show
            let wordToShow = undefined;
            let associationWordToShow = undefined;

            if (currentPlayer?.role === 'innocent') {
                wordToShow = roomState.config.word;
            } else if (currentPlayer?.role === 'imposter' && roomState.config.imposterClueEnabled) {
                associationWordToShow = roomState.config.associationWord;
            }

            return {
                ...roomState,
                players: filteredPlayers,
                config: {
                    ...roomState.config,
                    word: wordToShow,
                    associationWord: associationWordToShow
                }
            };
        }

        // In RESULTS phase, show everything
        return roomState;
    }

    /**
     * Re-randomize secret word (keep roles intact)
     * @param {Object} config - Current game config
     * @param {Array} players - Current players with roles
     * @returns {Promise<Object>} Updated game state
     */
    async reRandomizeSecretWord(config, players) {
        // Generate new word and association word from same category
        const { word, associationWord } = await aiService.generateGameContent(config.category);

        // Reset player ready states and votes, keep roles
        const resetPlayers = players.map(p => ({
            ...p,
            isReady: false,
            vote: undefined
        }));

        return {
            phase: 'REVEAL',
            players: resetPlayers,
            config: {
                ...config,
                word,
                associationWord: config.imposterClueEnabled ? associationWord : undefined
            }
        };
    }

    /**
     * Reset game to lobby state
     * @param {Array} players 
     * @param {Object} config 
     * @returns {Object} Reset state
     */
    resetGame(players, config) {
        const resetPlayers = players.map(player => ({
            id: player.id,
            name: player.name,
            avatar: player.avatar,
            isHost: player.isHost,
            role: undefined,
            vote: undefined,
            isReady: undefined,
            selectedCategories: undefined
        }));

        return {
            phase: 'LOBBY',
            players: resetPlayers,
            config: {
                ...config,
                selectedCategories: [],
                word: undefined,
                associationWord: undefined
            },
            startTime: undefined,
            firstSpeakerId: undefined,
            winners: undefined,
            messages: [] // Clear chat history
        };
    }
}

export const gameLogic = new GameLogic();
