# Visibility Dashboard — Looker & Power BI

Omnichannel visibility dashboard (Local / Organic / AI / Commercial) per the FY27 Measurement & Reporting blueprint.

## Structure

```
visibility-dashboard/
├── sql/              # BigQuery views (or Azure SQL)
├── looker/           # LookML project
├── powerbi/          # Power BI DAX, Power Query M, model docs
├── schemas/          # Vendor CSV schemas (copy-paste for SOCI, SEMrush, GA4)
└── README.md
```

## Quick Start

1. **Ingest data** — Schedule SOCI, SEMrush, GA4 exports to BigQuery (or Azure).
2. **Deploy SQL views** — Run `sql/*.sql` in BigQuery (or adapt for Azure).
3. **Connect Looker** — Point at BigQuery project; deploy LookML.
4. **Connect Power BI** — Use `powerbi/` scripts; import model.

See `IMPLEMENTATION.md` for step-by-step deployment.
