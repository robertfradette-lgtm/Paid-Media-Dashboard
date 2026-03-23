# Paid media dashboard — quick reference (server & CSV import)

**Maintainer-only:** with `DEV_PANEL_TOKEN` set in `backend/.env`, an **amber** **Maintainer** button appears in the **top header** (after Export CSV). Click → **Restricted** password dialog → same value as `DEV_PANEL_TOKEN` → **Developer notes** open. This file is long-form copy for you in Cursor.

If import or data load fails, work through **Start the server** first, then **Import problems**.

---

## Maintainer button (browser)

1. In **`backend/.env`**: `DEV_PANEL_TOKEN=` + at least **8 characters**. Restart **`npm start`**.
2. Reload the dashboard. You should see **Maintainer** (amber button, top-right in the header). Others can click it but need the password.
3. Enter the **same** value as `DEV_PANEL_TOKEN`. **Continue** opens developer notes. A cookie keeps you unlocked until **Lock (require password next time)** inside the notes.

If **`DEV_PANEL_TOKEN`** is missing, the **Maintainer** button is **hidden** entirely.

---

---

## Start the server (required for API + CSV import)

The dashboard **HTML** can open from a file, but **Import CSV** and live data need the backend running.

1. Open **Terminal** (or Cursor’s terminal).
2. Run:
   ```bash
   cd /Users/robertfradette/paid-media-dashboard/backend
   npm start
   ```
3. You should see: **`Paid media backend listening on http://localhost:5001`**
4. **Leave this terminal open** while you use the dashboard (or the server stops).

**Open the app in the browser:**  
**http://localhost:5001**  
(Same port as the API — avoids “wrong server” / HTML instead of JSON.)

---

## Port 5001 already in use

Something else (often an old Node process) is still using the port.

1. Find the process:
   ```bash
   lsof -i :5001
   ```
2. Note the **PID** (second column — a number like `17616`), then run **`kill`** followed by that number, e.g.:
   ```bash
   kill 17616
   ```
   (Replace `17616` with whatever `lsof` shows for your machine.)

3. If it won’t die: `kill -9` and the same number (e.g. `kill -9 17616`)
4. Start again: `npm start`

**Alternative:** run on another port:
```bash
PORT=5002 npm start
```
Then open **http://localhost:5002** (not 5001).

---

## Import says HTML instead of JSON / “wrong server”

Usually means the browser is **not** talking to **this** app’s API.

1. Confirm the backend is running (`npm start` output shows **localhost:5001**).
2. Use **http://localhost:5001** for the dashboard (not `file://` if imports fail).
3. After changing `server.js`, **restart** the backend (Ctrl+C, then `npm start` again).

---

## Import validation errors (400)

- Use the **Download template** CSV headers, or match required columns (see `templates/` and `DATA_README.md` in this project).
- File must have a **header row** and at least **one data row**.

---

## Stop the server

In the terminal where `npm start` is running: **Ctrl+C**

---

## Files that hold your data

| File | Role |
|------|------|
| `backend/data/performance.csv` | Main performance data (import overwrites this) |
| `backend/data/plan.csv` | Pacing plan (**Import plan**) |
| `backend/data/manual_entries.json` | Manual entries from the UI |

---

*Last aligned with dashboard CSV import + Express raw body behavior.*
