import type { GameConfig, GameType } from './game';
import type { LobbyState } from './lobby';

// websockets
export interface BaseWsMessage {
  type: string;
  time?: number;
  sender?: string;
  nonce?: string; // session nonce
  sig?: string; // session signature
}

export interface RtcSignalingMessage extends BaseWsMessage {
  type: 'SIGNALING';
  signalType: 'offer' | 'answer' | 'ice-candidate';
  payload: any;
}

export interface CreateGameMessage extends BaseWsMessage {
  type: 'CREATE_GAME';
  gameType: GameType;
  config: GameConfig;
}

export interface JoinGameMessage extends BaseWsMessage {
  type: 'JOIN_GAME';
  game: string;
  playerAddress: string;
}

export interface LeaveGameMessage extends BaseWsMessage {
  type: 'LEAVE_GAME';
  game: string;
}

export interface LeaderboardMessage extends BaseWsMessage {
  type: 'LEADERBOARD';
  leaderboard: any; // TODO: Leaderboard
}

export interface LobbyStateMessage extends BaseWsMessage {
  type: 'LOBBY_STATE';
  state: LobbyState;
}

export interface GameStateMessage extends BaseWsMessage {
  type: 'GAME_STATE';
  game: string; // id
  state: any; // Game-specific state
}

// minimal IRC implementation
export interface GetIrcMessage extends BaseWsMessage {
  type: 'GET_IRC';
  channel: string; // either 'lobby', a user address (id) or a game id
}

export interface IrcMessage extends BaseWsMessage {
  type: 'IRC_MESSAGE';
  sender: string;
  channel: string; // either 'lobby', a user address (id) or a game id
  message: string; // message content (raw text/payload)
}

export interface IrcUpdate extends BaseWsMessage {
  type: 'IRC_UPDATE';
  channel: string; // either 'lobby', a user address (id) or a game id
  messages: IrcMessage[]; // max 100 messages
}

export interface Irc {
  messages: IrcMessage[]; // max 100 messages
  enabled: boolean;
}
