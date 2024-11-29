<template lang="pug">
.toast.fade-in.box.bordered.overflow-hidden.transition-all.pointer-events-auto.font-size-sm.z-50.flex-h.p-2.y-center.x-space-btw.minw-s.maxw-ml.backdrop-blur-medium(:class="classes")
  // this is injected by toaster.ts
  .body.flex-h.y-center.x-start.g-2.grow
    Svg.h-5.w-5.mr-2.h4.fill-inherit(v-if="icon" :icon="icon")
    .message.h8(v-html="message")

  //- .controls
  .actions.buttons.group.flex-h.y-center.h-full
    template(v-for="(cb, name) in actions" :key="name")
      button.border-inherit.bg-inherit.text-inherit.ml-2(@click="() => { close(); cb(); }") {{ name }}

    template(v-if="closable")
      button.close.square.ml-2.flex(v-if="closable" aria-label='Close' @click="close()")
        Svg.w-5.h-5.fill-inherit(icon="icons/close")

  .autoclose-timer.absolute.h-1(v-if="autoClose", ref="autoCloseRef")

</template>

<script lang="ts">
import { defineComponent, ref, onMounted, Ref, nextTick } from "vue";
import { ActionByName, DEFAULT_CALLBACK } from "../../../common/utils/typing";
import { round } from "../../../common/utils/maths";

export default defineComponent({
  name: "Toast",
  components: {},
  emits: ["close"],
  props: {
    message: { type: String, required: true },
    icon: { type: String, default: "info" },
    closable: { type: Boolean, default: true },
    actions: { type: Object as () => ActionByName, default: {} },
    close: { type: Function, default: DEFAULT_CALLBACK },
    autoClose: { type: Boolean, default: true },
    autoCloseSeconds: { type: Number, default: 3 },
    classes: { type: String, default: "" }
  },
  setup: (props) => {
    const autoCloseRef = ref() as Ref<HTMLElement>;
    onMounted(() => {
      if (props.autoClose) {
        autoCloseRef.value.style.transition = `all ${round(props.autoCloseSeconds + .15, 2)}s linear`;
        nextTick(() => autoCloseRef.value.style.width = "1%"); // 1 frame
      }
    });
    const close = () => props.close();
    return { autoCloseRef, close };
  },
  methods: {},
});
</script>

<style scoped lang="postcss">
.toast {

  .autoclose-timer {
    width: 102%;
    bottom: -1%;
    left: -.2rem;
  }

  .close {
    min-width: 1.8rem;
  }

  p {
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
