<template>
  <div class="chart-wrap">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "LineChart",
  props: {
    labels: { type: Array, default: () => [] },
    datasets: { type: Array, default: () => [] },
  },
  data() {
    return { chart: null };
  },
  mounted() {
    this.renderChart();
  },
  beforeUnmount() {
    this.chart?.destroy();
  },
  watch: {
    labels() {
      this.updateChart();
    },
    datasets: {
      deep: true,
      handler() {
        this.updateChart();
      },
    },
  },
  methods: {
    renderChart() {
      const ctx = this.$refs.canvas.getContext("2d");
      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.labels,
          datasets: this.datasets.map((d) => ({
            ...d,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "right", labels: { color: "#cfe9ff" } },
            tooltip: { enabled: true },
          },
          scales: {
            x: {
              ticks: { color: "#9bc7e5" },
              grid: { color: "rgba(255,255,255,0.08)" },
            },
            y: {
              ticks: { color: "#9bc7e5" },
              grid: { color: "rgba(255,255,255,0.08)" },
            },
          },
        },
      });
    },
    updateChart() {
      if (!this.chart) return;
      this.chart.data.labels = this.labels;
      this.chart.data.datasets = this.datasets.map((d) => ({
        ...d,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
      }));
      this.chart.update();
    },
  },
};
</script>

<style scoped>
.chart-wrap {
  height: 260px;
}
</style>

