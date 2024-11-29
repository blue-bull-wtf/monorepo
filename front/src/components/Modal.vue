<template lang="pug">

// support for nested components / input / yes / no / ok / cancel / snackbar / auto remove / stack
// overlay
.modal.relative.h-full.w-full.active.pointer-events-auto(@keydown.esc="close")
  .overlay.absolute.w-full.h-full.flex-v.y-center.x-center.z-10.backdrop-blur-light(aria-label='Close' @click="closable ? close() : null")
    .container.bordered.py-4.px-5.z-30.fade-in.flex-v.y-center.x-start.rel.maxw-full.maxh-full(:class="containerClasses", ref="containerEl")
      .header.w-full.p-2.minh-8(v-if="title || closable")
        slot(name="header")
          .flex-h.x-start.y-center.g-3.semibold
            h2.title.mt-1 {{ title }}
          button.close.clear.ml-2.abs.top.right(v-if="closable" aria-label='Close' @click="close()" :class="title ? 'mt-3' : 'mt-2'")
      .body.b2.w-full.maxh-80vh.rounded.flex-v.y-start.x-start.m-auto.rel.overflow-scroll(:class="{ bordered }")
        slot(name="body")
      .footer2
        slot(name="footer")
      .controls.wrap.w-full.flex-h.x-end.gap-2.mt-2(@click="actionCallback ? checkActionClick : undefined")
        slot(name="controls")
          template(v-if="backable ?? backText")
            button.l(@click="close()", :class="{'primary': !slots.controls}") {{ backText ?? 'Back' }}
    
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';
import { DEFAULT_CALLBACK } from '../../../common/utils/typing';

export default defineComponent({
  name: 'Modal',
  components: {},
  emits: ["close"],
  props: {
    title: { type: String, required: false },
    icon: { type: String, required: false },
    footer: { type: String, required: false },
    closable: { type: Boolean, default: true },
    backable: { type: Boolean, default: false },
    backText: { type: String, required: false },
    bordered: { type: Boolean, default: false },
    classes: { type: String, default: '' },
    actionCallback: { type: Function, required: false },
    close: { type: Function, default: DEFAULT_CALLBACK },
  },

  setup: (props, { slots }) => {
    const containerEl = ref() as Ref<HTMLElement>;
    let containerClasses = props.classes;

    // FIXME: not safe as we may consider another class as width
    if (!containerClasses.includes('w-')) {
      containerClasses += ' w-m';
    }

    function checkActionClick(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (el?.classList.contains('button')) {
        props.actionCallback?.(el.innerText); // <-- innerText is the button text, eg. Ok, Cancel, Yes, No...
      }
    }

    return {
      // constants
      slots,
      // mutables
      containerClasses,
      // methods
      close,
      checkActionClick,
    };
  },
});
</script>

<style lang="postcss" scoped>
</style>
