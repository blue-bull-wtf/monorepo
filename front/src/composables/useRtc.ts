import { ref, onMounted, onUnmounted } from 'vue';
import { useWs } from './useWs';
import { RtcSignalingMessage } from '@common/types/messages';

export function useRtc(channel: string) {
  const { ws } = useWs();
  const peerConnection = ref<RTCPeerConnection | null>(null);
  const dataChannel = ref<RTCDataChannel | null>(null);
  const messages = ref<string[]>([]);
  const messageCallbacks = new Set<(message: string) => void>();

  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: Array.from({ length: 4 }, (_, i) => ({
        urls: `stun:stun${i === 0 ? '' : i}.l.google.com:19302`,
      })),
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send({
          type: 'SIGNALING',
          channel,
          signalType: 'ice-candidate',
          payload: event.candidate,
        });
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      setupDataChannel(channel);
    };

    peerConnection.value = pc;
  };

  const setupDataChannel = (channel: RTCDataChannel) => {
    dataChannel.value = channel;

    channel.onopen = () => console.log('Data channel is open');
    channel.onmessage = (event) => {
      const message = event.data;
      messages.value.push(message);

      // prevent memory overflow if games last
      if (messages.value.length > 100) {
        messages.value.shift();
      }

      // invoke all registered callbacks
      messageCallbacks.forEach((callback) => callback(message));
    };
  };

  const createOffer = async () => {
    if (!peerConnection.value) return;

    const offer = await peerConnection.value.createOffer();
    await peerConnection.value.setLocalDescription(offer);

    ws.send(<RtcSignalingMessage>{
      type: 'SIGNALING',
      channel,
      signalType: 'offer',
      payload: offer,
    });
  };

  const sendMessage = (message: string) => {
    if (dataChannel.value && dataChannel.value.readyState === 'open') {
      dataChannel.value.send(message);
      console.log('Message sent:', message);
    } else {
      console.error('Data channel is not open');
    }
  };

  const handleSignaling = async (signaling: RtcSignalingMessage) => {
    if (!peerConnection.value) setupPeerConnection();

    switch (signaling.signalType) {
      case 'offer':
        await peerConnection.value!.setRemoteDescription(
          new RTCSessionDescription(signaling.payload),
        );
        const answer = await peerConnection.value!.createAnswer();
        await peerConnection.value!.setLocalDescription(answer);
        ws.send(<RtcSignalingMessage>{
          type: 'SIGNALING',
          channel,
          signalType: 'answer',
          payload: answer,
        });
        break;
      case 'answer':
        await peerConnection.value!.setRemoteDescription(
          new RTCSessionDescription(signaling.payload),
        );
        break;
      case 'ice-candidate':
        await peerConnection.value!.addIceCandidate(
          new RTCIceCandidate(signaling.payload),
        );
        break;
    }
  };

  const addCallback = (callback: (message: string) => void) => {
    messageCallbacks.add(callback);
    return () => {
      messageCallbacks.delete(callback);
    };
  };

  onMounted(() => {
    // Subscribe to the specific signaling channel
    const unsubscribe = ws.subscribeTo('SIGNALING', (data: any) => {
      if (data.channel === channel) {
        handleSignaling(data);
      }
    });

    onUnmounted(() => {
      unsubscribe(); // Cleanup listener on unmount
    });
  });

  return {
    messages,
    createOffer,
    setupPeerConnection,
    sendMessage,
    dataChannel,
    addCallback,
  };
}
