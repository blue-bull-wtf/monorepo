import type { Game, GameState, GlobalGameStats } from "@common/types/game";
import type { LobbyState } from "@common/types/lobby";
import type { Player, PlayerGameState } from "@common/types/player";
import type { ProtocolStats } from "@common/types/protocol";
import type { Irc } from "@common/types/messages";
import { v4 as uuidv4 } from 'uuid';
import { isSigner } from "@common/utils/web3";

const initPlayerState = (s: Partial<PlayerGameState>={}): PlayerGameState => ({
  pos: [0,0,0],
  rot: [0,0,0],
  vel: [0,0,0],
  health: 100,
  energy: 100,
  score: 0,
  lagScore: 0,
  botScore: 0,
  time: Date.now(),
  status: 'OBSERVER',
  ext: {},
  ...s, // overrides
});

const initGameStats = (): GlobalGameStats => ({
  totalPlayers: 0,
  currentPlayers: 0,
  totalStaked: 0,
  currentStakes: 0,
  winRateLeaderboard: [],
  winLeaderboard: [],
  stakeWinLeaderboard: [],
  totalPlayTime: 0,
  countByStatus: {
    CANCELLED: 0,
    FINISHED: 0,
    ONGOING: 0,
    PENDING: 0,
  },
  playerCountByStatus: {
    CANCELLED: 0,
    FINISHED: 0,
    ONGOING: 0,
    PENDING: 0,
  }
});

const initProtocolStats = (): ProtocolStats => ({
  playersInLobby: 0,
  inGamePlayers: 0,
  onlinePlayers: 0,
  statsByGameType: {
    'Bull Run': initGameStats(),
    'Blue Pill': initGameStats(),
    'Coinect 4': initGameStats(),
    'Ethris': initGameStats(),
    'Pacmoon': initGameStats(),
    'Bombermoon': initGameStats(),
  }
});

const initIrc = (): Irc => ({
  messages: [],
  enabled: true
});

const initLobbyState = (): LobbyState => ({
  protocolStats: initProtocolStats(),
  gamesByStatus: {
    PENDING: new Set(),
    ONGOING: new Set(),
    FINISHED: new Set(),
    CANCELLED: new Set()
  },
  irc: initIrc()
});

// TODO: use ./services/redis to store/retrieve players, games and lobby state
const playerById: { [key: string]: Player } = {};
const gameById: { [key: string]: Game } = {};
const lobbyState: LobbyState = initLobbyState();
const ircByChannel: { [key: string]: Irc } = {
  'LOBBY': lobbyState.irc
};

const initGameState = (): GameState => ({
  byPlayer: {},
  ext: {}
});

const initGame = (g: Partial<Game>): Game => {
  if (!g.creator?.address || !g.creator?.nonce || !g.creator?.sig) {
    throw new Error('Game must be signed by creator');
  }
  if (!isSigner(g.creator.address, g.creator.nonce, g.creator.sig)) {
    throw new Error('Game creator signature is invalid');
  }
  g = {
    id: uuidv4(),
    type: g.type ?? 'Bull Run',
    status: 'PENDING',
    config: g.config ?? {
      mapSize: 'MEDIUM',
      gameSpeed: 'SLOW',
      maxPlayers: 2,
      theme: 'DEFAULT',
    },
    players: g.players ?? [],
    playerSig: {},
    createdAt: Date.now(),
    // startedAt: null,
    // endedAt: null,
    // winners: null,
    irc: initIrc(),
    state: initGameState(),
    stateHistory: [],
    ...g
  };
  gameById[g.id!] = <Game>g;
  ircByChannel[`GAME:${g.id}`] = g.irc!;
  return <Game>g;
};

export {
  initPlayerState,
  initGameStats,
  initProtocolStats,
  initLobbyState,
  initGameState,
  initGame,
  initIrc,
  playerById,
  gameById,
  lobbyState,
  ircByChannel
}
