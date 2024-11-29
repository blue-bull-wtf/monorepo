<template lang="pug">
template(v-if="html")
  .md.bordered.p-4.backdrop-blur-light.max-h-full.overflow-scroll(v-render="html")
  //- Notched(:options='{ width: "100%", height: "100%", notchWidth: "10%", notchHeight: "10%", borderRadius: "2%" }' direction="tr")
    //- template(#content)
</template>

<script lang="ts">

import { defineComponent, onMounted, ref } from 'vue';
import { parseMarkdown } from '../utils/serialization';
import { cache } from '../store';

const fetchParse = async (file: string) => {
  const md = await fetch(`/mds/${file}`).then(r => r.text());
  if (!md)
    console.error(`No markdown found at ${file}`);
  return parseMarkdown(md) ?? '';
};

export default defineComponent({
  name: "Markdown",
  props: {
    title: String,
    file: String,
  },
  setup: (props) => {
    const html = ref<string>("");
    onMounted(async () => {
      if (!props.file)
        throw new Error(`No file provided for ${props.title ?? "Markdown"}`);
      const md = await cache.md.getOrSet(props.file, () => fetchParse(<string>props.file));
      html.value = md;
    });
    return { props, html };
  }
});

</script>

<style scoped lang="scss"></style>
