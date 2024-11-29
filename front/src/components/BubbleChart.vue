<template lang="pug">
Chart(:chart-data="chartData" :options="options" :id="id" :type="type")
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BubbleChart',
  props: {
    chartData: Object,
    options: Object,
    id: String,
    type: {
      type: String,
      default: 'bubble'
    }
  }
});
</script>
