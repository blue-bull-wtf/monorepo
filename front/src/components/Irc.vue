<template lang="pug">
.div.irc-container.flex.flex-col.border.border-gray-700.rounded-lg.bg-gray-800.p-4
  // Messages Section
  .irc-messages.flex-grow.overflow-y-auto.max-h-72.mb-4
    .irc-message.mb-2.text-sm.text-gray-300(v-for="(msg, index) in messages" :key="index")
      span.irc-author.font-bold.text-blue-400 {{ msg.sender }}
      | : 
      span.irc-content {{ msg.content }}

  // Input Section
  .irc-input.flex.gap-2
    input.flex-grow.px-4.py-2.rounded.border.border-gray-600.bg-gray-700.text-white(
      type="text"
      placeholder="Type a message..."
      v-model="newMessage"
      @keyup.enter="sendMessage"
    )
    button.px-4.py-2.rounded.bg-blue-500.hover_bg-blue-600.text-white.font-medium(
      @click="sendMessage"
    ) Send
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useIrc } from '@/composables/useIrc';

export default defineComponent({
  name: 'Irc',
  props: {
    channel: {
      type: String,
      defaut: 'LOBBY', // e.g., 'LOBBY' or 'GAME-{gameId}'
    },
  },
  setup(props) {
    const { send, messages } = useIrc(props.channel);
    const newMessage = ref('');
    const sendMessage = send(newMessage.value);

    return {
      newMessage,
      sendMessage,
      messages,
      send,
    };
  },
});
</script>

<style scoped>
/* Add scoped styles if necessary */
</style>
