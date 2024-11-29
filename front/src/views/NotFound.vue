<template lang="pug">
.not-found
  span Not Found
  Button(:text="'Click me'" direction="tr")
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  name: 'Not Found',
  props: {},
  components: {},
  setup() {
    onMounted(async () => { });
    return {};
  },
});

</script>
<style scoped></style>
