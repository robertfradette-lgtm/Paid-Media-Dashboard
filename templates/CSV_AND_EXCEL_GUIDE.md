# Performance & plan data — CSV / Excel

## Performance data (charts & tables)

The importer **maps common export headers** to the fields below (e.g. **Channel** → `platform`, **Cost** → `spend`, **Report Date** → `date`). If import still fails, the error lists **Headers in your file** so you can rename or add a row.

**Canonical columns (one row per line of reporting):**

| Column | Notes |
|--------|--------|
| `date` | `YYYY-MM-DD` (daily reporting date) OR use `flight_start` + `flight_end` below |
| `flight_start` | `YYYY-MM-DD` (flight start date) |
| `flight_end` | `YYYY-MM-DD` (flight end date) |
| `platform` | `google`, `meta`, `tiktok`, `olv`, or `display` (lowercase) |
| `market` | e.g. `cleveland`, `columbus` (lowercase; optional but used for filters) |
| `campaign` | Free text |
| `ad` | Free text |
| `objective` | e.g. `conversions`, `awareness`, `traffic` |
| `spend` | Number |
| `impressions` | Integer |
| `clicks` | Integer |
| `conversions` | Integer |
| `revenue` | Number |

**Template file:** `Paid_Media_Performance_Template.csv` (open in Excel or Google Sheets). If you use `flight_start`/`flight_end`, the importer expands each row into daily rows and distributes totals evenly across the flight (rounding remainder on the last day).

## Plan data (pacing)

**Columns:** `month`, `market`, `platform`, `plan_spend`  
- `month`: `YYYY-MM`  
- `market`: DMA/market slug or `all` for a default  
- `platform`: `google`, `meta`, `tiktok`, `olv`, or `display`  

**Template file:** `Paid_Media_Plan_Template.csv`

## Using Excel

1. Open `Paid_Media_Performance_Template.csv` in Excel.
2. Add/replace rows; keep the **header row** as row 1.
3. **Save As → CSV UTF-8 (Comma delimited) (.csv)** (Mac Excel: *CSV UTF-8*).
4. Import via the dashboard **Import CSV** button, or copy the file to `backend/data/performance.csv` and restart the backend.

## Quick upload (no file copy)

With the backend running at **http://localhost:5001**, use **Import CSV** on the dashboard to replace `performance.csv` in one step.
