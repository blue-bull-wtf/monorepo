<template lang="pug">
  Chart(:chart-data="chartData" :options="options" :id="id" :type="type")
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'RadarChart',
    props: {
      chartData: Object,
      options: Object,
      refreshTrigger: Number,
      name: String,
      type: {
        type: String,
        default: 'radar'
      }
    }
  });
  </script>
  