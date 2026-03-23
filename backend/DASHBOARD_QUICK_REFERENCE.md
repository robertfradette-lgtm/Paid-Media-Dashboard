# Paid media dashboard — quick reference (server & CSV import)

**Full doc:** `../DASHBOARD_QUICK_REFERENCE.md` (project root).

**Maintainer:** with `DEV_PANEL_TOKEN` in `.env`, **Maintainer** button (amber, header row) → password → notes. No button if token unset.

---

## Start the server

1. `cd` to this `backend` folder, then `npm start`
2. Open **`http://localhost:5001`**

## Port 5001 in use

`lsof -i :5001` → `kill <PID>` → `npm start`

## Data files

| File | Role |
|------|------|
| `data/performance.csv` | Performance import |
| `data/plan.csv` | Plan import |
| `data/manual_entries.json` | Manual entries |
