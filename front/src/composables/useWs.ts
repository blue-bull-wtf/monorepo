import { ref, onMounted, onUnmounted } from 'vue';
import { WS } from '../services/ws';

export function useWs() {
  const lastMessage = ref<any>(null);
  const connected = ref<boolean>(false);
  const ws = WS.getInstance();

  const updateConnectionStatus = (data: any) => {
    if (data.type === 'ws-open') {
      connected.value = true;
    } else if (data.type === 'ws-close') {
      connected.value = false;
    } else {
      lastMessage.value = data;
    }
  };

  onMounted(() => {
    const unsubscribe = ws.subscribe(updateConnectionStatus);

    onUnmounted(() => {
      unsubscribe();
    });
  });

  return {
    send: ws.send,
    subscribe: ws.subscribe,
    subscribeTo: ws.subscribeTo,
    reconnect: ws.reconnect,
    connected,
    lastMessage,
    ws
  };
}
