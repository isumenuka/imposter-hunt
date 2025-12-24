export enum GamePhase {
  LOBBY = 'LOBBY',
  SETTINGS = 'SETTINGS',
  REVEAL = 'REVEAL',
  DISCUSSION = 'DISCUSSION',
  VOTING = 'VOTING',
  RESULTS = 'RESULTS'
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  role?: 'innocent' | 'imposter';
  vote?: string; // ID of the player they voted for
  isReady?: boolean; // Used during reveal phase
  selectedCategories?: string[]; // Categories this player wants to play
}

export interface GameConfig {
  category: string; // The specific category chosen for the current round
  selectedCategories: string[]; // The pool of categories the host ticked
  roundDuration: number; // in seconds
  imposterCount: number;
  associationWordEnabled: boolean; // Toggle for showing association word to imposters
  word?: string; // The secret word
  associationWord?: string; // Ambiguous association word for the imposter
}

export interface RoomState {
  gameMode: 'ONLINE' | 'OFFLINE';
  roomCode: string;
  players: Player[];
  phase: GamePhase;
  config: GameConfig;
  startTime?: number;
  firstSpeakerId?: string;
  winners?: 'innocent' | 'imposter';
  connectionStatus?: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
  error?: string; // Error message for failed operations

  // Offline Mode Specifics
  activePlayerId?: string; // Who is currently holding the phone
  isTurnHidden?: boolean; // Should we show the "Pass to X" screen?
}

export interface GameStateMessage {
  type: 'STATE_UPDATE';
  payload: RoomState;
}

export type GameActionType =
  | 'JOIN_REQUEST'
  | 'UPDATE_SETTINGS'
  | 'UPDATE_PLAYER_CATEGORIES'
  | 'GO_TO_SETTINGS'
  | 'START_GAME'
  | 'PLAYER_READY'
  | 'START_VOTING'
  | 'CAST_VOTE'
  | 'RESET_GAME'
  // Offline specific
  | 'ADD_OFFLINE_PLAYER'
  | 'NEXT_OFFLINE_TURN'
  | 'REVEAL_TURN'; // User clicked "I am ready" to see their turn

export interface GameAction {
  type: GameActionType;
  payload?: any;
  playerId?: string;
}