// import { createServer, IncomingMessage, ServerResponse } from 'http';
import { type Game } from '@common/types/game';
import type { CreateGameMessage, JoinGameMessage, BaseWsMessage, GameStateMessage, IrcMessage, GetIrcMessage, IrcUpdate, LeaveGameMessage, RtcSignalingMessage } from '@common/types/messages';
import { isSigner } from '@common/utils/web3';
import { v4 as uuidv4 } from 'uuid';
import { WebSocket, WebSocketServer } from 'ws';
import { initPlayerState, lobbyState, gameById, playerById, ircByChannel } from './src/store';

const wss = new WebSocketServer({ port: 8080 });

wss.on('listening', () => {
  console.log('WebSocket server started on port 8080');
});

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected to signaling server');
  let address: string | null = null;

  ws.on('message', (message: string) => {
    const data: BaseWsMessage = JSON.parse(message);

    switch (data.type) {
      case 'SIGNALING': {
        const signaling = data as RtcSignalingMessage;
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'SIGNALING',
              sender: signaling.sender,
              signaling: signaling.signalType,
            }));
          }
        });
        break;
      }
      case 'GET_LOBBY_STATE':
        getLobbyState(ws);
        break;
      case 'GET_GAME_STATE':
        getGameState(ws);
        break;
      case 'SET_GAME_STATE':
        setGameState(ws, data as GameStateMessage);
        break;
      case 'GET_LEADERBOARD':
        getLeaderboard(ws);
        break;
      case 'CREATE_GAME':
        createGame(ws, data as CreateGameMessage);
        break;
      case 'JOIN_GAME':
        joinGame(ws, data as JoinGameMessage);
        break;
      case 'LEAVE_GAME':
        leaveGame(ws, data as LeaveGameMessage);
        break;
      case 'GAME_STATE':
        updateGameState(ws, data as GameStateMessage);
        break;
      case 'IRC_MESSAGE':
        sendIrcMsg(ws, data as IrcMessage);
        break;
      case 'GET_IRC':
        getIrc(ws, data as GetIrcMessage);
        break;
      case 'SETTLE_GAME':
        settleGame(ws, data as SettleGameMessage); // post-game anti-cheat + settlement
        break;
      default:
        console.log('Unknown message type');
    }
  });

  ws.on('error', (error: Error) => {
    console.error('Signaling server error:', error);
  });

  ws.on('close', () => {
    console.log('Client disconnected from signaling server');
  });
});

function getLobbyState(ws: WebSocket) {
  ws.send(JSON.stringify({ type: 'lobbyState', state: lobbyState }));
}

function getGameState(ws: WebSocket) {
  console.warn('getGameState not implemented');
}

function setGameState(ws: WebSocket, data: GameStateMessage) {
  console.warn('setGameState not implemented');
}

function getLeaderboard(ws: WebSocket) {
  console.warn('getLeaderboard not implemented');
}

function createGame(ws: WebSocket, data: CreateGameMessage) {
  if (!isSigner(data.sender, data.nonce, data.sig)) {
    console.warn('Session error');
    return;
  }
  const state0 = {
    byPlayer: {
      [data.sender!]: initPlayerState()
    }, ext: {}
  };
  const game: Game = {
    id: uuidv4(),
    type: data.gameType,
    creator: data.sender!,
    creatorSig: data.sig!,
    players: [data.sender!],
    status: 'PENDING',
    config: data.config,
    createdAt: Date.now(),
    irc: { history: [], enabled: true },
    state: state0,
    stateHistory: [state0],
    playerSig: {},
  };
  broadcastLobbyUpdate();
  ws.send(JSON.stringify({ type: 'gameCreated', game }));
}

function joinGame(ws: WebSocket, data: JoinGameMessage) {
  console.warn('joinGame not implemented');
}

function leaveGame(ws: WebSocket, data: LeaveGameMessage) {
  console.warn('leaveGame not implemented');
}

function updateGameState(ws: WebSocket, data: GameStateMessage) {
  console.warn('updateGameState not implemented');
}

function sendIrcMsg(ws: WebSocket, data: IrcMessage) {
  console.warn('sendIrcMsg not implemented');
}

function broadcastLobbyUpdate() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'lobbyUpdate', state: lobbyState }));
    }
  });
}
