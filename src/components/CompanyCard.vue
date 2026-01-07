<template>
  <div class="company-card">
    <div class="top">
      <div class="logo">{{ logo }}</div>
      <div class="meta">
        <div class="name">{{ name }}</div>
        <div class="sub">Revenue ({{ latestLabel || "—" }})</div>
      </div>
    </div>

    <div class="value-row">
      <div class="value">{{ format(revenueLatest) }}</div>
      <div class="changes">
        <div :class="['chip', qoq >= 0 ? 'pos' : 'neg']">
          {{ qoq >= 0 ? "+" : "" }}{{ format(qoq) }}
        </div>
        <div :class="['chip', qoqPct >= 0 ? 'pos' : 'neg']">
          {{ qoqPct >= 0 ? "+" : "" }}{{ qoqPct.toFixed(2) }}%
        </div>
      </div>
    </div>

    <div class="unit">in Bill USD</div>
  </div>
</template>

<script>
export default {
  name: "CompanyCard",
  props: {
    name: { type: String, required: true },
    logo: { type: String, default: "◎" },
    latestLabel: { type: String, default: "" },
    revenueLatest: { type: Number, default: 0 },
    qoq: { type: Number, default: 0 },
    qoqPct: { type: Number, default: 0 },
  },
  methods: {
    format(n) {
      if (n == null || !Number.isFinite(n)) return "—";
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);
    },
  },
};
</script>

<style scoped>
.company-card {
  min-width: 220px;
  border-radius: 16px;
  padding: 18px 18px 14px;
  background: rgba(1, 31, 53, 0.9);
  border: 1px solid rgba(120, 200, 255, 0.15);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  color: #eaf6ff;
}

.top {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(120, 200, 255, 0.12);
  border: 1px solid rgba(120, 200, 255, 0.18);
  font-weight: 700;
}

.name {
  font-weight: 700;
  font-size: 14px;
}

.sub {
  font-size: 11px;
  opacity: 0.75;
  margin-top: 2px;
}

.value-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
}

.value {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.changes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.chip {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
}

.pos {
  color: #3ef2a5;
}
.neg {
  color: #ff6b6b;
}

.unit {
  margin-top: 10px;
  font-size: 10px;
  opacity: 0.6;
}

@media (max-width: 600px) {
  .company-card {
    min-width: 180px;
  }
}
</style>