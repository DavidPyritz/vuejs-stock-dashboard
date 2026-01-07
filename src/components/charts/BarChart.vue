<template>
  <div class="chart-wrap">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "BarChart",
  props: {
    labels: { type: Array, default: () => [] },
    values: { type: Array, default: () => [] },
    title: { type: String, default: "" },
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
    values() {
      this.updateChart();
    },
  },
  methods: {
    renderChart() {
      const ctx = this.$refs.canvas.getContext("2d");
      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.labels,
          datasets: [{ label: this.title, data: this.values }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: { ticks: { color: "#9bc7e5" }, grid: { color: "rgba(255,255,255,0.08)" } },
            y: { ticks: { color: "#9bc7e5" }, grid: { color: "rgba(255,255,255,0.08)" } },
          },
        },
      });
    },
    updateChart() {
      if (!this.chart) return;
      this.chart.data.labels = this.labels;
      this.chart.data.datasets[0].data = this.values;
      this.chart.update();
    },
  },
};
</script>

<style scoped>
.chart-wrap {
  height: 220px;
}
</style>
