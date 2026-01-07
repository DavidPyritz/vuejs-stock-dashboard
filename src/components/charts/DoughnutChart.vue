<template>
  <div class="chart-wrap">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "DoughnutChart",
  props: {
    labels: { type: Array, default: () => [] },
    values: { type: Array, default: () => [] },
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
        type: "doughnut",
        data: {
          labels: this.labels,
          datasets: [
            {
              data: this.values,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "right", labels: { color: "#cfe9ff" } },
          },
          cutout: "62%",
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
  height: 260px;
}
</style>
