import type { Game, GameStatus } from "./game";
import type { Irc } from "./messages";
import type { ProtocolStats } from "./protocol";

export interface LobbyState {
  protocolStats: ProtocolStats;
  gamesByStatus: Record<GameStatus, Set<Game>>;
  irc: Irc;
}
