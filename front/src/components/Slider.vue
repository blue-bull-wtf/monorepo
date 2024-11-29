<template lang="pug">
.slider.relative.flex-v.y-center.w-full.min-w-8(
  :class="{ disabled }"
)
  .label.text-grey-dark.text-sm.mb-2(v-if="label") {{ label }}
  .track.w-full.h-2.rounded-full.relative(
    ref="sliderTrack"
    :style="{ background: disabled ? 'var(--dark-grey)': `linear-gradient(to right, var(--primary) ${modelValue}%, var(--dark-grey) ${modelValue}%, var(--grey) 100%)` }"
  )
    .range.h-2.rounded-full.bg-primary(
      :style="{ width: `${modelValue}%` }"
    )
    .thumb.w-2.h-4.bg-white.rounded-full.shadow-md.absolute(
      ref="sliderThumb"
      :style="{ left: `${modelValue}%` }"
      @mousedown="startDrag"
      @touchstart="startDrag"
    )
      svg.w-2.h-2.fill-grey-dark.mx-auto(mounted) # Use an icon if desired
        use(xlink:href="#slider-icon") # Ensure to define the icon in your SVG sprite
</template>
<script lang="ts">
import { defineComponent, nextTick, ref, Ref, watch } from 'vue';

export default defineComponent({
  name: 'Slider',
  props: {
    label: {
      type: String,
      required: false,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
    modelValue: {
      type: Number,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const isDragging = ref(false);
    const sliderThumb = ref() as Ref<HTMLElement>;
    const sliderTrack = ref() as Ref<HTMLElement>;

    watch(
      () => props.modelValue,
      (newValue) => {
        // Ensure value is within bounds
        const boundedValue = Math.min(Math.max(newValue, props.min), props.max);
        emit('update:modelValue', boundedValue);
      }
    );

    const startDrag = (event: DragEvent|MouseEvent|TouchEvent) => {
      if (props.disabled) return;
      isDragging.value = true;
      document.addEventListener('mousemove', <any>drag);
      document.addEventListener('touchmove', <any>drag);
      document.addEventListener('mouseup', endDrag);
      document.addEventListener('touchend', endDrag);
      drag(<any>event);
    };

    const drag = (event: DragEvent|MouseEvent|TouchEvent) => {
      if (!isDragging.value || props.disabled) return;
      const { left, width } = sliderTrack.value!.getBoundingClientRect();
      let newPosition = ((<any>event).clientX || (<any>event).touches[0].clientX) - left;
      newPosition = Math.max(0, Math.min(newPosition, width));
      const newPercentage = (newPosition / width) * 100;
      const steppedValue = Math.round(newPercentage / props.step) * props.step;
      emit('update:modelValue', steppedValue);
      emit('input', steppedValue); // emit input (native input compliance)
    };

    const endDrag = () => {
      if (isDragging.value) emit('change', props.modelValue); // native input compliance
      isDragging.value = false;
      document.removeEventListener('mousemove', <any>drag);
      document.removeEventListener('touchmove', <any>drag);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchend', endDrag);
    };

    nextTick(() => {
      if (sliderThumb.value && sliderTrack.value) {
        // Initial setup, not necessary here but useful for dynamic changes
      }
    });

    return {
      sliderThumb,
      sliderTrack,
      startDrag,
      isDragging,
    };
  },
});
</script>

<style lang="postcss" scoped>
.slider {
  &.disabled {
    @apply opacity-50;
    cursor: not-allowed;
  }

  .thumb {
    top: 50%;
    transform: translateY(-50%) translateX(-50%);
    cursor: pointer;

    &.shadow-md {
      @apply shadow;
    }
  }
}
</style>