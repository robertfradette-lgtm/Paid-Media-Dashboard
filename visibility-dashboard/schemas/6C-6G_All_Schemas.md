# Vendor CSV Schemas (6C–6G)
# Paste column definitions into vendor tickets. Require exact headers in exports.

---

## 6C. SEMrush — Site Audit (CSV)

| column | type | description |
|--------|------|-------------|
| date | DATE | YYYY-MM-DD |
| project_id | STRING | e.g. BE_MAIN |
| site_health | NUMBER | 0–100 audit score |
| errors | INTEGER | Critical errors |
| warnings | INTEGER | Warnings |
| notices | INTEGER | Notices |
| core_web_vitals_pass_pct | NUMBER | CWV pass rate (0–100) |

---

## 6D. SEMrush — Backlinks (CSV)

| column | type | description |
|--------|------|-------------|
| date | DATE | YYYY-MM-DD |
| project_id | STRING | e.g. BE_MAIN |
| ref_domains | INTEGER | Referring domains count |
| total_backlinks | INTEGER | Total backlinks |
| high_value_links_added | INTEGER | Links from DA ≥ 40 (or your threshold) |

---

## 6E. SEMrush — AI Visibility (CSV)

| column | type | description |
|--------|------|-------------|
| date | DATE | YYYY-MM-DD |
| brand_domain | STRING | e.g. bobevans.com |
| platform | STRING | Google_AIO \| ChatGPT \| Perplexity |
| prompt | STRING | Query tested |
| dma | STRING | DMA or National |
| ai_visibility_score | NUMBER | 0–1 visibility |
| cited | BOOLEAN | Brand cited in answer |
| position_in_answer | INTEGER | Position when cited |
| sentiment | STRING | positive \| neutral \| negative |

---

## 6F. GA4 — Ecommerce Summary (CSV)
*(From BigQuery export or GA4 Data API with UTM breakdown)*

| column | type | description |
|--------|------|-------------|
| date | DATE | YYYY-MM-DD |
| dma | STRING | From geo or session |
| device | STRING | Mobile \| Desktop \| Tablet |
| sessions | INTEGER | Sessions |
| orders | INTEGER | Transactions/purchases |
| revenue | NUMBER | Total revenue |
| conversion_rate | NUMBER | Orders/Sessions |
| utm_source | STRING | google, etc. |
| utm_medium | STRING | organic_gbp, cpc, etc. |
| utm_campaign | STRING | gbp_store_OH123, etc. |

---

## 6G. POS — Store Sales (CSV) [Optional]
*(For order validation and store-level revenue)*

| column | type | description |
|--------|------|-------------|
| date | DATE | YYYY-MM-DD |
| location_id | STRING | Match SOCI location_id |
| net_sales | NUMBER | Store net sales |
| orders | INTEGER | Transaction count |
