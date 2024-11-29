<template lang="pug">
dotlottie-player(
  :style="style"
  v-bind="options"
  ref="player"
  :autoplay.attr="options.autoplay ? true : null"
  :loop.attr="options.loop ? true : null"
  :speed.attr="options.speed ? options.speed : null"
)

</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import '@dotlottie/player-component';
import { ILottie } from '../models/types';

export default defineComponent({
  name: 'Lottie',
  props: {
    options: {
      type: Object as () => ILottie,
      required: true
    },
  },
  setup({ options }, { emit }) {
    const player = ref<HTMLElement & ILottie>();
    // TODO: make computed
    const style = ref({
      // width: options.width ? `${options.width}px` : '100%',
      // height: options.height ? `${options.height}px` : '100%',
      overflow: 'hidden',
      margin: '0 auto'
    });

    options.autoplay = options.autoplay ?? true;
    options.loop = options.loop ?? true;
    options.speed = options.speed ?? 1;

    onMounted(() => {
      // forward lottie events
      // Note: Event names or available events might be different
      for (const event of ['complete', 'loopComplete', 'enterFrame', 'segmentStart'])
        player.value!.addEventListener(event, () => emit(event));

      emit('animCreated', player);
    });

    // Define a function to update the animation based on the options
    const updateAnimation = (_new: ILottie, _old: ILottie) => {
      if (!player.value) return;

      if (_new.speed != null) player.value.speed = _new.speed;
      if (_new.loop != null) player.value.loop = _new.loop;
      if (_new.autoplay != null) player.value.autoplay = _new.autoplay;

      if (_new.src && _new.src !== _old.src) {
        player.value.src = _new.src;
      }
    };

    // Watch each property of options individually
    watch(() => options, updateAnimation, { deep: true });

    // Expose Lottie methods
    const play = () => player.value?.play?.();
    const pause = () => player.value?.pause?.();
    const stop = () => player.value?.stop?.();
    const setSpeed = (speed: number) => { if (player.value) player.value.speed = speed; };

    return {
      player,
      style,
      play,
      pause,
      stop,
      setSpeed,
    };
  }
});
</script>
../models/models/types