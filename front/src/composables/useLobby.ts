import { ref, computed } from 'vue';
import { Game, GameType, GameConfig } from '@common/types/game';
import { LobbyState } from '@common/types/lobby';
import { useWs } from './useWs';
import { useAppKitAccount } from '@reown/appkit/vue';
import { signMessage } from '../utils/web3';
import { JoinGameMessage, LeaveGameMessage } from '@common/types/messages';

export function useLobby() {
  const { ws } = useWs();
  const accountInfo = useAppKitAccount();
  const state = ref({} as LobbyState);

  const computedState = {
    pendingGames: computed(() => state.value.gamesByStatus['PENDING']),
    ongoingGames: computed(() => state.value.gamesByStatus['ONGOING']),
    protocolStats: computed(() => state.value.protocolStats),
    irc: computed(() => state.value.irc),
  };

  const createGame = async (type: GameType, config: GameConfig) => {
    if (!accountInfo.value.isConnected) return;
    
    const message = `Create game: ${type} - ${JSON.stringify(config)}`;
    const signature = await signMessage(message);
    
    ws.send({
      type: 'CREATE_GAME',
      address: accountInfo.value.address,
      gameType: type,
      config,
      signature,
      timestamp: Date.now()
    });
  };

  const joinGame = async (game: Game) => {
    if (!accountInfo.value.isConnected) {
      console.warn('Not connected');
      return;
    }
    const nonce = `Join game: ${game.type} [${game.id}]`;
    const sig = await signMessage(nonce);

    ws.sendSigned(<JoinGameMessage>{
      type: 'JOIN_GAME',
      sender: accountInfo.value.address!,
      sig,
      nonce
    });
  };

  const leaveGame = (game: Game) => {
    if (!accountInfo.value.isConnected) {
      console.warn('Not connected');
      return;
    }

    ws.sendSigned(<LeaveGameMessage>{
      type: 'LEAVE_GAME',
      sender: accountInfo.value.address!,
      game: game.id,
    });
  };

  return {
    ...computedState,
    createGame,
    joinGame,
    leaveGame
  };
}
