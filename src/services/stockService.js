import axios from "axios";

const order = [
    "Mar 21",
    "Jun 21",
    "Sep 21",
    "Dec 21",
    "Mar 22",
    "Jun 22",
    "Sep 22",
    "Dec 22",
    "Mar 23",
    '""',
    "3 Aug 23",
    "2 Nov 23",
    "1 Feb 24",
    "2 Mai 24",
];

function parseNumber(value) {
    if (value == null) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const cleaned = String(value)
        .trim()
        .replace(/\s/g, "")
        .replace(",", ".");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
}

class StockService {
    constructor() {
        this.apiClient = axios.create({
            baseURL: "https://sheetdb.io/api/v1/oqw5evabcyf8h",
        });
    }

    async fetchData(sheetName) {
        try {
            const res = await this.apiClient.get("", {
                params: { sheet: sheetName },
            });
            return res.data;
        } catch (error) {
            console.error("Error fetching data:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            return [];
        }
    }
    async getRevenue(sheetName) {
        const data = await this.fetchData(sheetName);
        const row = data?.[3] ?? {};

        const pairs = order
            .map((key) => ({ key, value: parseNumber(row[key]) }))
            .filter((p) => p.value !== null);

        return {
            labels: pairs.map((p) => p.key),
            values: pairs.map((p) => p.value),
        };
    }
}

export const stockService = new StockService();