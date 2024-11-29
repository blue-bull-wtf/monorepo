import type { Irc } from './messages';
import type { PlayerGameState } from './player';

export type GameType = 'Blue Pill' | 'Bull Run' | 'Coinect 4' | 'Ethris' | 'Pacmoon' | 'Bombermoon';
export type GameStatus = 'PENDING' | 'ONGOING' | 'FINISHED' | 'CANCELLED';

export interface GameConfig {
  mapSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'XLARGE';
  gameSpeed: 'SLOW' | 'NORMAL' | 'FAST';
  maxPlayers: number;
  theme: 'DEFAULT' | 'DEGEN';
  stakes?: { // undefined for f2p
    token: string; // token address
    amount: string; // in wei
  };
}

export interface GameState {
  byPlayer: Record<string, PlayerGameState>;
  ext: any; // game-specific state extension (map...)
}

// game instance
export interface Game {
  id: string;
  type: GameType;
  status: GameStatus;
  config: GameConfig;
  creator: {
    address: string;
    sig: string;
    nonce: string;
  };
  players: string[]; // ids
  playerSig: Record<string, string>;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  winners?: string[];
  irc: Irc;
  state: GameState; // last state
  stateHistory: GameState[]; // for replaying game states, anti-cheat, replays...
}

export interface GlobalGameStats {
  totalPlayers: number;
  currentPlayers: number; // number of players currently in the game
  totalStaked: number;
  currentStakes: number; // equivalent of open interests
  winRateLeaderboard: string[]; // the 100 best players by winrate
  winLeaderboard: string[]; // the 100 best players by wins
  stakeWinLeaderboard: string[]; // the 100 best players by stake wins
  totalPlayTime: number; // in seconds, sum of all players in-game time
  countByStatus: Record<GameStatus, number>; // PENDING, ONGOING, FINISHED, CANCELLED
  playerCountByStatus: Record<GameStatus, number>; // PENDING, ONGOING, FINISHED, CANCELLED
}
