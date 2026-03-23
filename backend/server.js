console.log("Node version:", process.version);
console.log("Loading server...");

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

/** Set in backend/.env — unlocks the small “Dev” developer panel in the dashboard (httpOnly cookie). */
const DEV_PANEL_TOKEN = (process.env.DEV_PANEL_TOKEN || "").trim();

function readCookie(req, name) {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const parts = raw.split(";");
  for (const p of parts) {
    const s = p.trim();
    const i = s.indexOf("=");
    if (i === -1) continue;
    const k = s.slice(0, i);
    if (k === name) return decodeURIComponent(s.slice(i + 1));
  }
  return null;
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function devPanelCookieOk(req) {
  return readCookie(req, "paidMediaDevPanel") === "1";
}

// Reflect request origin so file:// / Live Preview / other ports can call the API when needed
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "20mb" }));

// Google Ads API – only required when linking live Google Ads data
const GOOGLE_ADS_DEV_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const GOOGLE_ADS_REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const GOOGLE_ADS_LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID; // account to query (no dashes)

const googleAdsConfigured = () =>
  GOOGLE_ADS_DEV_TOKEN &&
  GOOGLE_ADS_CLIENT_ID &&
  GOOGLE_ADS_CLIENT_SECRET &&
  GOOGLE_ADS_REFRESH_TOKEN &&
  (GOOGLE_ADS_LOGIN_CUSTOMER_ID || GOOGLE_ADS_CUSTOMER_ID);

// TikTok Marketing API – only required when linking live TikTok Ads data
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const TIKTOK_ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID;

const tiktokConfigured = () => TIKTOK_ACCESS_TOKEN && TIKTOK_ADVERTISER_ID;

// Google Sheet – CSV export URL from "Publish to web". When set, dashboard fetches live data from the sheet.
const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;

const googleSheetConfigured = () => GOOGLE_SHEET_URL && GOOGLE_SHEET_URL.startsWith("http");

// Expected CSV columns: date, platform, campaign, ad, objective, spend, impressions, clicks, conversions, revenue
const CSV_PATH = path.join(__dirname, "data", "performance.csv");
const PLAN_PATH = path.join(__dirname, "data", "plan.csv");
const MANUAL_ENTRIES_PATH = path.join(__dirname, "data", "manual_entries.json");

const MOCK_ROWS = [
  ["2026-02-05", "google", "Search | Family Dinner | US", "Dinner KW Broad", "conversions", 520.34, 78000, 4600, 210, 4100],
  ["2026-02-05", "meta", "Paid Social | Millennial Parents | Video", "Hero Video 15s", "conversions", 430.12, 92000, 3800, 145, 2900],
  ["2026-02-05", "tiktok", "TikTok | ParentTok | Family Meals", "POV After Practice", "conversions", 260.75, 64000, 3200, 110, 2200],
  ["2026-02-05", "dsp", "OLV | CTV | Weekend Brunch", "CTV :30 Brunch", "awareness", 610.0, 180000, 900, 35, 0],
  ["2026-02-06", "google", "Search | Family Dinner | US", "Dinner KW Broad", "conversions", 545.1, 80200, 4720, 218, 4250],
  ["2026-02-06", "meta", "Paid Social | Millennial Parents | Video", "Carousel Kid-friendly", "conversions", 390.85, 88000, 3600, 139, 2800],
  ["2026-02-06", "tiktok", "TikTok | ParentTok | Family Meals", "Budget Breakdown", "conversions", 275.9, 66000, 3330, 118, 2350],
  ["2026-02-06", "dsp", "Display | Local Deals | OH", "300x250 Local Offers", "traffic", 310.5, 132000, 2100, 60, 600],
  ["2026-02-07", "google", "Search | Weekend Brunch | US", "Brunch KW Exact", "conversions", 480.2, 71000, 4450, 205, 3950],
  ["2026-02-07", "meta", "Paid Social | Millennial Parents | Video", "UGC Family Brunch", "conversions", 415.33, 97000, 3950, 155, 3100],
  ["2026-02-07", "tiktok", "TikTok | Weekend Plans | Brunch", "What to do this weekend", "traffic", 230.4, 59000, 3100, 80, 900],
  ["2026-02-07", "dsp", "OLV | CTV | Weekend Brunch", "CTV :15 Brunch", "awareness", 640.75, 190000, 950, 40, 0],
  ["2026-02-08", "google", "Search | Family Dinner | US", "Dinner KW Phrase", "conversions", 505.25, 76500, 4525, 210, 4050],
  ["2026-02-08", "meta", "Paid Social | Millennial Parents | Static", "Kids Menu Static", "traffic", 320.5, 74000, 3300, 95, 950],
  ["2026-02-08", "tiktok", "TikTok | ParentTok | Family Meals", "Sunday Reset", "conversions", 245.0, 61000, 3150, 105, 2150],
  ["2026-02-08", "dsp", "Display | Local Deals | OH", "160x600 Local Offers", "traffic", 295.9, 126000, 2050, 55, 550],
  ["2026-02-09", "google", "Search | Family Dinner | US", "Dinner KW Broad", "conversions", 530.0, 79000, 4650, 215, 4200],
  ["2026-02-09", "meta", "Paid Social | Millennial Parents | Video", "Hero Video 15s", "conversions", 440.5, 98000, 3900, 150, 3000],
  ["2026-02-09", "tiktok", "TikTok | ParentTok | Family Meals", "POV After Practice", "conversions", 270.8, 65000, 3250, 112, 2250],
  ["2026-02-09", "dsp", "OLV | CTV | Weekend Brunch", "CTV :30 Brunch", "awareness", 620.0, 185000, 920, 37, 0],
];

function normalizeCsvKeys(row) {
  const o = {};
  for (const [k, v] of Object.entries(row)) {
    o[String(k).toLowerCase().trim()] = v;
  }
  return o;
}

function escapeCsvCell(val) {
  const s = String(val ?? "");
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToPerformanceCsv(parsedRows) {
  const header =
    "date,platform,market,campaign,ad,objective,spend,impressions,clicks,conversions,revenue";
  const lines = [header];
  for (const raw of parsedRows) {
    const p = parseRow(normalizeCsvKeys(raw));
    lines.push(
      [
        escapeCsvCell(p.date),
        escapeCsvCell(p.platform),
        escapeCsvCell(p.market),
        escapeCsvCell(p.campaign),
        escapeCsvCell(p.ad),
        escapeCsvCell(p.objective),
        escapeCsvCell(p.spend),
        escapeCsvCell(p.impressions),
        escapeCsvCell(p.clicks),
        escapeCsvCell(p.conversions),
        escapeCsvCell(p.revenue),
      ].join(",")
    );
  }
  return `${lines.join("\n")}\n`;
}

const PERFORMANCE_CSV_REQUIRED = [
  "date",
  "platform",
  "campaign",
  "ad",
  "objective",
  "spend",
  "impressions",
  "clicks",
  "conversions",
  "revenue",
];

/** Normalize header text for alias lookup: "Report Date", "Spend ($)" → slugs. */
function slugifyHeaderKey(k) {
  return String(k || "")
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .trim()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** Maps slug → canonical column (date, platform, …). Built from common export names. */
const PERFORMANCE_HEADER_SLUG_TO_CANON = (() => {
  const m = new Map();
  const add = (canonical, aliases) => {
    for (const a of aliases) {
      const s = slugifyHeaderKey(a);
      if (s && !m.has(s)) m.set(s, canonical);
    }
  };
  add("date", [
    "date",
    "report date",
    "day",
    "report_date",
    "reportdate",
    "start date",
    "time",
  ]);
  add("platform", [
    "platform",
    "channel",
    "publisher",
    "network",
    "source",
    "media",
    "placement",
    "engine",
  ]);
  add("campaign", ["campaign", "campaign name", "campaign_name", "campaign id", "campaignid"]);
  add("ad", ["ad", "ad name", "ad_name", "creative", "creative name", "ad creative", "ad group"]);
  add("objective", ["objective", "goal", "optimization goal", "optimization_goal", "objectives"]);
  add("spend", ["spend", "cost", "amount", "media cost", "spent", "cost usd", "total spend"]);
  add("impressions", ["impressions", "impr", "imps", "impression", "views"]);
  add("clicks", ["clicks", "click", "link clicks"]);
  add("conversions", ["conversions", "conv", "conversion", "all conversions", "purchases"]);
  add("revenue", ["revenue", "conversion value", "conversion_value", "rev", "sales", "purchase value"]);
  add("market", ["market", "dma", "geo", "region", "location", "city"]);
  return m;
})();

/**
 * Map a parsed CSV row to canonical field names so platform exports with different headers still import.
 */
function mapRowToCanonicalPerformance(row) {
  const out = {};
  const raw = normalizeCsvKeys(row);
  for (const [k, v] of Object.entries(raw)) {
    const slug = slugifyHeaderKey(k);
    if (!slug) continue;
    let canon = PERFORMANCE_HEADER_SLUG_TO_CANON.get(slug);
    if (!canon) {
      if (PERFORMANCE_CSV_REQUIRED.includes(slug) || slug === "market") canon = slug;
      else continue;
    }
    if (out[canon] === undefined) out[canon] = v;
  }
  return out;
}

function performanceHeaderScore(rows) {
  if (!rows || !rows.length) return -1;
  const mapped = mapRowToCanonicalPerformance(rows[0]);
  return PERFORMANCE_CSV_REQUIRED.filter((h) => Object.prototype.hasOwnProperty.call(mapped, h)).length;
}

/** Strip BOM, normalize line endings (Excel sometimes uses \\r only). */
function preprocessCsvText(text) {
  let t = String(text || "");
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
  t = t.replace(/^\uFEFF/, "");
  return t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function parsePerformanceCsvRecords(text) {
  const raw = preprocessCsvText(text);
  if (!raw.trim()) return [];
  const baseOpts = {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
  };
  function attempt(delimiter) {
    try {
      const opts = delimiter ? { ...baseOpts, delimiter } : baseOpts;
      return parse(raw, opts);
    } catch {
      return null;
    }
  }
  function headerScore(rows) {
    return performanceHeaderScore(rows);
  }
  const candidates = [attempt(), attempt(","), attempt(";"), attempt("\t")].filter(Boolean);
  if (!candidates.length) {
    throw new Error(
      "Could not parse CSV. Save as comma-separated (.csv) or semicolon-separated (European Excel)."
    );
  }
  let best = candidates[0];
  let bestScore = headerScore(best);
  for (const c of candidates) {
    const s = headerScore(c);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return best;
}

function parseRow(r) {
  return {
    date: r.date,
    platform: (r.platform || "").toLowerCase().trim(),
    market: (r.market || "").toLowerCase().trim(),
    campaign: r.campaign || "",
    ad: r.ad || "",
    objective: (r.objective || "").toLowerCase().trim(),
    spend: Number(r.spend) || 0,
    impressions: Number(r.impressions) || 0,
    clicks: Number(r.clicks) || 0,
    conversions: Number(r.conversions) || 0,
    revenue: Number(r.revenue) || 0,
  };
}

function loadManualEntries() {
  try {
    if (fs.existsSync(MANUAL_ENTRIES_PATH)) {
      const raw = fs.readFileSync(MANUAL_ENTRIES_PATH, "utf8");
      const rows = JSON.parse(raw);
      return Array.isArray(rows) ? rows.map(parseRow) : [];
    }
  } catch (err) {
    console.warn("Manual entries read failed:", err.message);
  }
  return [];
}

function saveManualEntries(rows) {
  try {
    const dir = path.dirname(MANUAL_ENTRIES_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MANUAL_ENTRIES_PATH, JSON.stringify(rows, null, 2), "utf8");
  } catch (err) {
    console.error("Manual entries save failed:", err.message);
    throw err;
  }
}

function loadCsvOrMock() {
  // For a “clean” dashboard on every start, ignore any seed/mock CSV
  // and begin with an empty dataset. Real data will come from APIs
  // (Google, TikTok) and manual entries only.
  if (!fs.existsSync(CSV_PATH)) return [];
  try {
    const raw = fs.readFileSync(CSV_PATH, "utf8");
    const rows = parse(raw, { columns: true, skip_empty_lines: true });
    return rows.map((r) => parseRow(r));
  } catch (err) {
    console.warn("CSV load failed:", err.message);
    return [];
  }
}

function loadPlan() {
  if (!fs.existsSync(PLAN_PATH)) return [];
  try {
    const raw = fs.readFileSync(PLAN_PATH, "utf8");
    const rows = parse(raw, { columns: true, skip_empty_lines: true });
    return rows
      .filter((r) => r.month && r.platform)
      .map((r) => ({
        month: String(r.month || "").trim(),
        market: (r.market || "").toLowerCase().trim() || "all",
        platform: (r.platform || "").toLowerCase().trim(),
        plan_spend: Number(r.plan_spend) || 0
      }));
  } catch (err) {
    console.warn("Plan load failed:", err.message);
    return [];
  }
}

async function loadGoogleSheetRows() {
  if (!googleSheetConfigured()) return [];
  try {
    const sep = GOOGLE_SHEET_URL.includes("?") ? "&" : "?";
    const url = `${GOOGLE_SHEET_URL}${sep}t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let raw = await res.text();
    raw = raw.replace(/^\uFEFF/, "");
    const rows = parse(raw, { columns: true, skip_empty_lines: true });
    const parsed = rows.map((r) => {
      const normalized = {};
      for (const k of Object.keys(r)) {
        normalized[k.toLowerCase().trim()] = r[k];
      }
      return parseRow(normalized);
    });
    console.log("Google Sheet: loaded", parsed.length, "rows");
    return parsed;
  } catch (err) {
    console.warn("Google Sheet fetch failed:", err.message);
    return [];
  }
}

async function fetchGoogleAdsRows() {
  if (!googleAdsConfigured()) return [];

  try {
    const { GoogleAdsApi } = require("google-ads-api");
    const client = new GoogleAdsApi({
      client_id: GOOGLE_ADS_CLIENT_ID,
      client_secret: GOOGLE_ADS_CLIENT_SECRET,
      developer_token: GOOGLE_ADS_DEV_TOKEN,
    });

    const customerId = (GOOGLE_ADS_CUSTOMER_ID || GOOGLE_ADS_LOGIN_CUSTOMER_ID || "").replace(/-/g, "");
    const loginCustomerId = GOOGLE_ADS_LOGIN_CUSTOMER_ID ? GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, "") : undefined;

    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
      login_customer_id: loginCustomerId,
    });

    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 90);
    const fromStr = from.toISOString().slice(0, 10).replace(/-/g, "");
    const toStr = to.toISOString().slice(0, 10).replace(/-/g, "");

    const query = `
      SELECT
        segments.date,
        campaign.name,
        ad_group.name,
        ad_group_ad.ad.name,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.conversions_value
      FROM ad_group_ad
      WHERE segments.date BETWEEN '${fromStr}' AND '${toStr}'
        AND campaign.status != 'REMOVED'
        AND ad_group.status != 'REMOVED'
        AND ad_group_ad.status != 'REMOVED'
    `;

    const results = await customer.query(query);
    const rows = results.map((row) => {
      const date = row.segments?.date || "";
      const campaign = row.campaign?.name || "";
      const adGroup = row.ad_group?.name || "";
      const ad = row.ad_group_ad?.ad?.name || row.ad_group_ad?.ad?.id || "";
      const costMicros = Number(row.metrics?.cost_micros) || 0;
      const conversionsValue = Number(row.metrics?.conversions_value) || 0;
      return {
        date: date.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
        platform: "google",
        campaign,
        ad: ad || adGroup,
        objective: Number(row.metrics?.conversions) > 0 ? "conversions" : "traffic",
        spend: costMicros / 1e6,
        impressions: Number(row.metrics?.impressions) || 0,
        clicks: Number(row.metrics?.clicks) || 0,
        conversions: Number(row.metrics?.conversions) || 0,
        revenue: conversionsValue,
      };
    });
    return rows;
  } catch (err) {
    console.error("Google Ads API error:", err.message);
    return [];
  }
}

async function fetchTikTokRows() {
  if (!tiktokConfigured()) return [];

  try {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 90);
    const startDate = from.toISOString().slice(0, 10).replace(/-/g, "");
    const endDate = to.toISOString().slice(0, 10).replace(/-/g, "");

    const dimensions = JSON.stringify(["stat_time_day", "campaign_id", "campaign_name"]);
    const metrics = JSON.stringify([
      "spend",
      "impressions",
      "clicks",
      "conversion",
      "total_purchase_value"
    ]);

    const params = new URLSearchParams({
      advertiser_id: TIKTOK_ADVERTISER_ID,
      report_type: "BASIC",
      dimensions,
      metrics,
      start_date: startDate,
      end_date: endDate
    });

    const url = `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?${params.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": TIKTOK_ACCESS_TOKEN
      }
    });

    const data = await res.json();
    if (!res.ok || (data.code !== undefined && data.code !== 0)) {
      console.error("TikTok API error:", data.message || data);
      return [];
    }

    const list = data.data?.list || [];
    const rows = list.map((row) => {
      const dateStr = row.dimensions?.stat_time_day || row.stat_time_day || "";
      const date = dateStr.length === 8 ? `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}` : dateStr;
      const campaign = row.dimensions?.campaign_name || row.dimensions?.campaign_id || row.campaign_name || row.campaign_id || "";
      const spend = Number(row.metrics?.spend || row.spend) || 0;
      const impressions = Number(row.metrics?.impressions || row.impressions) || 0;
      const clicks = Number(row.metrics?.clicks || row.clicks) || 0;
      const conversion = Number(row.metrics?.conversion || row.conversion) || 0;
      const revenue = Number(row.metrics?.total_purchase_value || row.total_purchase_value) || 0;

      return {
        date,
        platform: "tiktok",
        campaign: campaign.toString(),
        ad: row.dimensions?.ad_name || row.dimensions?.ad_id || "",
        objective: conversion > 0 ? "conversions" : "traffic",
        spend,
        impressions,
        clicks,
        conversions: conversion,
        revenue
      };
    });

    return rows;
  } catch (err) {
    console.error("TikTok API error:", err.message);
    return [];
  }
}

async function getAllPerformanceRows() {
  let rows = [];
  const sources = [];
  if (googleSheetConfigured()) {
    const sheetRows = await loadGoogleSheetRows();
    if (sheetRows.length > 0) {
      rows = sheetRows;
      sources.push("google_sheet");
    }
  }
  if (rows.length === 0) {
    rows = loadCsvOrMock();
    if (rows.length > 0) sources.push("csv");
  }
  if (googleAdsConfigured()) {
    const googleRows = await fetchGoogleAdsRows();
    if (googleRows.length > 0) {
      rows = rows.filter((r) => r.platform !== "google").concat(googleRows);
      sources.push("google_ads");
    }
  }
  if (tiktokConfigured()) {
    const tiktokRows = await fetchTikTokRows();
    if (tiktokRows.length > 0) {
      rows = rows.filter((r) => r.platform !== "tiktok").concat(tiktokRows);
      sources.push("tiktok");
    }
  }
  const manualRows = loadManualEntries();
  if (manualRows.length > 0) {
    rows = rows.concat(manualRows);
    sources.push("manual");
  }
  return { rows, sources };
}

app.get("/api/performance", async (req, res) => {
  try {
    const { rows, sources } = await getAllPerformanceRows();
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json({ rows, source: sources.join("+") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load performance data", details: err.message });
  }
});

app.get("/api/pacing", async (req, res) => {
  try {
    const monthParam = (req.query.month || "").trim();
    const { rows } = await getAllPerformanceRows();
    const planRows = loadPlan();

    const byKey = {};
    rows.forEach((r) => {
      const month = (r.date || "").slice(0, 7);
      if (!month || month.length < 7) return;
      const market = (r.market || "").toLowerCase().trim() || "all";
      const platform = r.platform || "";
      const key = `${month}|${market}|${platform}`;
      if (!byKey[key]) byKey[key] = { month, market, platform, actual: 0 };
      byKey[key].actual += r.spend || 0;
    });

    const planByKey = {};
    planRows.forEach((r) => {
      const market = r.market === "all" || !r.market ? "all" : r.market;
      const key = `${r.month}|${market}|${r.platform}`;
      if (!planByKey[key]) planByKey[key] = 0;
      planByKey[key] += r.plan_spend;
    });

    const months = Array.from(new Set([...Object.keys(byKey).map((k) => k.split("|")[0]), ...Object.keys(planByKey).map((k) => k.split("|")[0])])).sort().reverse();

    const seen = new Set();
    let pacing = [];
    [...Object.keys(byKey), ...Object.keys(planByKey)].forEach((key) => {
      if (seen.has(key)) return;
      seen.add(key);
      const [m, market, platform] = key.split("|");
      if (monthParam && m !== monthParam) return;
      const actual = (byKey[key] && byKey[key].actual) || 0;
      const planKey = `${m}|${market}|${platform}`;
      const planAltKey = `${m}|all|${platform}`;
      const plan = planByKey[planKey] ?? planByKey[planAltKey] ?? 0;
      let variancePct = null;
      let flag = "ok";
      if (plan > 0) {
        variancePct = ((actual - plan) / plan) * 100;
        if (variancePct > 10) flag = "over";
        else if (variancePct < -10) flag = "under";
      }
      pacing.push({
        month: m,
        market: market === "all" ? "—" : market,
        platform,
        actual_spend: Math.round(actual * 100) / 100,
        plan_spend: plan,
        variance_pct: variancePct != null ? Math.round(variancePct * 10) / 10 : null,
        flag
      });
    });

    pacing = pacing.sort((a, b) => {
      if (a.month !== b.month) return b.month.localeCompare(a.month);
      if (a.market !== b.market) return String(a.market).localeCompare(b.market);
      return a.platform.localeCompare(b.platform);
    });

    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json({ pacing, months });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load pacing data", details: err.message });
  }
});

// Download Excel-ready template (CSV) for performance data
app.get("/api/performance/template", (req, res) => {
  try {
    const templatePath = path.join(__dirname, "..", "templates", "Paid_Media_Performance_Template.csv");
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template file missing" });
    }
    const raw = fs.readFileSync(templatePath, "utf8");
    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set("Content-Disposition", 'attachment; filename="Paid_Media_Performance_Template.csv"');
    res.send(raw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read template", details: err.message });
  }
});

// Download template for pacing plan
app.get("/api/plan/template", (req, res) => {
  try {
    const templatePath = path.join(__dirname, "..", "templates", "Paid_Media_Plan_Template.csv");
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template file missing" });
    }
    const raw = fs.readFileSync(templatePath, "utf8");
    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set("Content-Disposition", 'attachment; filename="Paid_Media_Plan_Template.csv"');
    res.send(raw);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read template", details: err.message });
  }
});

// Replace performance.csv — raw body (Buffer → UTF-8). Uses raw() so text/csv/plain always parse; avoids express.text type mismatches.
app.post(
  "/api/performance/csv",
  express.raw({ limit: "20mb", type: "*/*" }),
  (req, res) => {
  try {
    const text =
      Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body || "");
    if (!preprocessCsvText(text).trim()) {
      return res.status(400).json({ error: "Empty CSV body" });
    }
    let rows;
    try {
      rows = parsePerformanceCsvRecords(text);
    } catch (e) {
      return res.status(400).json({
        error: e.message || "Could not parse CSV",
        details: "Use comma-separated values. First row must be headers matching the template.",
      });
    }
    const normalized = rows.map((r) => mapRowToCanonicalPerformance(r));
    if (!normalized.length) {
      return res.status(400).json({ error: "No data rows found (keep the header row and add at least one data row)" });
    }
    const keys = Object.keys(normalized[0]);
    const missing = PERFORMANCE_CSV_REQUIRED.filter((h) => !keys.includes(h));
    if (missing.length) {
      const rawKeys = Object.keys(normalizeCsvKeys(rows[0]));
      return res.status(400).json({
        error: `Missing column(s): ${missing.map((m) => `"${m}"`).join(", ")}`,
        details: `Headers in your file: ${rawKeys.join(", ")}\n\nWe accept common aliases (e.g. Channel→platform, Cost→spend, Report Date→date). Required fields: ${PERFORMANCE_CSV_REQUIRED.join(", ")}, plus optional market.`,
      });
    }
    const out = rowsToPerformanceCsv(normalized);
    fs.writeFileSync(CSV_PATH, out, "utf8");
    console.log(`performance.csv replaced via API (${normalized.length} rows)`);
    res.json({ ok: true, rows: normalized.length, message: "performance.csv updated. Refresh the dashboard." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to import CSV", details: err.message });
  }
});

// Replace plan.csv for pacing (raw body)
app.post("/api/plan/csv", express.raw({ limit: "5mb", type: "*/*" }), (req, res) => {
  try {
    const text =
      Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body || "");
    if (!text.trim()) {
      return res.status(400).json({ error: "Empty CSV body" });
    }
    const rows = parse(text, { columns: true, skip_empty_lines: true });
    if (!rows.length) {
      return res.status(400).json({ error: "No data rows in plan CSV" });
    }
    const keys = Object.keys(normalizeCsvKeys(rows[0]));
    for (const h of ["month", "platform", "plan_spend"]) {
      if (!keys.includes(h)) {
        return res.status(400).json({ error: `Plan CSV missing column: "${h}"` });
      }
    }
    const lines = ["month,market,platform,plan_spend"];
    for (const raw of rows) {
      const r = normalizeCsvKeys(raw);
      const month = String(r.month || "").trim();
      const market = (r.market || "all").toLowerCase().trim() || "all";
      const platform = String(r.platform || "").toLowerCase().trim();
      const plan_spend = Number(r.plan_spend) || 0;
      lines.push(
        [escapeCsvCell(month), escapeCsvCell(market), escapeCsvCell(platform), escapeCsvCell(plan_spend)].join(",")
      );
    }
    fs.writeFileSync(PLAN_PATH, `${lines.join("\n")}\n`, "utf8");
    console.log(`plan.csv replaced via API (${rows.length} rows)`);
    res.json({ ok: true, rows: rows.length, message: "plan.csv updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to import plan CSV", details: err.message });
  }
});

app.post("/api/performance/manual", (req, res) => {
  try {
    const body = req.body || {};
    const entry = {
      date: String(body.date || "").trim() || new Date().toISOString().slice(0, 10),
      platform: String(body.platform || "dsp").toLowerCase().trim(),
      market: String(body.market || "").toLowerCase().trim(),
      campaign: String(body.campaign || "").trim(),
      ad: String(body.ad || "").trim(),
      objective: String(body.objective || "awareness").toLowerCase().trim(),
      spend: Number(body.spend) || 0,
      impressions: Number(body.impressions) || 0,
      clicks: Number(body.clicks) || 0,
      conversions: Number(body.conversions) || 0,
      revenue: Number(body.revenue) || 0,
    };
    const existing = loadManualEntries();
    // Upsert: if an entry already exists with the same
    // date + platform + campaign + ad, replace it instead of duplicating.
    const asRaw = existing
      .map((r) => ({
        date: r.date,
        platform: r.platform,
        market: r.market || "",
        campaign: r.campaign,
        ad: r.ad,
        objective: r.objective,
        spend: r.spend,
        impressions: r.impressions,
        clicks: r.clicks,
        conversions: r.conversions,
        revenue: r.revenue,
      }))
      .filter((r) => !(
        r.date === entry.date &&
        r.platform === entry.platform &&
        r.campaign === entry.campaign &&
        r.ad === entry.ad
      ));
    asRaw.push(entry);
    saveManualEntries(asRaw);
    res.json({ ok: true, message: "Entry added. It will appear in the dashboard overview." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save manual entry", details: err.message });
  }
});

// Maintainer UI — MUST be registered before the generic /api 404 handler below
const devRouter = express.Router();
devRouter.get("/session", (req, res) => {
  const configured = DEV_PANEL_TOKEN.length >= 8;
  res.json({
    devPanel: configured && devPanelCookieOk(req),
    configured,
  });
});
devRouter.post("/unlock", (req, res) => {
  const token = req.body && req.body.token;
  if (DEV_PANEL_TOKEN.length < 8) {
    return res.status(503).json({ error: "Dev panel is not configured (set DEV_PANEL_TOKEN in backend/.env)" });
  }
  if (typeof token !== "string" || !timingSafeEqualStr(token, DEV_PANEL_TOKEN)) {
    return res.status(401).json({ error: "Invalid token" });
  }
  res.cookie("paidMediaDevPanel", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 90 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ ok: true });
});
devRouter.post("/logout", (req, res) => {
  res.clearCookie("paidMediaDevPanel", { path: "/" });
  res.json({ ok: true });
});
app.use("/api/dev", devRouter);

// Unmatched /api/* → JSON (not Express default HTML "Cannot POST /api/...")
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    method: req.method,
    path: req.originalUrl || req.url,
    hint: "Restart the backend (cd backend && npm start) so it loads the latest server.js.",
  });
});

// Serve the dashboard (index.html, script.js, styles.css) from the parent folder.
// Open http://localhost:5001 in your browser so the dashboard and API use the same origin.
app.use(express.static(path.join(__dirname, "..")));

// Return JSON for /api errors (not Express default HTML) — e.g. body-parser failures
app.use((err, req, res, next) => {
  if (!req.path || !req.path.startsWith("/api")) return next(err);
  const status = err.status || err.statusCode || 500;
  if (err.type === "entity.too.large" || status === 413) {
    return res.status(413).json({ error: "Request body too large", details: "Max 20MB for CSV import." });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Could not parse request body", details: err.message });
  }
  return res.status(status >= 400 && status < 600 ? status : 500).json({
    error: err.message || "Server error",
    details: err.type || "",
  });
});

const server = app.listen(PORT, () => {
  console.log(`Paid media backend listening on http://localhost:${PORT}`);
  console.log(`Open the dashboard in your browser: http://localhost:${PORT}`);
  if (googleSheetConfigured()) {
    console.log("Google Sheet: configured (data will load from your sheet when dashboard opens)");
  } else {
    console.log("Google Sheet: not configured — create backend/.env and add GOOGLE_SHEET_URL to use a live sheet");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Close the other app or set PORT=5002 in the backend folder.`);
  } else {
    console.error("Server error:", err.message);
  }
  process.exit(1);
});
