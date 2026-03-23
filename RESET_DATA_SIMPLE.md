# Reset all dashboard data (simple steps)

---

## Read this first — what this guide is and where to find it

### What you’re looking at

- This guide is a **file on your Mac**, like a notes document. Its name is **`RESET_DATA_SIMPLE.md`**.
- It is **not** a website. You do **not** type anything in **Safari or Chrome** to *open this guide* (the browser is only used later to see the **dashboard** after you reset data).

### Where the file “lives” (plain English)

- Your project is a **folder on your computer** called **`paid-media-dashboard`**.
- That folder is usually inside your **user** folder. The full address (“path”) of **this guide file** is:

  **`/Users/robertfradette/paid-media-dashboard/RESET_DATA_SIMPLE.md`**

- **`paid-media-dashboard`** = the project folder (paid media dashboard code and data).  
- **`RESET_DATA_SIMPLE.md`** = this reset guide, sitting **inside** that project folder (same level as the `backend` folder).

### Way A — Open this guide in **Cursor** (if you use Cursor)

1. Open the **Cursor** app (same place you edit code).
2. **Open the project folder** (if it isn’t open already):
   - Menu **File → Open Folder…**
   - Go to **`paid-media-dashboard`** (often under your name in the sidebar, or paste the path below).
3. In Cursor’s **left sidebar** (file list), click folders until you see **`RESET_DATA_SIMPLE.md`** at the **top level** of the project (not inside `backend`).
   - If you don’t see the sidebar: menu **View → Explorer** (or the file-tree icon).
4. **Click** `RESET_DATA_SIMPLE.md` — the guide opens in the main panel.

**Paste path in Cursor’s Open Folder dialog (if needed):**

`/Users/robertfradette/paid-media-dashboard`

### Way B — Open this guide in **Finder** (Mac folders)

1. Open **Finder** (smiling face in the dock).
2. Press **⌘⇧G** (Command + Shift + G).
3. Paste this **exact** line and press **Enter**:

   `/Users/robertfradette/paid-media-dashboard`

4. You should see a list of files and folders. **Double-click** **`RESET_DATA_SIMPLE.md`**.  
   - It may open in **TextEdit**, **Cursor**, or **Preview** — any of those is fine for reading.

### Way C — **Spotlight** search (fast)

1. Press **⌘Space** (Command + Space).
2. Type: **`RESET_DATA_SIMPLE`**
3. Click the result that shows **`RESET_DATA_SIMPLE.md`** under **`paid-media-dashboard`**.

---

## What this guide helps you do

**What this does:** Clears performance rows, plan rows, and manual entries. Charts and tables will be empty (or header-only) after you refresh the browser.

**You will edit 3 small files** in one folder on your Mac.

---

## Before you start

1. **Optional:** If the dashboard is open in the browser, you can leave it open—you will refresh it at the end.

2. You do **not** need to stop the backend for this. If `npm start` is running, that’s fine.

---

## Step 1: Open the `data` folder

1. On your Mac, open **Finder** (click the smiling face icon in the dock).

2. Press **⌘⇧G** (Command + Shift + G). A “Go to the folder” box appears.

3. **Copy and paste** this path into the box:

   ```
   /Users/robertfradette/paid-media-dashboard/backend/data
   ```

4. Click **Go**.

5. You should see files named **`performance.csv`**, **`plan.csv`**, and **`manual_entries.json`**.  
   **Stay in this folder** for the next steps.

---

## Step 2: Clear **performance.csv**

1. **Double-click** `performance.csv`. It usually opens in **Numbers** or **Excel** (or TextEdit).

2. **Delete every row except the first row** (the header row).

3. The **first row** must stay exactly like this (all one line):

   ```
   date,platform,market,campaign,ad,objective,spend,impressions,clicks,conversions,revenue
   ```

4. **Save** the file (**⌘S**).  
   - If Numbers or Excel asks about format, choose **CSV** if asked.

5. **If the file opened in TextEdit instead:**  
   - Delete everything **after** that header line so only that one line remains (plus an empty line is OK).  
   - Save.

---

## Step 3: Clear **plan.csv**

1. Go back to the same **`data`** folder (Finder).

2. Open **`plan.csv`**.

3. Leave **only** this one line (the header):

   ```
   month,market,platform,plan_spend
   ```

4. Delete any other rows.

5. **Save** the file.

---

## Step 4: Clear **manual_entries.json**

1. In the same **`data`** folder, **right-click** `manual_entries.json` → **Open With** → **TextEdit** (or Cursor / VS Code if you use those).

2. **Select all** (**⌘A**) and **delete**.

3. Type **exactly** this (including the square brackets):

   ```
   []
   ```

4. **Save** the file (**⌘S**).

---

## Step 5: Reload the dashboard

1. Open your web browser (Chrome, Safari, etc.).

2. Go to:

   ```
   http://localhost:5001
   ```

3. **Refresh the page:** press **⌘R**, or **⌘⇧R** for a hard refresh.

4. **What to look for:** Charts and tables should show **no data** (or empty), until you import CSVs or add manual entries again.

---

## If something looks wrong

- **Still see old numbers?** Try **⌘⇧R** (hard refresh) again, or close the tab and open `http://localhost:5001` in a new tab.

- **Using a Google Sheet** for data (`GOOGLE_SHEET_URL` in `.env`)? Clearing these files does **not** clear the sheet. Old numbers can come back from the sheet until you change or remove that link.

---

## Quick checklist

| File | After reset, it should contain |
|------|--------------------------------|
| `performance.csv` | Header line only (see Step 2) |
| `plan.csv` | Header line only (see Step 3) |
| `manual_entries.json` | `[]` |

All three files live in:

`/Users/robertfradette/paid-media-dashboard/backend/data`
