// Mock performance data for Bob Evans paid media dashboard.
// In a real implementation, this would come from Google Ads, Meta, TikTok, and DSP APIs.

const MOCK_ROWS = [
  // date, platform, campaign, ad, objective, spend, impressions, clicks, conversions, revenue
  ["2026-02-05", "google", "Search | Family Dinner | US", "Dinner KW Broad", "conversions", 520.34, 78000, 4600, 210, 4100],
  ["2026-02-05", "meta", "Paid Social | Millennial Parents | Video", "Hero Video 15s", "conversions", 430.12, 92000, 3800, 145, 2900],
  ["2026-02-05", "tiktok", "TikTok | ParentTok | Family Meals", "POV After Practice", "conversions", 260.75, 64000, 3200, 110, 2200],
  ["2026-02-05", "olv", "OLV | CTV | Weekend Brunch", "CTV :30 Brunch", "awareness", 610.0, 180000, 900, 35, 0],
  ["2026-02-06", "google", "Search | Family Dinner | US", "Dinner KW Broad", "conversions", 545.1, 80200, 4720, 218, 4250],
  ["2026-02-06", "meta", "Paid Social | Millennial Parents | Video", "Carousel Kid-friendly", "conversions", 390.85, 88000, 3600, 139, 2800],
  ["2026-02-06", "tiktok", "TikTok | ParentTok | Family Meals", "Budget Breakdown", "conversions", 275.9, 66000, 3330, 118, 2350],
  ["2026-02-06", "display", "Display | Local Deals | OH", "300x250 Local Offers", "traffic", 310.5, 132000, 2100, 60, 600],
  ["2026-02-07", "google", "Search | Weekend Brunch | US", "Brunch KW Exact", "conversions", 480.2, 71000, 4450, 205, 3950],
  ["2026-02-07", "meta", "Paid Social | Millennial Parents | Video", "UGC Family Brunch", "conversions", 415.33, 97000, 3950, 155, 3100],
  ["2026-02-07", "tiktok", "TikTok | Weekend Plans | Brunch", "What to do this weekend", "traffic", 230.4, 59000, 3100, 80, 900],
  ["2026-02-07", "olv", "OLV | CTV | Weekend Brunch", "CTV :15 Brunch", "awareness", 640.75, 190000, 950, 40, 0],
  ["2026-02-08", "google", "Search | Family Dinner | US", "Dinner KW Phrase", "conversions", 505.25, 76500, 4525, 210, 4050],
  ["2026-02-08", "meta", "Paid Social | Millennial Parents | Static", "Kids Menu Static", "traffic", 320.5, 74000, 3300, 95, 950],
  ["2026-02-08", "tiktok", "TikTok | ParentTok | Family Meals", "Sunday Reset", "conversions", 245.0, 61000, 3150, 105, 2150],
  ["2026-02-08", "display", "Display | Local Deals | OH", "160x600 Local Offers", "traffic", 295.9, 126000, 2050, 55, 550],
  ["2026-02-09", "google", "Search | Family Dinner | US", "Dinner KW Broad", "conversions", 530.0, 79000, 4650, 215, 4200],
  ["2026-02-09", "meta", "Paid Social | Millennial Parents | Video", "Hero Video 15s", "conversions", 440.5, 98000, 3900, 150, 3000],
  ["2026-02-09", "tiktok", "TikTok | ParentTok | Family Meals", "POV After Practice", "conversions", 270.8, 65000, 3250, 112, 2250],
  ["2026-02-09", "olv", "OLV | CTV | Weekend Brunch", "CTV :30 Brunch", "awareness", 620.0, 185000, 920, 37, 0]
];

function parseRows(rows) {
  return rows.map(r => ({
    date: r[0],
    platform: r[1],
    campaign: r[2],
    ad: r[3],
    objective: r[4],
    spend: r[5],
    impressions: r[6],
    clicks: r[7],
    conversions: r[8],
    revenue: r[9]
  }));
}

// Filled from API (GET /api/performance). Start empty so only real data is used.
let BASE_DATA = [];

// Fiscal calendar configuration (company-specific).
// Fiscal year starts 2025-05-01 with 12 periods in weeks:
// P1 4, P2 4, P3 5, P4 4, P5 4, P6 5, P7 5, P8 4, P9 4, P10 4, P11 4, P12 5.
const FISCAL_START = new Date("2025-05-01");
const FISCAL_WEEKS = [4, 4, 5, 4, 4, 5, 5, 4, 4, 4, 4, 5];
const FISCAL_YEAR_DAYS = FISCAL_WEEKS.reduce((sum, w) => sum + w, 0) * 7; // 52 weeks = 364 days

const FUNDED_MARKETS = ["cleveland", "columbus", "cincinnati", "charleston", "dayton", "toledo"];
const CONTROL_MARKETS = ["indianapolis", "pittsburgh"];

function getFiscalInfo(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;

  let diffDays = Math.floor((d - FISCAL_START) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null; // before first fiscal year we support

  let fiscalYear = 2025;
  while (diffDays >= FISCAL_YEAR_DAYS) {
    diffDays -= FISCAL_YEAR_DAYS;
    fiscalYear += 1;
  }

  let offset = 0;
  for (let i = 0; i < FISCAL_WEEKS.length; i++) {
    const periodDays = FISCAL_WEEKS[i] * 7;
    if (diffDays < offset + periodDays) {
      return {
        fiscalYear,
        fiscalPeriod: i + 1 // P1..P12
      };
    }
    offset += periodDays;
  }

  // If somehow beyond configured periods, treat as last period.
  return {
    fiscalYear,
    fiscalPeriod: FISCAL_WEEKS.length
  };
}

/**
 * Base URL for the Node API (always a full origin — never "").
 * Import/CORS issues happen if the page is served from another port (Live Preview, etc.):
 * relative /api/... would hit the wrong server and return 404 HTML.
 */
function getApiBase() {
  if (typeof window === "undefined") return "http://localhost:5001";
  if (window.location.protocol === "file:") return "http://localhost:5001";
  const port = String(window.location.port || "");
  const host = window.location.hostname;
  if ((host === "localhost" || host === "127.0.0.1") && port === "5001") {
    return window.location.origin;
  }
  // Render / other HTTPS hosts: API is served from the same Node app as this page
  if (window.location.protocol === "https:") {
    return window.location.origin;
  }
  return "http://localhost:5001";
}

let backendConnected = false;

async function loadPerformanceData() {
  try {
    const res = await fetch(`${getApiBase()}/api/performance`);
    if (!res.ok) {
      backendConnected = false;
      return;
    }
    const { rows, source } = await res.json();
    backendConnected = true;
    // Always replace BASE_DATA when API returns (including empty) so clearing CSV/manual shows empty charts.
    if (Array.isArray(rows)) {
      BASE_DATA = rows;
      if (rows.length > 0) {
        console.log("Using performance data from backend (source: " + (source || "api") + ")");
      } else {
        console.log("Performance data is empty (source: " + (source || "api") + ").");
      }
      populateCampaignFilter();
      populateMarketFilter();
    }
  } catch (err) {
    backendConnected = false;
    console.warn("Backend not available, leaving dashboard empty until data is available:", err.message);
  }
}

function updateBackendStatusBar() {
  const bar = document.getElementById("backendStatusBar");
  const message = document.getElementById("backendStatusMessage");
  const startBtn = document.getElementById("backendStartBtn");
  if (!bar || !message) return;
  if (backendConnected) {
    bar.classList.add("connected");
    message.textContent = "Backend connected — you can save manual entries and use live data.";
  } else {
    bar.classList.remove("connected");
    message.textContent = "Backend not running. Click the button to open the folder, double-click Start Backend.command, then open http://localhost:5001 in your browser.";
    if (startBtn) {
      var folderUrl = window.location.href.replace(/\/[^/]*$/, "/");
      startBtn.href = folderUrl;
    }
  }
}

function getFilters() {
  const platforms = Array.from(
    document.querySelectorAll(".filters input[type=checkbox]")
  )
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const objectiveRadio = document.querySelector("input[name=objective]:checked");
  const objective = objectiveRadio ? objectiveRadio.value : "all";

  const search = (document.getElementById("searchInput").value || "").trim().toLowerCase();
  const dateRange = document.getElementById("dateRange").value;
  const customStart = (document.getElementById("customStart")?.value || "").trim();
  const customEnd = (document.getElementById("customEnd")?.value || "").trim();
  const campaignFilter = (document.getElementById("campaignFilter")?.value || "all").trim();
  const marketFilter = (document.getElementById("marketFilter")?.value || "all").trim();

  return { platforms, objective, search, dateRange, customStart, customEnd, campaignFilter, marketFilter };
}

function filterData() {
  const { platforms, objective, search, dateRange, customStart, customEnd, campaignFilter, marketFilter } = getFilters();

  const now = new Date();
  const customStartDate = customStart ? new Date(customStart) : null;
  const customEndDate = customEnd ? new Date(customEnd) : null;
  if (customEndDate) {
    // Include the full end day
    customEndDate.setHours(23, 59, 59, 999);
  }

  return BASE_DATA.filter(row => {
    if (!platforms.includes(row.platform)) return false;
    if (objective !== "all" && row.objective !== objective) return false;
    if (campaignFilter !== "all" && row.campaign !== campaignFilter) return false;

    if (marketFilter === "funded" && !FUNDED_MARKETS.includes((row.market || "").toLowerCase())) return false;
    if (marketFilter === "control" && !CONTROL_MARKETS.includes((row.market || "").toLowerCase())) return false;
    if (marketFilter !== "all" && marketFilter !== "funded" && marketFilter !== "control" && (row.market || "").toLowerCase() !== marketFilter) return false;

    if (search) {
      const combined = `${row.campaign} ${row.ad}`.toLowerCase();
      if (!combined.includes(search)) return false;
    }

    const d = new Date(row.date);
    if (dateRange === "custom") {
      if (customStartDate && d < customStartDate) return false;
      if (customEndDate && d > customEndDate) return false;
    } else {
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);
      if (dateRange === "7d" && diffDays > 7) return false;
      if (dateRange === "30d" && diffDays > 30) return false;
      if (dateRange === "90d" && diffDays > 90) return false;
    }

    return true;
  });
}

/** Same as filterData but ignores date (for period split). */
function rowMatchesFiltersExceptDate(row) {
  const { platforms, objective, search, campaignFilter, marketFilter } = getFilters();
  if (!platforms.includes(row.platform)) return false;
  if (objective !== "all" && row.objective !== objective) return false;
  if (campaignFilter !== "all" && row.campaign !== campaignFilter) return false;
  if (marketFilter === "funded" && !FUNDED_MARKETS.includes((row.market || "").toLowerCase())) return false;
  if (marketFilter === "control" && !CONTROL_MARKETS.includes((row.market || "").toLowerCase())) return false;
  if (
    marketFilter !== "all" &&
    marketFilter !== "funded" &&
    marketFilter !== "control" &&
    (row.market || "").toLowerCase() !== marketFilter
  ) {
    return false;
  }
  if (search) {
    const combined = `${row.campaign} ${row.ad}`.toLowerCase();
    if (!combined.includes(search)) return false;
  }
  return true;
}

function rowMatchesCurrentDateWindow(row, now) {
  const { dateRange, customStart, customEnd } = getFilters();
  const d = new Date(row.date);
  if (dateRange === "custom") {
    if (!customStart || !customEnd) return false;
    const customStartDate = new Date(customStart);
    const customEndDate = new Date(customEnd);
    customEndDate.setHours(23, 59, 59, 999);
    return d >= customStartDate && d <= customEndDate;
  }
  const n = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
  const diffDays = (now - d) / (1000 * 60 * 60 * 24);
  // Match filterData: include rows with diffDays <= n (same as main KPIs / charts)
  return diffDays <= n;
}

function rowMatchesPriorDateWindow(row, now) {
  const { dateRange, customStart, customEnd } = getFilters();
  const d = new Date(row.date);
  if (dateRange === "custom") {
    if (!customStart || !customEnd) return false;
    const start = new Date(customStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(customEnd);
    end.setHours(0, 0, 0, 0);
    const spanDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const priorEnd = new Date(start);
    priorEnd.setDate(priorEnd.getDate() - 1);
    priorEnd.setHours(23, 59, 59, 999);
    const priorStart = new Date(priorEnd);
    priorStart.setHours(0, 0, 0, 0);
    priorStart.setDate(priorStart.getDate() - (spanDays - 1));
    return d >= priorStart && d <= priorEnd;
  }
  const n = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
  const diffDays = (now - d) / (1000 * 60 * 60 * 24);
  return diffDays > n && diffDays <= n * 2;
}

function getPeriodDescription(now) {
  const { dateRange, customStart, customEnd } = getFilters();
  const fmt = dt =>
    dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  if (dateRange === "custom") {
    if (!customStart || !customEnd) return "Select custom start and end dates in the header.";
    const cs = new Date(customStart);
    const ce = new Date(customEnd);
    const start = new Date(cs);
    start.setHours(0, 0, 0, 0);
    const end = new Date(ce);
    end.setHours(0, 0, 0, 0);
    const spanDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const priorEnd = new Date(start);
    priorEnd.setDate(priorEnd.getDate() - 1);
    const priorStart = new Date(priorEnd);
    priorStart.setHours(0, 0, 0, 0);
    priorStart.setDate(priorStart.getDate() - (spanDays - 1));
    return `Current: ${fmt(cs)} – ${fmt(ce)} · Prior: ${fmt(priorStart)} – ${fmt(priorEnd)} (${spanDays} days each)`;
  }
  const n = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
  const curEnd = new Date(now);
  const curStart = new Date(now);
  curStart.setDate(curStart.getDate() - n);
  const priorEnd = new Date(curStart);
  priorEnd.setDate(priorEnd.getDate() - 1);
  const priorStart = new Date(priorEnd);
  priorStart.setDate(priorStart.getDate() - (n - 1));
  return `Last ${n} days (${fmt(curStart)} – ${fmt(curEnd)}) vs prior ${n} days (${fmt(priorStart)} – ${fmt(priorEnd)})`;
}

function rowsForCurrentPeriod() {
  const now = new Date();
  return BASE_DATA.filter(row => rowMatchesFiltersExceptDate(row) && rowMatchesCurrentDateWindow(row, now));
}

function rowsForPriorPeriod() {
  const now = new Date();
  return BASE_DATA.filter(row => rowMatchesFiltersExceptDate(row) && rowMatchesPriorDateWindow(row, now));
}

function rollupMetrics(rows) {
  const spend = sum(rows, "spend");
  const impressions = sum(rows, "impressions");
  const clicks = sum(rows, "clicks");
  const conversions = sum(rows, "conversions");
  const revenue = sum(rows, "revenue");
  const cpa = conversions ? spend / conversions : 0;
  const roas = spend ? revenue / spend : 0;
  return { spend, impressions, clicks, conversions, revenue, cpa, roas };
}

function pctDelta(cur, prev) {
  if (prev === 0 && cur === 0) return 0;
  if (prev === 0) return null;
  return ((cur - prev) / prev) * 100;
}

function formatKpiVsPrior(cur, prev) {
  if (prev === 0 && cur > 0) return "vs prior: new";
  if (prev === 0 && cur === 0) return "vs prior: —";
  const p = pctDelta(cur, prev);
  if (p === null) return "vs prior: —";
  if (Math.abs(p) < 0.05) return "vs prior: flat";
  const sign = p > 0 ? "+" : "";
  return `vs prior: ${sign}${p.toFixed(1)}%`;
}

/** For strip: lower metric is better (CPA). */
function deltaDisplay(cur, prev, inverseGood) {
  if (prev === 0 && cur > 0) return { text: "vs prior: new", cls: "period-metric-delta--up" };
  if (prev === 0 && cur === 0) return { text: "vs prior: —", cls: "period-metric-delta--flat" };
  const p = pctDelta(cur, prev);
  if (p === null) return { text: "vs prior: —", cls: "period-metric-delta--flat" };
  if (Math.abs(p) < 0.05) return { text: "vs prior: flat", cls: "period-metric-delta--flat" };
  const sign = p > 0 ? "+" : "";
  const text = `vs prior: ${sign}${p.toFixed(1)}%`;
  const good = inverseGood ? p < 0 : p > 0;
  return {
    text,
    cls: good ? "period-metric-delta--up" : "period-metric-delta--down"
  };
}

function renderPeriodSummaryStrip() {
  const rangeEl = document.getElementById("periodSummaryRange");
  const metricsEl = document.getElementById("periodSummaryMetrics");
  if (!rangeEl || !metricsEl) return;

  const now = new Date();
  rangeEl.textContent = getPeriodDescription(now);

  const current = rowsForCurrentPeriod();
  const prior = rowsForPriorPeriod();
  const c = rollupMetrics(current);
  const p = rollupMetrics(prior);

  const items = [
    { label: "Spend", value: formatCurrency(c.spend), ...deltaDisplay(c.spend, p.spend, false) },
    { label: "Conversions", value: formatNumber(Math.round(c.conversions)), ...deltaDisplay(c.conversions, p.conversions, false) },
    {
      label: "CPA",
      value: formatCPA(c.spend, c.conversions),
      ...deltaDisplay(c.cpa, p.cpa, true)
    },
    {
      label: "ROAS",
      value: formatROAS(c.revenue, c.spend),
      ...deltaDisplay(c.roas, p.roas, false)
    }
  ];

  metricsEl.innerHTML = "";
  items.forEach(item => {
    const wrap = document.createElement("div");
    wrap.className = "period-metric";
    wrap.innerHTML = `
      <div class="period-metric-label">${item.label}</div>
      <div class="period-metric-value">${item.value}</div>
      <div class="period-metric-delta ${item.cls}">${item.text}</div>
    `;
    metricsEl.appendChild(wrap);
  });
}

function populateCampaignFilter() {
  const select = document.getElementById("campaignFilter");
  const manualSelect = document.getElementById("manualCampaignSelect");
  if (!select && !manualSelect) return;

  const campaigns = Array.from(
    new Set(BASE_DATA.map(row => row.campaign).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  if (select) {
    const current = select.value || "all";
    select.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All campaigns";
    select.appendChild(allOption);

    campaigns.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });

    if (Array.from(select.options).some(o => o.value === current)) {
      select.value = current;
    }
  }

  if (manualSelect) {
    const currentManual = manualSelect.value || "";
    manualSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select campaign…";
    manualSelect.appendChild(placeholder);

    campaigns.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      manualSelect.appendChild(opt);
    });

    const newOpt = document.createElement("option");
    newOpt.value = "__new__";
    newOpt.textContent = "+ Create new campaign…";
    manualSelect.appendChild(newOpt);

    if (Array.from(manualSelect.options).some(o => o.value === currentManual)) {
      manualSelect.value = currentManual;
    }
  }
}

function populateMarketFilter() {
  const select = document.getElementById("marketFilter");
  if (!select) return;

  const markets = Array.from(
    new Set(BASE_DATA.map(row => (row.market || "").toLowerCase().trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const current = select.value || "all";
  select.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All markets";
  select.appendChild(allOpt);

  const fundedOpt = document.createElement("option");
  fundedOpt.value = "funded";
  fundedOpt.textContent = "Funded only";
  select.appendChild(fundedOpt);

  const controlOpt = document.createElement("option");
  controlOpt.value = "control";
  controlOpt.textContent = "Control only";
  select.appendChild(controlOpt);

  markets.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m.charAt(0).toUpperCase() + m.slice(1);
    select.appendChild(opt);
  });

  if (Array.from(select.options).some(o => o.value === current)) {
    select.value = current;
  }
}

function sum(arr, key) {
  return arr.reduce((acc, row) => acc + (row[key] || 0), 0);
}

function formatCurrency(x) {
  return `$${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatNumber(x) {
  return x.toLocaleString();
}

function formatRate(x) {
  if (!isFinite(x)) return "–";
  return `${(x * 100).toFixed(1)}%`;
}

function formatCPA(spend, conv) {
  if (!conv) return "$0.00";
  return `$${(spend / conv).toFixed(2)}`;
}

function formatROAS(revenue, spend) {
  if (!spend) return "0.00x";
  return `${(revenue / spend).toFixed(2)}x`;
}

function renderKPIs(data, priorRows) {
  const spend = sum(data, "spend");
  const imps = sum(data, "impressions");
  const clicks = sum(data, "clicks");
  const convs = sum(data, "conversions");
  const revenue = sum(data, "revenue");

  const pSpend = sum(priorRows, "spend");
  const pImps = sum(priorRows, "impressions");
  const pClicks = sum(priorRows, "clicks");
  const pConvs = sum(priorRows, "conversions");

  document.getElementById("kpiSpend").textContent = formatCurrency(spend);
  document.getElementById("kpiImpressions").textContent = formatNumber(imps);
  document.getElementById("kpiClicks").textContent = formatNumber(clicks);
  document.getElementById("kpiConversions").textContent = formatNumber(convs);
  document.getElementById("kpiCPA").textContent = formatCPA(spend, convs);
  const kpiCPAV = document.getElementById("kpiCPAV");
  if (kpiCPAV) kpiCPAV.textContent = formatCPA(spend, convs);
  document.getElementById("kpiROAS").textContent = formatROAS(revenue, spend);

  document.getElementById("kpiSpendChange").textContent = formatKpiVsPrior(spend, pSpend).replace("vs prior:", "vs prev:");
  document.getElementById("kpiImpChange").textContent = formatKpiVsPrior(imps, pImps).replace("vs prior:", "vs prev:");
  document.getElementById("kpiClickChange").textContent = formatKpiVsPrior(clicks, pClicks).replace("vs prior:", "vs prev:");
  document.getElementById("kpiConvChange").textContent = formatKpiVsPrior(convs, pConvs).replace("vs prior:", "vs prev:");
}

function getFullDateRangeForChart() {
  const dateRange = document.getElementById("dateRange").value;
  if (dateRange === "custom") {
    const startStr = document.getElementById("customStart")?.value;
    const endStr = document.getElementById("customEnd")?.value;
    if (!startStr || !endStr) {
      return [];
    }
    const start = new Date(startStr);
    const end = new Date(endStr);
    const dates = [];
    const d = new Date(start);
    while (d <= end) {
      dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  } else {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    const dates = [];
    const d = new Date(start);
    while (d <= end) {
      dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }
}

function renderTimeseriesChart(data) {
  const container = document.getElementById("timeseriesChart");
  container.innerHTML = "";

  const viewModeSelect = document.getElementById("viewMode");
  const viewMode = viewModeSelect ? viewModeSelect.value : "calendar";

  let keys = [];
  let spends = [];
  let convs = [];
  let xLabels = [];

  if (viewMode === "fiscal") {
    // Group by fiscal year + period
    const byPeriod = {};
    data.forEach(row => {
      const info = getFiscalInfo(row.date);
      if (!info) return;
      const key = `${info.fiscalYear}-P${info.fiscalPeriod}`;
      if (!byPeriod[key]) {
        byPeriod[key] = { spend: 0, conversions: 0, fiscalYear: info.fiscalYear, fiscalPeriod: info.fiscalPeriod };
      }
      byPeriod[key].spend += row.spend;
      byPeriod[key].conversions += row.conversions;
    });

    keys = Object.keys(byPeriod).sort((a, b) => {
      const [ay, ap] = a.split("-P").map(Number);
      const [by, bp] = b.split("-P").map(Number);
      if (ay !== by) return ay - by;
      return ap - bp;
    });

    spends = keys.map(k => byPeriod[k].spend);
    convs = keys.map(k => byPeriod[k].conversions);
    xLabels = keys.map(k => {
      const info = byPeriod[k];
      const shortYear = String(info.fiscalYear).slice(-2);
      return `FY${shortYear} P${info.fiscalPeriod}`;
    });
  } else {
    // Calendar view: group by calendar date (only dates that actually have data)
    const byDate = {};
    data.forEach(row => {
      if (!byDate[row.date]) {
        byDate[row.date] = { spend: 0, conversions: 0 };
      }
      byDate[row.date].spend += row.spend;
      byDate[row.date].conversions += row.conversions;
    });

    // Always base the x‑axis on the actual dates present in the filtered data
    keys = Object.keys(byDate).sort();
    spends = keys.map(d => byDate[d].spend);
    convs = keys.map(d => byDate[d].conversions);
    xLabels = keys.map(d => d.slice(5)); // MM‑DD
  }

  const maxSpend = Math.max(...spends, 1);
  const maxConvs = Math.max(...convs, 1);

  const wrapper = document.createElement("div");
  wrapper.className = "chart-placeholder chart-placeholder-timeseries";

  const scrollWrap = document.createElement("div");
  scrollWrap.className = "chart-timeseries-scroll";
  const minBarWidth = 20;
  const totalMinWidth = Math.max(keys.length * minBarWidth, 100);

  const bars = document.createElement("div");
  bars.className = "chart-bars chart-bars-timeseries";
  bars.style.minWidth = totalMinWidth + "px";

  keys.forEach((key, i) => {
    const col = document.createElement("div");
    col.style.flex = "1";
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.justifyContent = "flex-end";
    col.style.gap = "2px";

    const spendBar = document.createElement("div");
    spendBar.className = "chart-bar";
    spendBar.style.height = `${(spends[i] / maxSpend) * 100 || 5}%`;
    const spendLabel = document.createElement("div");
    spendLabel.className = "chart-bar-label";
    spendLabel.textContent = "$" + Math.round(spends[i] / 100);
    spendBar.appendChild(spendLabel);

    const convBar = document.createElement("div");
    convBar.className = "chart-bar secondary";
    convBar.style.height = `${(convs[i] / maxConvs) * 70 || 3}%`;

    col.appendChild(spendBar);
    col.appendChild(convBar);
    bars.appendChild(col);
  });

  const xlabels = document.createElement("div");
  xlabels.className = "chart-xlabels";
  xlabels.style.minWidth = totalMinWidth + "px";
  xLabels.forEach(label => {
    const span = document.createElement("span");
    span.textContent = label;
    xlabels.appendChild(span);
  });

  scrollWrap.appendChild(bars);
  scrollWrap.appendChild(xlabels);
  wrapper.appendChild(scrollWrap);
  container.appendChild(wrapper);
}

function renderPlatformChart(data) {
  const container = document.getElementById("platformChart");
  container.innerHTML = "";

  if (data.length === 0) {
    container.textContent = "No data for selected filters.";
    return;
  }

  const metric = document.getElementById("platformMetric").value;
  const byPlatform = {};

  data.forEach(row => {
    if (!byPlatform[row.platform]) {
      byPlatform[row.platform] = { spend: 0, conversions: 0, revenue: 0 };
    }
    byPlatform[row.platform].spend += row.spend;
    byPlatform[row.platform].conversions += row.conversions;
    byPlatform[row.platform].revenue += row.revenue;
  });

  const platforms = Object.keys(byPlatform);
  const values = platforms.map(p => {
    const m = byPlatform[p];
    if (metric === "spend") return m.spend;
    if (metric === "conversions") return m.conversions;
    if (metric === "cpav") return m.conversions ? m.spend / m.conversions : 0;
    if (metric === "roas") return m.spend ? m.revenue / m.spend : 0;
    return 0;
  });
  const maxValue = Math.max(...values, 1);

  const wrapper = document.createElement("div");
  wrapper.className = "chart-placeholder";

  const bars = document.createElement("div");
  bars.className = "chart-bars";

  // Scale bar heights to max 80% so the tallest bar isn't flush against the top
  const barHeightScale = 80;
  platforms.forEach((p, i) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${(values[i] / maxValue) * barHeightScale || 5}%`;

    const label = document.createElement("div");
    label.className = "chart-bar-label";
    if (metric === "spend") label.textContent = formatCurrency(values[i]);
    else if (metric === "conversions") label.textContent = formatNumber(Math.round(values[i]));
    else if (metric === "cpav") label.textContent = formatCPA(values[i], 1);
    else label.textContent = values[i].toFixed(2) + "x";

    bar.appendChild(label);
    bars.appendChild(bar);
  });

  const xlabels = document.createElement("div");
  xlabels.className = "chart-xlabels";
  platforms.forEach(p => {
    const span = document.createElement("span");
    span.textContent = p.toUpperCase();
    xlabels.appendChild(span);
  });

  wrapper.appendChild(bars);
  wrapper.appendChild(xlabels);
  container.appendChild(wrapper);
}

function renderMarketChart(data) {
  const container = document.getElementById("marketChart");
  const panel = document.getElementById("marketChartPanel");
  if (!container || !panel) return;

  const hasMarketData = data.some(row => (row.market || "").trim());
  if (!hasMarketData || data.length === 0) {
    panel.style.display = "none";
    return;
  }
  panel.style.display = "";

  const metric = document.getElementById("marketMetric")?.value || "spend";
  const byMarket = {};

  data.forEach(row => {
    const mkt = (row.market || "").toLowerCase().trim() || "—";
    if (!byMarket[mkt]) byMarket[mkt] = { spend: 0, conversions: 0 };
    byMarket[mkt].spend += row.spend;
    byMarket[mkt].conversions += row.conversions;
  });

  const markets = Object.keys(byMarket).filter(m => m !== "—").sort((a, b) => a.localeCompare(b));
  if (Object.keys(byMarket).includes("—")) markets.unshift("—");
  if (markets.length === 0) {
    container.textContent = "No market data for selected filters.";
    return;
  }

  const values = markets.map(m => {
    const d = byMarket[m];
    if (metric === "spend") return d.spend;
    if (metric === "conversions") return d.conversions;
    if (metric === "cpav") return d.conversions ? d.spend / d.conversions : 0;
    return 0;
  });
  const maxValue = Math.max(...values, 1);

  container.innerHTML = "";
  const wrapper = document.createElement("div");
  wrapper.className = "chart-placeholder";

  const bars = document.createElement("div");
  bars.className = "chart-bars";

  const barHeightScale = 80;
  markets.forEach((m, i) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${(values[i] / maxValue) * barHeightScale || 5}%`;

    const label = document.createElement("div");
    label.className = "chart-bar-label";
    if (metric === "spend") label.textContent = formatCurrency(values[i]);
    else if (metric === "conversions") label.textContent = formatNumber(Math.round(values[i]));
    else label.textContent = formatCPA(values[i], 1);
    bar.appendChild(label);
    bars.appendChild(bar);
  });

  const xlabels = document.createElement("div");
  xlabels.className = "chart-xlabels";
  markets.forEach(m => {
    const span = document.createElement("span");
    span.textContent = m === "—" ? "—" : m.charAt(0).toUpperCase() + m.slice(1);
    xlabels.appendChild(span);
  });

  wrapper.appendChild(bars);
  wrapper.appendChild(xlabels);
  container.appendChild(wrapper);
}

function pillClassForPlatform(platform) {
  if (platform === "google") return "pill pill-google";
  if (platform === "meta") return "pill pill-meta";
  if (platform === "tiktok") return "pill pill-tiktok";
  if (platform === "olv") return "pill pill-olv";
  if (platform === "display") return "pill pill-display";
  if (platform === "dsp") return "pill pill-dsp";
  return "pill";
}

function renderCampaignTable(data) {
  const tbody = document.getElementById("campaignTableBody");
  tbody.innerHTML = "";

  const byCampaign = {};
  data.forEach(row => {
    const market = (row.market || "").toLowerCase().trim() || "—";
    const key = `${row.platform}||${market}||${row.campaign}||${row.objective}`;
    if (!byCampaign[key]) {
      byCampaign[key] = {
        platform: row.platform,
        market,
        campaign: row.campaign,
        objective: row.objective,
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0
      };
    }
    const agg = byCampaign[key];
    agg.spend += row.spend;
    agg.impressions += row.impressions;
    agg.clicks += row.clicks;
    agg.conversions += row.conversions;
    agg.revenue += row.revenue;
  });

  Object.values(byCampaign).forEach(agg => {
    const tr = document.createElement("tr");

    const ctr = agg.impressions ? agg.clicks / agg.impressions : 0;
    const cpa = agg.conversions ? agg.spend / agg.conversions : 0;
    const roas = agg.spend ? agg.revenue / agg.spend : 0;

    const marketDisplay = agg.market === "—" ? "—" : (agg.market || "—").charAt(0).toUpperCase() + (agg.market || "").slice(1);
    tr.innerHTML = `
      <td><span class="${pillClassForPlatform(agg.platform)}">${agg.platform.toUpperCase()}</span></td>
      <td class="td-market">${marketDisplay}</td>
      <td>${agg.campaign}</td>
      <td>${agg.objective}</td>
      <td>${formatCurrency(agg.spend)}</td>
      <td>${formatNumber(agg.impressions)}</td>
      <td>${formatNumber(agg.clicks)}</td>
      <td>${formatRate(ctr)}</td>
      <td>${formatNumber(agg.conversions)}</td>
      <td>${formatCPA(agg.spend, agg.conversions)}</td>
      <td>${formatROAS(agg.revenue, agg.spend)}</td>
    `;

    tbody.appendChild(tr);
  });
}

function renderAdTable(data) {
  const tbody = document.getElementById("adTableBody");
  tbody.innerHTML = "";

  data.forEach(row => {
    const ctr = row.impressions ? row.clicks / row.impressions : 0;
    const cpa = row.conversions ? row.spend / row.conversions : 0;
    const roas = row.spend ? row.revenue / row.spend : 0;

    const marketDisplay = (row.market || "").trim() ? ((row.market || "").charAt(0).toUpperCase() + (row.market || "").slice(1)) : "—";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="${pillClassForPlatform(row.platform)}">${row.platform.toUpperCase()}</span></td>
      <td class="td-market">${marketDisplay}</td>
      <td>${row.campaign}</td>
      <td>${row.ad}</td>
      <td>${formatCurrency(row.spend)}</td>
      <td>${formatNumber(row.impressions)}</td>
      <td>${formatNumber(row.clicks)}</td>
      <td>${formatRate(ctr)}</td>
      <td>${formatNumber(row.conversions)}</td>
      <td>${formatCPA(row.spend, row.conversions)}</td>
      <td>${formatROAS(row.revenue, row.spend)}</td>
    `;
    tbody.appendChild(tr);
  });
}

let PACING_DATA = { pacing: [], months: [] };

async function loadPacingData() {
  try {
    const month = document.getElementById("pacingMonth")?.value || "";
    const url = `${getApiBase()}/api/pacing${month ? "?month=" + encodeURIComponent(month) : ""}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    PACING_DATA = data;
    renderPacingTable();
    populatePacingMonthSelect();
  } catch (err) {
    console.warn("Could not load pacing data:", err);
    document.getElementById("pacingTableBody").innerHTML =
      "<tr><td colspan='7'>No pacing data. Add plan.csv with month, market, platform, plan_spend.</td></tr>";
  }
}

function populatePacingMonthSelect() {
  const select = document.getElementById("pacingMonth");
  if (!select) return;
  const months = PACING_DATA.months || [];
  const current = select.value;
  select.innerHTML = "";
  if (months.length === 0) {
    select.innerHTML = "<option value=''>No data</option>";
    return;
  }
  months.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    const d = new Date(m + "-01");
    opt.textContent = d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    select.appendChild(opt);
  });
  if (months.includes(current)) select.value = current;
  else if (months[0]) select.value = months[0];
}

function renderPacingTable() {
  const tbody = document.getElementById("pacingTableBody");
  if (!tbody) return;

  const pacing = PACING_DATA.pacing || [];
  tbody.innerHTML = "";

  if (pacing.length === 0) {
    tbody.innerHTML = "<tr><td colspan='7'>No pacing data. Add plan.csv and performance data.</td></tr>";
    return;
  }

  pacing.forEach((row) => {
    const tr = document.createElement("tr");
    const varianceDisplay =
      row.variance_pct != null
        ? (row.variance_pct >= 0 ? "+" : "") + row.variance_pct + "%"
        : "—";
    const flagClass = "flag-" + (row.flag || "ok");
    const flagLabel =
      row.flag === "over" ? "Over" : row.flag === "under" ? "Under" : "OK";

    tr.innerHTML = `
      <td>${row.month}</td>
      <td>${row.market}</td>
      <td><span class="pill pill-${row.platform}">${(row.platform || "").toUpperCase()}</span></td>
      <td>${formatCurrency(row.actual_spend)}</td>
      <td>${formatCurrency(row.plan_spend)}</td>
      <td>${varianceDisplay}</td>
      <td><span class="pacing-flag ${flagClass}">${flagLabel}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function applyFiltersAndRender() {
  const filtered = filterData();
  const priorRows = rowsForPriorPeriod();
  renderPeriodSummaryStrip();
  renderKPIs(filtered, priorRows);
  renderTimeseriesChart(filtered);
  renderPlatformChart(filtered);
  renderMarketChart(filtered);
  renderCampaignTable(filtered);
  renderAdTable(filtered);
}

function initFilters() {
  const filters = document.querySelector(".filters");
  filters.addEventListener("change", event => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) {
      return;
    }
    applyFiltersAndRender();
  });

  // Date range is in the header (not inside .filters), so it needs its own listener
  document.getElementById("dateRange").addEventListener("change", () => {
    applyFiltersAndRender();
  });

  const customStartEl = document.getElementById("customStart");
  const customEndEl = document.getElementById("customEnd");
  if (customStartEl) customStartEl.addEventListener("change", () => applyFiltersAndRender());
  if (customEndEl) customEndEl.addEventListener("change", () => applyFiltersAndRender());

  // Calendar vs fiscal view toggle in the header
  const viewModeEl = document.getElementById("viewMode");
  if (viewModeEl) {
    viewModeEl.addEventListener("change", () => {
      applyFiltersAndRender();
    });
  }

  document.getElementById("searchInput").addEventListener("input", () => {
    applyFiltersAndRender();
  });

  document.getElementById("platformMetric").addEventListener("change", () => {
    const filtered = filterData();
    renderPlatformChart(filtered);
  });

  const marketMetricEl = document.getElementById("marketMetric");
  if (marketMetricEl) {
    marketMetricEl.addEventListener("change", () => {
      const filtered = filterData();
      renderMarketChart(filtered);
    });
  }
}

function escapeCsvField(val) {
  const s = String(val == null ? "" : val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function exportToCsv() {
  const rows = filterData();
  const headers = ["date", "platform", "market", "campaign", "ad", "objective", "spend", "impressions", "clicks", "conversions", "revenue"];
  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsvField(row[h])).join(",")
  );
  const csv = [headerLine, ...dataLines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bob-evans-paid-media-" + new Date().toISOString().slice(0, 10) + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

function initTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  const tables = {
    campaigns: document.getElementById("tableCampaigns"),
    ads: document.getElementById("tableAds")
  };

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.getAttribute("data-tab");
      Object.keys(tables).forEach(key => {
        tables[key].classList.toggle("active", key === tab);
      });
    });
  });
}

function initManualEntry() {
  const toggle = document.getElementById("manualEntryToggle");
  const wrapper = document.getElementById("manualEntryFormWrapper");
  const form = document.getElementById("manualEntryForm");
  const cancelBtn = document.getElementById("manualEntryCancel");
  const messageEl = document.getElementById("manualEntryMessage");
  const manualCampaignSelect = document.getElementById("manualCampaignSelect");
  const manualCampaignNewWrapper = document.getElementById("manualCampaignNewWrapper");
  const manualCampaignNewInput = document.getElementById("manualCampaignNew");

  if (!toggle || !wrapper || !form) return;

  function setToday() {
    const startInput = document.getElementById("manualStartDate");
    const endInput = document.getElementById("manualEndDate");
    const todayStr = new Date().toISOString().slice(0, 10);
    if (startInput && !startInput.value) startInput.value = todayStr;
    if (endInput && !endInput.value) endInput.value = (startInput && startInput.value) || todayStr;
  }

  if (manualCampaignSelect && manualCampaignNewWrapper && manualCampaignNewInput) {
    function updateCampaignNewVisibility() {
      const isNew = manualCampaignSelect.value === "__new__";
      manualCampaignNewWrapper.style.display = isNew ? "" : "none";
      if (!isNew) {
        manualCampaignNewInput.value = "";
      }
    }
    manualCampaignSelect.addEventListener("change", updateCampaignNewVisibility);
    updateCampaignNewVisibility();
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", !isOpen);
    wrapper.hidden = isOpen;
    if (!isOpen) setToday();
    messageEl.textContent = "";
    messageEl.className = "manual-entry-message";
  });

  cancelBtn.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    wrapper.hidden = true;
    messageEl.textContent = "";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageEl.textContent = "";
    messageEl.className = "manual-entry-message";

    let campaignValue = "";
    if (manualCampaignSelect && manualCampaignNewInput) {
      if (manualCampaignSelect.value === "__new__") {
        campaignValue = manualCampaignNewInput.value.trim();
      } else {
        campaignValue = manualCampaignSelect.value.trim();
      }
    } else {
      campaignValue = document.getElementById("manualCampaign")?.value.trim() || "";
    }

    const payload = {
      // Manual entries are stored with a single `date` per row.
      // When you submit a flight range, the backend expands it into daily rows.
      dateStart: document.getElementById("manualStartDate").value,
      dateEnd: document.getElementById("manualEndDate").value,
      platform: document.getElementById("manualPlatform").value,
      market: (document.getElementById("manualMarket")?.value || "").trim(),
      campaign: campaignValue,
      ad: document.getElementById("manualAd").value.trim(),
      objective: document.getElementById("manualObjective").value,
      spend: parseFloat(document.getElementById("manualSpend").value) || 0,
      impressions: parseInt(document.getElementById("manualImpressions").value, 10) || 0,
      clicks: parseInt(document.getElementById("manualClicks").value, 10) || 0,
      conversions: parseInt(document.getElementById("manualConversions").value, 10) || 0,
      revenue: parseFloat(document.getElementById("manualRevenue").value) || 0
    };

    try {
      const res = await fetch(`${getApiBase()}/api/performance/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        messageEl.textContent = data.details || data.error || "Could not add entry.";
        messageEl.className = "manual-entry-message error";
        return;
      }

      messageEl.textContent = "Entry added. It’s included in the summary and tables above.";
      messageEl.className = "manual-entry-message success";
      form.reset();
      setToday();

      await loadPerformanceData();
      updateBackendStatusBar();
      applyFiltersAndRender();
    } catch (err) {
      messageEl.textContent = "Backend not running or network error. Start the backend to save entries.";
      messageEl.className = "manual-entry-message error";
    }
  });
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getDateRangeLabel() {
  const { dateRange, customStart, customEnd } = getFilters();
  if (dateRange === "custom" && customStart && customEnd) {
    return `Custom: ${customStart} → ${customEnd}`;
  }
  if (dateRange === "7d") return "Last 7 days";
  if (dateRange === "30d") return "Last 30 days";
  return "Last 90 days";
}

function topCampaignsBySpend(rows, limit = 10) {
  const by = {};
  rows.forEach(r => {
    const k = r.campaign || "(unknown)";
    if (!by[k]) by[k] = { spend: 0, conv: 0 };
    by[k].spend += r.spend || 0;
    by[k].conv += r.conversions || 0;
  });
  return Object.entries(by)
    .map(([name, v]) => ({ name, spend: v.spend, conv: v.conv }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, limit);
}

function describeActiveFiltersForReport() {
  const { platforms, objective, search, campaignFilter, marketFilter } = getFilters();
  const parts = [];
  parts.push(`Date: ${getDateRangeLabel()}`);
  parts.push(`Platforms: ${platforms.length ? platforms.join(", ") : "—"}`);
  parts.push(`Objective: ${objective === "all" ? "All" : objective}`);
  if (campaignFilter !== "all") parts.push(`Campaign: ${campaignFilter}`);
  if (marketFilter !== "all") parts.push(`Market: ${marketFilter}`);
  if (search) parts.push(`Search: “${search}”`);
  return parts;
}

function openCustomReport() {
  const now = new Date();
  const filtered = filterData();
  const priorRows = rowsForPriorPeriod();
  const cur = rollupMetrics(filtered);
  const prev = rollupMetrics(priorRows);
  const periodText = getPeriodDescription(now);
  const campaigns = topCampaignsBySpend(filtered, 12);

  const pct = (a, b) => {
    if (b === 0 && a === 0) return "—";
    if (b === 0) return "new";
    const p = ((a - b) / b) * 100;
    if (Math.abs(p) < 0.05) return "flat";
    return (p > 0 ? "+" : "") + p.toFixed(1) + "%";
  };

  const rowsHtml = campaigns.length
    ? campaigns
        .map(
          c => `<tr><td>${escapeHtml(c.name)}</td><td class="num">${formatCurrency(c.spend)}</td><td class="num">${formatNumber(Math.round(c.conv))}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="3">No rows for current filters.</td></tr>`;

  const filterLines = describeActiveFiltersForReport()
    .map(line => `<li>${escapeHtml(line)}</li>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Paid Media Report — ${now.toISOString().slice(0, 10)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #111; background: #fff; margin: 0; padding: 1.25rem 1.5rem; font-size: 11pt; line-height: 1.4; }
    h1 { font-size: 1.35rem; margin: 0 0 0.25rem; }
    .meta { color: #444; font-size: 0.9rem; margin-bottom: 1rem; }
    h2 { font-size: 1rem; margin: 1.1rem 0 0.4rem; border-bottom: 1px solid #ccc; padding-bottom: 0.2rem; }
    .period { background: #f4f4f5; padding: 0.6rem 0.75rem; border-radius: 6px; font-size: 0.88rem; margin-bottom: 0.75rem; }
    ul.filters { margin: 0.25rem 0 0; padding-left: 1.2rem; font-size: 0.88rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.35rem; font-size: 0.88rem; }
    th, td { text-align: left; padding: 0.35rem 0.5rem; border-bottom: 1px solid #e5e5e5; }
    th { font-weight: 600; background: #fafafa; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    .kpis { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem 1.25rem; }
    @media (min-width: 520px) { .kpis { grid-template-columns: repeat(3, 1fr); } }
    .kpi { border: 1px solid #e5e5e5; border-radius: 6px; padding: 0.45rem 0.55rem; }
    .kpi .l { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: #666; }
    .kpi .v { font-size: 1.05rem; font-weight: 600; margin-top: 0.1rem; }
    .kpi .d { font-size: 0.78rem; color: #555; margin-top: 0.15rem; }
    .hint { margin-top: 1rem; font-size: 0.8rem; color: #666; }
    @media print {
      body { padding: 0.5rem; }
      .hint { display: none; }
    }
  </style>
</head>
<body>
  <h1>Bob Evans — Paid Media Performance</h1>
  <p class="meta">Generated ${now.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · Matches current dashboard filters</p>
  <div class="period"><strong>Period</strong><br />${escapeHtml(periodText)}</div>
  <h2>Filters applied</h2>
  <ul class="filters">${filterLines}</ul>
  <h2>Summary vs prior period</h2>
  <div class="kpis">
    <div class="kpi"><div class="l">Spend</div><div class="v">${formatCurrency(cur.spend)}</div><div class="d">vs prior: ${escapeHtml(pct(cur.spend, prev.spend))}</div></div>
    <div class="kpi"><div class="l">Conversions</div><div class="v">${formatNumber(Math.round(cur.conversions))}</div><div class="d">vs prior: ${escapeHtml(pct(cur.conversions, prev.conversions))}</div></div>
    <div class="kpi"><div class="l">Impressions</div><div class="v">${formatNumber(cur.impressions)}</div><div class="d">vs prior: ${escapeHtml(pct(cur.impressions, prev.impressions))}</div></div>
    <div class="kpi"><div class="l">Clicks</div><div class="v">${formatNumber(cur.clicks)}</div><div class="d">vs prior: ${escapeHtml(pct(cur.clicks, prev.clicks))}</div></div>
    <div class="kpi"><div class="l">CPA</div><div class="v">${escapeHtml(formatCPA(cur.spend, cur.conversions))}</div><div class="d">vs prior: ${escapeHtml(pct(cur.cpa, prev.cpa))}</div></div>
    <div class="kpi"><div class="l">ROAS</div><div class="v">${escapeHtml(formatROAS(cur.revenue, cur.spend))}</div><div class="d">vs prior: ${escapeHtml(pct(cur.roas, prev.roas))}</div></div>
  </div>
  <h2>Top campaigns by spend</h2>
  <table>
    <thead><tr><th>Campaign</th><th class="num">Spend</th><th class="num">Conversions</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <p class="hint">Use your browser’s Print dialog → “Save as PDF” to keep a copy. Close this tab when done.</p>
</body>
</html>`;

  // Blob URL works when document.write on a new window fails (e.g. noopener / strict policies).
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  // Do not use noopener here — it can return a window you cannot write to, leaving a blank tab.
  const w = window.open(url, "_blank");
  if (!w) {
    URL.revokeObjectURL(url);
    alert("Pop-up blocked. Allow pop-ups for this site to open the report.");
    return;
  }
  const cleanup = () => {
    try {
      URL.revokeObjectURL(url);
    } catch (_) {
      /* ignore */
    }
  };
  let printed = false;
  const schedulePrint = () => {
    if (printed) return;
    try {
      const doc = w.document;
      if (!doc || !doc.body) return;
      if (!doc.body.textContent || doc.body.textContent.trim().length < 30) return;
      printed = true;
      w.focus();
      w.print();
    } catch (_) {
      /* user can still use Cmd/Ctrl+P */
    }
  };
  w.addEventListener("load", () => setTimeout(schedulePrint, 250));
  setTimeout(schedulePrint, 500);
  setTimeout(schedulePrint, 1200);
  setTimeout(cleanup, 180000);
}

function initExport() {
  const btn = document.getElementById("exportCsvBtn");
  if (btn) btn.addEventListener("click", exportToCsv);
  const reportBtn = document.getElementById("customReportBtn");
  if (reportBtn) reportBtn.addEventListener("click", openCustomReport);
}

/**
 * Embedded copy of templates/Paid_Media_Performance_Template.csv
 * (keep in sync when editing that file). Used when fetch fails (CORS from file://, backend off, etc.).
 */
const PERFORMANCE_TEMPLATE_CSV =
  "date,platform,market,campaign,ad,objective,spend,impressions,clicks,conversions,revenue\n" +
  "2026-02-12,google,cleveland,Search | Family Dinner | US,Dinner KW Broad,conversions,520.34,78000,4600,210,4100\n" +
  "2026-02-12,meta,columbus,Paid Social | Millennial Parents | Video,Hero Video 15s,conversions,430.12,92000,3800,145,2900\n" +
  "2026-02-12,tiktok,cincinnati,TikTok | ParentTok | Family Meals,POV After Practice,conversions,260.75,64000,3200,110,2200\n";

function triggerCsvDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function downloadPerformanceTemplate() {
  const base = getApiBase();
  const paths = ["/templates/Paid_Media_Performance_Template.csv", "/api/performance/template"];
  for (const p of paths) {
    const url = `${base}${p}`;
    try {
      const res = await fetch(url, { cache: "no-store", mode: "cors" });
      if (!res.ok) continue;
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      if (ct.includes("application/json")) continue;
      const text = await res.text();
      if (!text || text.trim().startsWith("{")) continue;
      const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
      triggerCsvDownload(blob, "Paid_Media_Performance_Template.csv");
      return;
    } catch (_) {
      /* try next URL or fallback */
    }
  }
  const blob = new Blob([PERFORMANCE_TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
  triggerCsvDownload(blob, "Paid_Media_Performance_Template.csv");
}

function initCsvImport() {
  const importBtn = document.getElementById("importCsvBtn");
  const importInput = document.getElementById("importCsvInput");
  const templateBtn = document.getElementById("downloadTemplateBtn");
  const planBtn = document.getElementById("importPlanCsvBtn");
  const planInput = document.getElementById("importPlanCsvInput");

  if (templateBtn) {
    templateBtn.addEventListener("click", () => downloadPerformanceTemplate());
  }

  if (importBtn && importInput) {
    importBtn.addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      try {
        const text = await file.text();
        const res = await fetch(`${getApiBase()}/api/performance/csv`, {
          method: "POST",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
          body: text,
        });
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        let data = {};
        if (ct.includes("application/json")) {
          data = await res.json().catch(() => ({}));
        } else {
          const rawText = await res.text();
          const looksHtml =
            rawText.trim().toLowerCase().startsWith("<!doctype") || rawText.includes("<html");
          alert(
            looksHtml
              ? "Import got an HTML page instead of JSON — wrong server or old tab.\n\nOpen http://localhost:5001 (no space), restart backend (npm start), hard refresh (⌘⇧R), try again."
              : `Import failed (HTTP ${res.status}). ${rawText.slice(0, 200)}`
          );
          return;
        }
        if (!res.ok) {
          const msg = [data.error, data.details].filter(Boolean).join("\n\n");
          alert(msg || `Import failed (HTTP ${res.status})`);
          return;
        }
        await loadPerformanceData();
        applyFiltersAndRender();
        await loadPacingData();
        alert(data.message || `Imported ${data.rows} rows.`);
      } catch (err) {
        alert("Import failed: " + (err.message || "network error — is the backend running on port 5001?"));
      }
    });
  }

  if (planBtn && planInput) {
    planBtn.addEventListener("click", () => planInput.click());
    planInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      if (!confirm("Replace plan.csv with this file? (Pacing section uses this.)")) return;
      try {
        const text = await file.text();
        const res = await fetch(`${getApiBase()}/api/plan/csv`, {
          method: "POST",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
          body: text,
        });
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        let data = {};
        if (ct.includes("application/json")) {
          data = await res.json().catch(() => ({}));
        } else {
          const rawText = await res.text();
          const looksHtml =
            rawText.trim().toLowerCase().startsWith("<!doctype") || rawText.includes("<html");
          alert(
            looksHtml
              ? "Plan import got HTML instead of JSON — backend may be old or wrong port.\n\nRestart: cd backend && npm start. Open http://localhost:5001"
              : `Plan import failed (HTTP ${res.status}). ${rawText.slice(0, 200)}`
          );
          return;
        }
        if (!res.ok) {
          alert(data.error || data.details || "Plan import failed");
          return;
        }
        await loadPacingData();
        alert(data.message || `Imported ${data.rows} plan rows.`);
      } catch (err) {
        alert("Plan import failed: " + (err.message || "network error"));
      }
    });
  }
}

/** Wires developer notes modal; open/close are only used after Maintainer gate. */
function initDevNotesModal() {
  const modal = document.getElementById("importHelpModal");
  const closeBtn = document.getElementById("importHelpClose");
  const backdrop = document.getElementById("importHelpBackdrop");
  const lockBtn = document.getElementById("devPanelLockBtn");
  if (!modal) return { open: () => {}, close: () => {} };

  function open() {
    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  }

  function close() {
    modal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  modal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  lockBtn?.addEventListener("click", async () => {
    try {
      await fetch(`${getApiBase()}/api/dev/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {
      /* ignore */
    }
    close();
  });

  return { open, close };
}

async function fetchMaintainerSession() {
  try {
    const res = await fetch(`${getApiBase()}/api/dev/session`, { credentials: "include" });
    if (!res.ok) return { configured: false, devPanel: false };
    return res.json();
  } catch (_) {
    return { configured: false, devPanel: false };
  }
}

/**
 * One “Maintainer” button (only if server has DEV_PANEL_TOKEN). Click → password if needed → developer notes.
 * No setup/offline banners; wanderers only see the button and the Restricted dialog.
 */
async function initMaintainerGate() {
  const dock = document.getElementById("devPanelDock");
  const gateBtn = document.getElementById("maintainerGateBtn");
  const pwdModal = document.getElementById("maintainerPasswordModal");
  const pwdBackdrop = document.getElementById("maintainerPasswordBackdrop");
  const pwdClose = document.getElementById("maintainerPasswordClose");
  const pwdInput = document.getElementById("maintainerPasswordInput");
  const pwdSubmit = document.getElementById("maintainerPasswordSubmit");
  const pwdErr = document.getElementById("maintainerPasswordError");

  const session = await fetchMaintainerSession();
  if (!session.configured) {
    dock?.setAttribute("hidden", "");
    return;
  }
  dock?.removeAttribute("hidden");

  const { open: openNotes, close: closeNotes } = initDevNotesModal();

  function openPasswordModal() {
    if (!pwdModal) return;
    pwdModal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    if (pwdErr) pwdErr.hidden = true;
    if (pwdInput) {
      pwdInput.value = "";
      pwdInput.focus();
    }
  }

  function closePasswordModal() {
    pwdModal?.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  pwdClose?.addEventListener("click", closePasswordModal);
  pwdBackdrop?.addEventListener("click", closePasswordModal);
  pwdModal?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePasswordModal();
  });

  pwdInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") pwdSubmit?.click();
  });

  async function tryPasswordThenOpenNotes() {
    if (pwdErr) pwdErr.hidden = true;
    const token = (pwdInput?.value || "").trim();
    if (!token) {
      if (pwdErr) {
        pwdErr.textContent = "Enter the password.";
        pwdErr.hidden = false;
      }
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/api/dev/unlock`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (pwdErr) {
          pwdErr.textContent = data.error === "Invalid token" ? "Wrong password." : data.error || "Could not verify.";
          pwdErr.hidden = false;
        }
        return;
      }
      closePasswordModal();
      openNotes();
    } catch (err) {
      if (pwdErr) {
        pwdErr.textContent = err.message || "Network error — is the backend running?";
        pwdErr.hidden = false;
      }
    }
  }

  pwdSubmit?.addEventListener("click", tryPasswordThenOpenNotes);

  gateBtn?.addEventListener("click", async () => {
    const s = await fetchMaintainerSession();
    if (s.devPanel) {
      openNotes();
    } else {
      openPasswordModal();
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadPerformanceData();
  updateBackendStatusBar();
  await initMaintainerGate();
  initFilters();
  initTabs();
  initManualEntry();
  initExport();
  initCsvImport();
  applyFiltersAndRender();
  await loadPacingData();

  const pacingMonthEl = document.getElementById("pacingMonth");
  if (pacingMonthEl) {
    pacingMonthEl.addEventListener("change", () => loadPacingData());
  }
});

