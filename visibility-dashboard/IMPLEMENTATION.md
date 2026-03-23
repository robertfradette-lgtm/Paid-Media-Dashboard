# Visibility Dashboard — Implementation Guide

Step-by-step deployment for Looker (BigQuery) or Power BI (Azure/SQL).

---

## Phase 1: Data Ingestion (Week 1)

### 1.1 Create BigQuery Dataset (Looker) or Azure SQL DB (Power BI)

**BigQuery:**
```sql
CREATE SCHEMA IF NOT EXISTS visibility_dashboard;
```

**Azure:** Create a dedicated database or schema for visibility tables.

### 1.2 Load Raw Tables

Create tables from vendor CSVs. Use the schemas in `schemas/` — paste into vendor tickets.

| Source | Table | Load Method |
|--------|-------|-------------|
| SOCI | `soci_local_raw` | Scheduled CSV load (daily/monthly) |
| SEMrush Position | `semrush_position_raw` | Export/API → CSV → load |
| SEMrush Audit | `semrush_audit_raw` | Export/API → load |
| SEMrush Backlinks | `semrush_backlinks_raw` | Export/API → load |
| SEMrush AI | `semrush_ai_raw` | Export/API → load |
| GA4 | `ga4_ecommerce_raw` | BigQuery export (native) or Data API |
| POS (optional) | `pos_sales_raw` | Daily ETL |

### 1.3 Column Mappings

Ensure column names match the SQL views. See `schemas/6A_SOCI_Local.csv.schema` etc.

---

## Phase 2: Deploy SQL Views (Week 1–2)

### Looker + BigQuery

1. Open BigQuery console.
2. Run each file in `sql/` in order:
   - `01_local_pane_views.sql`
   - `02_organic_pane_views.sql`
   - `03_ai_pane_views.sql`
   - `04_commercial_pane_views.sql`
   - `05_delta_views.sql`
3. Adjust `YOUR_DATASET` to your actual dataset name.
4. Create tables if using raw CSVs (replace `FROM visibility.soci_local` with your raw table).

### Power BI + Azure

1. Adapt SQL for Azure SQL (syntax is largely compatible).
2. Create views or use Power Query to replicate the logic.
3. Or: Load raw tables and implement logic in Power Query / DAX.

---

## Phase 3: Looker Deployment

### 3.1 Connect Looker to BigQuery

1. Looker Admin → Connections → Add Connection.
2. Type: BigQuery (Standard or OAuth).
3. Test connection.

### 3.2 Deploy LookML Project

1. Create new project or git repo.
2. Copy `looker/` contents into project:
   - `project.lkml`
   - `manifest.lkml`
   - `models/visibility.model.lkml`
   - `views/*.view.lkml`
   - `explores/*.explore.lkml`
   - `dashboards/*.dashboard.lookml`
3. Update `sql_table_name` in each view to match your BigQuery dataset.
4. Develop → Validate LookML → Deploy to production.

### 3.3 Build Dashboard

1. Create Looks for each pane (Local, Organic, AI, Commercial).
2. Add to dashboard `omnichannel_visibility`.
3. Configure filters: DMA, Date Range, Device.
4. Add delta scorecards (MoM, YoY) from `delta_local_pane` etc.

### 3.4 Alerts

- Local Pack Share ↓ > 10% in any DMA
- SoV ↓ > 5 pts
- Site Health < 80
- AI SOV gap in top prompts
- Conversion Rate ↓ > 0.5 pp

---

## Phase 4: Power BI Deployment

### 4.1 Get Data

1. Power BI Desktop → Get Data.
2. Use `powerbi/PowerQuery_DataSources.pq` as reference for each source.
3. Load: SOCI, SEMrush (Position, Audit, Backlinks, AI), GA4.
4. Create Date, DMA, Device dimension tables.

### 4.2 Model

1. Follow `powerbi/Data_Model_Design.md`.
2. Create relationships: Date ↔ all fact tables; DMA ↔ all.
3. Create Calculation Groups for MoM/YoY if desired.

### 4.3 Measures

1. Modeling → New Measure.
2. Copy each measure from `powerbi/DAX_Measures.dax` (one at a time).
3. Adjust table references if your names differ.

### 4.4 Report

1. Create 4 quadrants: Local, Organic, AI, Commercial.
2. Top row: Filters (DMA, Date, Device) + scorecards.
3. Add trend lines and top DMAs tables.
4. Publish to Power BI Service; schedule refresh.

---

## Phase 5: UTMs & Events (Ongoing)

1. Lock UTMs on all GBP website links via SOCI:
   - `utm_source=google`
   - `utm_medium=organic_gbp`
   - `utm_campaign=gbp_store_{Location_ID}`

2. GA4: Ensure `purchase` / `order_completed` includes `value`, `location_id`, `dma`.

---

## Checklist

- [ ] SOCI export scheduled → BigQuery/Azure
- [ ] SEMrush exports configured (Position, Audit, Backlinks, AI)
- [ ] GA4 BigQuery export enabled (or daily pull)
- [ ] SQL views deployed
- [ ] Looker or Power BI connected
- [ ] Dashboard published
- [ ] Alerts configured
- [ ] UTMs locked on GBP
