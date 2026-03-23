# Linking real data to the paid media dashboard

**Reset all local data (step-by-step for Mac):** see **`../RESET_DATA_SIMPLE.md`** in the project folder.

## Quick import (dashboard UI)

With the backend running, open the dashboard at **http://localhost:5001** (same origin as the API).

1. **Download template** — Click **Download template** in the header to get `Paid_Media_Performance_Template.csv` (opens in Excel or Google Sheets).
2. Fill in rows (keep the header row). Use **Save As → CSV UTF-8** from Excel when saving.
3. **Import CSV** — Click **Import CSV** and choose your file. This replaces `backend/data/performance.csv` immediately (no manual file copy).
4. **Import plan** (optional) — For pacing, use `templates/Paid_Media_Plan_Template.csv`, then **Import plan**.

Templates and field definitions: **`../templates/CSV_AND_EXCEL_GUIDE.md`**

---

## Option 1: CSV (works today)

1. Export performance from your ad platforms (Google, Meta, TikTok, DSP) with these columns:
   - `date` – YYYY-MM-DD
   - `platform` – google | meta | tiktok | olv | display
   - `market` – (optional) cleveland | columbus | cincinnati | charleston | dayton | toledo | indianapolis | pittsburgh (FY27 funded/control markets)
   - `campaign` – campaign name
   - `ad` – ad/creative name
   - `objective` – awareness | traffic | conversions
   - `spend` – total spend (number)
   - `impressions` – number
   - `clicks` – number
   - `conversions` – number
   - `revenue` – conversion value (number)

2. Combine all platforms into one CSV with a header row (see `data/performance.csv.example`).

3. Save the file as `data/performance.csv` in this backend folder (same folder as `server.js`).

4. Restart the backend (`npm start`). The dashboard will load from the CSV.

## Pacing (Spend vs Plan)

To enable the Pacing dashboard (spend vs plan with variance flags):

1. Create `data/plan.csv` with columns: `month`, `market`, `platform`, `plan_spend`
   - `month` – YYYY-MM (e.g. 2026-02)
   - `market` – cleveland | columbus | cincinnati | charleston | dayton | toledo | all
   - `platform` – google | meta | tiktok | olv | display
   - `plan_spend` – planned spend (number)

2. See `data/plan.csv.example` for format.

3. The Pacing panel shows actual spend vs plan by month/market/platform. Variance >±10% is flagged (Over/Under).

## Linking a DSP

There is no built-in DSP API. You can link a DSP in two ways:

**A. CSV export (recommended for bulk data)**

1. In your DSP (e.g. The Trade Desk, MediaMath, DV360, etc.), export performance report with date, campaign, line item or creative, spend, impressions, clicks, conversions, and revenue (or equivalent fields).
2. Map columns to the dashboard format above:
   - Use **`platform = olv`** for OLV rows
   - Use **`platform = display`** for Display rows
   - For backward compatibility, if you still export **`platform = dsp`**, the backend will infer `olv` vs `display` from the `campaign`/`ad` text containing “OLV” or “Display”.
3. Save as `backend/data/performance.csv` (or append DSP rows to an existing CSV that has the same header).
4. Restart the backend. DSP rows will appear with Google/TikTok API data and manual entries.

**B. Manual entry**

1. In the dashboard, use **Add manual entry**.
2. Choose **Platform**: “DSP — OLV” or “DSP — Display”.
3. Enter date, campaign, ad name, objective, spend, impressions, clicks, conversions, revenue.
4. Submit. The entry is stored and shown in the dashboard (no backend CSV needed).

To add a **live** DSP connection (API), you’d need to implement a new integration in `server.js` for your DSP’s reporting API, similar to the existing Google Ads and TikTok integrations.

## Option 2: Google Ads & Meta APIs (later)

Add to a `.env` file in this folder (do not commit):

- **Google Ads**: `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
- **Meta**: `META_APP_ID`, `META_APP_SECRET`, `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_IDS`

The backend can be extended to call their APIs and merge results with CSV data; the dashboard already expects the same row shape.
