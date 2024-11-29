import { ref, onMounted, onUnmounted } from 'vue';
import { useWs } from './useWs';
import { useAppKitAccount } from '@reown/appkit/vue';
import { IrcMessage } from '@common/types/messages';
import { isSigner } from '@common/utils/web3';
import { session } from '../store';

const activeChannels = new Set<string>();
const unsubs: CallableFunction[] = [];

export function useIrc(channel='LOBBY') {
  const { ws } = useWs();
  const accountInfo = useAppKitAccount();
  const messages = ref([] as IrcMessage[]);

  onMounted(() => {
    if (!activeChannels.has(channel)) {
      unsubs.push(ws.subscribeTo(`IRC_UPDATE:${channel}`, (data: IrcMessage) => {
        data.time = Date.now();
        messages.value.push(data);
        if (messages.value.length > 100) {
          messages.value.shift();
        }
      }));
      activeChannels.add(channel);
    }
    onUnmounted(() => {
      for (let unsub of unsubs) {
        unsub();
      }
    });
  });

  const send = (message: string) => {
    if (!accountInfo.value.isConnected) return;
    if (!isSigner(accountInfo.value.address!, session.activeNonce.value, session.activeSig.value)) {
      console.warn('Session error');
      return;
    }
    const ircMsg: IrcMessage = {
      type: 'IRC_MESSAGE',
      channel,
      message,
      sender: accountInfo.value.address!,
    };
    ws.sendSigned(ircMsg);
  };

  return {
    send,
    messages
  };
}
