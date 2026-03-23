# Bob Evans Paid Media Performance Dashboard

## View the dashboard

- **Mock data only**: Double-click `index.html` in this folder (or open it in your browser).
- **With real data or manual entries**: Double-click **`Start Backend.command`** first (a window will open—leave it open), then double-click `index.html` to open the dashboard.

## Linking real data

### 1. CSV (no API setup)

1. Put your performance data in **`backend/data/performance.csv`**.
2. Use the exact column headers:  
   `date,platform,campaign,ad,objective,spend,impressions,clicks,conversions,revenue`
3. See **`backend/data/performance.csv.example`** and **`backend/DATA_README.md`** for format and platform values (`google`, `meta`, `tiktok`, `dsp`).

### 2. Start the backend

**Easiest (no Terminal):** Double-click **`Start Backend.command`** in this folder. A window will open and the backend will start; leave that window open while you use the dashboard. Close it when you’re done.  
*(First time only: if macOS says the file can’t be opened, right‑click it → **Open** → **Open** to allow it.)*

**Or in Terminal:**

```bash
cd "/Users/robertfradette/paid-media-dashboard/backend"
npm install
npm start
```

Leave it running. You should see: `Paid media backend listening on http://localhost:5001`.

### 3. Open the dashboard

- Open **`index.html`** in your browser (e.g. from Finder).
- The dashboard will request data from `http://localhost:5001/api/performance`. If the backend is running and `backend/data/performance.csv` exists, you’ll see your CSV data; otherwise you’ll see mock data.

If the dashboard shows no data when the backend is running, check the browser console (F12 → Console) for errors. Some browsers block requests from a `file://` page to `localhost`; in that case, serve the folder with a simple HTTP server (e.g. `npx serve .` from this folder) and open the URL it prints.

### 4. Google Ads & Meta APIs (later)

When you have API access, add credentials to **`backend/.env`** and extend **`backend/server.js`** to call Google Ads and Meta Marketing APIs. The dashboard already expects the same row shape; see **`backend/DATA_README.md`** for env var names.
# Paid-Media-Dashboard
