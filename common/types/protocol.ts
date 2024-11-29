import type { GameType, GameStatus, GlobalGameStats, Game } from './game';

export interface ProtocolStats {
  playersInLobby: number;
  inGamePlayers: number;
  onlinePlayers: number; // lobby + in-game
  statsByGameType: Record<GameType, GlobalGameStats>;
}
