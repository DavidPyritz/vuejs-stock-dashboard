<!-- <router-link to="/impressum">Impressum</router-link>
<span class="sep">•</span>
<router-link to="/datenschutz">Datenschutz</router-link> -->

<template>
  <div class="dashboard">
    <header class="dash-header">
      <div class="pill" />
      <div>
        <h1>The Magnificent Seven Companies</h1>
        <p v-if="warning" class="warning">{{ warning }}</p>
      </div>
    </header>

    <section class="strip">
      <div class="strip-inner">
        <CompanyCard v-for="c in companies" :key="c.sheet" :name="c.name" :logo="c.logo" :latestLabel="c.latestLabel"
          :revenueLatest="c.latest" :qoq="c.qoq" :qoqPct="c.qoqPct" />
      </div>
    </section>

    <section class="grid-2">
      <BaseCard class="panel">
        <div class="panel-head">
          <h2>Revenue last 3 years</h2>
        </div>

        <div v-if="loading" class="placeholder">Loading…</div>
        <div v-else-if="fatalError" class="placeholder">{{ fatalError }}</div>
        <LineChart v-else :labels="lineLabels" :datasets="lineDatasets" />
      </BaseCard>

      <BaseCard class="panel">
        <div class="panel-head">
          <h2>Revenue Breakdown Magnificent Seven</h2>
        </div>

        <div v-if="loading" class="placeholder">Loading…</div>
        <div v-else-if="fatalError" class="placeholder">{{ fatalError }}</div>
        <DoughnutChart v-else :labels="donutLabels" :values="donutValues" />
      </BaseCard>
    </section>

    <section class="grid-3">
      <BaseCard class="panel">
        <div class="panel-head">
          <h2>Net Income TTM</h2>
        </div>
        <div class="placeholder small">
          (Noch keine Daten angebunden – sobald du mir sagst, in welcher Zeile/Spalte Net Income liegt, hänge ich’s an.)
        </div>
      </BaseCard>

      <BaseCard class="panel">
        <div class="panel-head">
          <h2>Gross Margin in % LQ</h2>
        </div>
        <div class="placeholder small">
          (Noch keine Daten angebunden – kann ich genauso anschließen wie Revenue.)
        </div>
      </BaseCard>

      <BaseCard class="panel">
        <div class="panel-head">
          <h2>Revenue Growth in % YoY</h2>
        </div>

        <div v-if="loading" class="placeholder">Loading…</div>
        <div v-else-if="fatalError" class="placeholder">{{ fatalError }}</div>
        <BarChart v-else :labels="yoyLabels" :values="yoyValues" title="YoY %" />
      </BaseCard>
    </section>
  </div>
</template>

<script>
import BaseCard from "./components/BaseCard.vue";
import CompanyCard from "./components/CompanyCard.vue";
import LineChart from "./components/charts/LineChart.vue";
import DoughnutChart from "./components/charts/DoughnutChart.vue";
import BarChart from "./components/charts/BarChart.vue";
import { stockService } from "@/services/stockService";

function toNumber(v) {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;

  const s = String(v)
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function lastValidIndex(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null && Number.isFinite(arr[i])) return i;
  }
  return -1;
}

export default {
  name: "App",
  components: { BaseCard, CompanyCard, LineChart, DoughnutChart, BarChart },
  data() {
    return {
      loading: true,
      fatalError: "",
      warning: "",
      companies: [
        { name: "Apple", logo: "", sheet: "$AAPL" },
        { name: "Meta", logo: "∞", sheet: "$META" },
        { name: "Microsoft", logo: "⊞", sheet: "$MSFT" },
        // { name: "Google", logo: "G", sheet: "$GOOGL" },
        { name: "Amazon", logo: "a", sheet: "$AMZN" },
        { name: "Tesla", logo: "T", sheet: "$TSLA" },
        { name: "Nvidia", logo: "N", sheet: "$NVDA" },
      ],
      lineLabels: [],
      lineDatasets: [],
      donutLabels: [],
      donutValues: [],
      yoyLabels: [],
      yoyValues: [],
    };
  },

  async created() {
    try {
      this.loading = true;
      this.fatalError = "";
      this.warning = "";
      const settled = await Promise.allSettled(
        this.companies.map(async (c) => {
          const revenue = await stockService.getRevenue(c.sheet);
          const labels = Array.isArray(revenue)
            ? revenue.map((_, i) => String(i + 1))
            : revenue?.labels ?? [];
          const rawValues = Array.isArray(revenue) ? revenue : revenue?.values ?? [];
          const values = rawValues.map(toNumber);
          const idx = lastValidIndex(values);
          const latest = idx >= 0 ? values[idx] : null;
          const latestLabel = idx >= 0 ? labels[idx] : "";
          const prev = idx - 1 >= 0 ? values[idx - 1] : null;
          const qoq = latest != null && prev != null ? latest - prev : 0;
          const qoqPct = latest != null && prev != null && prev !== 0 ? (qoq / prev) * 100 : 0;
          const back4 = idx - 4 >= 0 ? values[idx - 4] : null;
          const yoyPct =
            latest != null && back4 != null && back4 !== 0 ? ((latest - back4) / back4) * 100 : 0;
          const sliceStart = Math.max(0, values.length - 12);
          return {
            ...c,
            labels,
            values,
            latest,
            latestLabel,
            qoq,
            qoqPct,
            yoyPct,
            labels12: labels.slice(sliceStart),
            values12: values.slice(sliceStart),
          };
        })
      );
      const missingSheets = [];
      const results = settled.map((r, i) => {
        const c = this.companies[i];
        if (r.status === "fulfilled") return r.value;
        missingSheets.push(c.sheet);
        console.warn(`Sheet fehlt oder Request failed: ${c.sheet}`);
        return {
          ...c,
          labels: [],
          values: [],
          latest: null,
          latestLabel: "",
          qoq: 0,
          qoqPct: 0,
          yoyPct: 0,
          labels12: [],
          values12: [],
        };
      });
      this.companies = results;
      const firstWithLabels = results.find((c) => (c.labels12?.length ?? 0) > 0);
      const firstLabels = firstWithLabels?.labels12 ?? [];
      const okCount = results.filter((c) => (c.values?.length ?? 0) > 0).length;
      if (okCount === 0) {
        this.fatalError =
          "Konnte keine Daten laden. Prüfe, ob die Sheet-Tabs in SheetDB existieren und richtig heißen.";
      } else if (missingSheets.length > 0) {
        this.warning = `Hinweis: Diese Sheets fehlen (404): ${missingSheets.join(", ")}`;
      }
      this.lineLabels = firstLabels;
      this.lineDatasets = results
        .filter((c) => (c.values12?.length ?? 0) > 0)
        .map((c) => ({
          label: c.name,
          data: c.values12,
        }));
      this.donutLabels = results.map((c) => c.name);
      this.donutValues = results.map((c) => c.latest ?? 0);
      this.yoyLabels = results.map((c) => c.name);
      this.yoyValues = results.map((c) => c.yoyPct ?? 0);
    } catch (e) {
      this.fatalError =
        "Unerwarteter Fehler beim Laden. Prüfe Konsole/Network und ob SheetDB erreichbar ist.";
      console.error(e);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

#app {
  width: 100%;              /* statt 100vw */
  overflow-x: hidden;       /* verhindert horizontales Scrollen */
  min-height: 100vh;
  padding: 70px 90px;
  background: radial-gradient(71.11% 100% at 50% 0%, #020204 14.6%, #011f35 100%);
  box-sizing: border-box;
  color: #eaf6ff;
}

.dashboard {
  max-width: 1240px;
  margin: 0 auto;
}

.dash-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.pill {
  width: 90px;
  height: 14px;
  border-radius: 999px;
  background: #7ad6ff;
  opacity: 0.95;
}

h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.warning {
  margin: 6px 0 0;
  font-size: 12px;
  opacity: 0.85;
}

.strip {
  border-radius: 18px;
  border: 1px solid rgba(120, 200, 255, 0.18);
  padding: 18px;
  margin-bottom: 18px;
  background: rgba(1, 31, 53, 0.25);
}

.strip-inner {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 18px;
}

.panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(120, 200, 255, 0.16);
  background: rgba(1, 31, 53, 0.75);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.25);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.placeholder {
  opacity: 0.75;
  padding: 20px 0;
}

.placeholder.small {
  font-size: 12px;
  line-height: 1.45;
}




/* 1) Laptops / wenn DevTools offen sind */
@media (max-width: 1300px) {
  #app {
    padding: 48px 40px;
  }
  .dashboard {
    max-width: 100%;
  }
}

/* 2) Tablets */
@media (max-width: 1000px) {
  #app {
    padding: 36px 22px;
  }

  .dash-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }

  .grid-3 {
    grid-template-columns: 1fr;
  }
}

/* 3) Phones */
@media (max-width: 600px) {
  #app {
    padding: 24px 14px;
  }

  h1 {
    font-size: 22px;
  }

  .pill {
    width: 70px;
    height: 12px;
  }

  .strip {
    padding: 12px;
  }

  .strip-inner {
    gap: 10px;
  }
}
</style>