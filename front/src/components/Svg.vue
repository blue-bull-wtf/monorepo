<template lang="pug">
.svg-wrapper.icon(v-html="svg")
</template>

<script lang="ts">
import { onMounted } from "vue";
import { defineComponent, ref } from "vue";
import { cache } from "../store";
import { imgCdnRoot } from "../constants";

export default defineComponent({
  name: "Svg",
  components: {},
  props: {
    icon: { type: String, required: true },
  },
  setup(props) {
    const [svg, isRaw] = [ref<string>(), props.icon.startsWith('<svg')];
    let icon = props.icon;

    if (!isRaw) {
      if (!icon.endsWith('.svg'))
        icon += '.svg';
      if (!icon.startsWith('/'))
        icon = `${imgCdnRoot}${icon}`;
      onMounted(async () => {
        svg.value = await cache.svg.getOrSet(icon, () => fetch(icon).then(r => r.text()) ?? '');
      });
    } else {
      svg.value = icon;
    }
    return { svg };
  },
});

</script>

<style scoped lang="pcss">
.svg-wrapper {
  :deep(svg) {
    transition: all .33s;
    /* color: inherit;
    stroke: inherit; */
    width: inherit;
    height: inherit;
    max-width: inherit;
    max-height: inherit;
    min-width: inherit;
    min-height: inherit;
  }
}
</style>