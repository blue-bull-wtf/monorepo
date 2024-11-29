<template lang="pug">
canvas.w-full.h-full(:id="id" ref="canvas")
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { Chart as _Chart, registerables } from 'chart.js'
import ChartCrosshair from 'chartjs-plugin-crosshair';
// import ChartZoom from 'chartjs-plugin-zoom';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
import { app } from '../store';

_Chart.register(...registerables, ChartCrosshair);

export default defineComponent({
  name: 'Chart',
  props: {
    chartData: Object,
    options: Object,
    id: String,
    type: {
      type: String,
      default: 'line',

      validator: (value: string) => [
        'line', 'bar', 'pie', 'radar', 'polarArea', 'bubble'
      ].includes(value)
    },
  },
  setup(props) {
    const id = props.id ?? `chart-${app.nextChartId++}`;
    // console.log("chart id", id);
    const canvas = ref<HTMLCanvasElement>();

    onMounted(() => {
      if (!canvas.value) return;
      const containerRect = canvas.value.parentElement!.getBoundingClientRect();
      canvas.value.width = containerRect.width;
      canvas.value.height = containerRect.height;

      // if chart with same id exists, destroy it
      if (app.chartById[id]) {
        console.warn("Chart with id " + id + " already exists, destroying it");
        app.chartById[id]?.destroy();
      }
      app.chartById[id] = new _Chart(id, {
        type: <any>props.type,
        data: <any>props.chartData,
        options: props.options
      }); // add to chart registry
    })

    return { id, props, canvas }
  }
});
</script>