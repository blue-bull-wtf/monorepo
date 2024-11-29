export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winsByGameType: Record<string, number>;
  lossesByGameType: Record<string, number>;
  totalStaked: string;
  stakedByGameType: Record<string, string>;
  totalWon: string;
  totalWonByGameType: Record<string, string>;
}

export interface Player {
  address: string; // id
  signature: string;
  joinedAt: number;
  isReady: boolean;
  isOnline: boolean;
  stats: PlayerStats;
  game: string; // id
}

export type PlayerStatus = 'OBSERVER' | 'ALIVE' | 'DEAD' | 'ELIMINATED';

// in-game
export interface PlayerGameState {
  time: number; // epoch ms
  pos: number[]; // x, y, z
  rot: number[]; // x, y, z
  vel: number[]; // 3d velocity
  health: number;
  energy: number;
  status: PlayerStatus;
  score: number;
  lagScore: number; // p2p detected lagg adds up until elimination, detected from time sync (ping)
  botScore: number; // suspicious behavior adds up until elimination
  ext: any; // game-specific state extension (inventory...)
}
