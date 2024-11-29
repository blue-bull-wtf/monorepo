<template lang="pug">
.bordered.p-3.mx-2.backdrop-blur-light.w-full.h-l
  span Stats
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  name: 'Stats',
  props: {},
  components: {},
  setup() {
    onMounted(async () => { });
    return {};
  },
});

</script>
<style scoped></style>
