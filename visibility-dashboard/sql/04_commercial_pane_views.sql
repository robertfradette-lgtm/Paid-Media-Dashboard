-- Visibility Dashboard: Commercial Pane (GA4)
-- BigQuery SQL — run after GA4 BigQuery export or loading GA4 summary CSV (6F schema)

-- 1) Conversion Rate, Orders, Revenue by attribution
CREATE OR REPLACE VIEW `visibility.commercial_summary` AS
SELECT
  date,
  dma,
  device,
  utm_source,
  utm_medium,
  utm_campaign,
  sessions,
  orders,
  revenue,
  SAFE_DIVIDE(orders, NULLIF(sessions, 0)) * 100 AS conversion_rate_pct
FROM `visibility.ga4_ecommerce`;

-- 2) DMA rollup (top 10 DMAs)
CREATE OR REPLACE VIEW `visibility.commercial_by_dma` AS
SELECT
  date,
  dma,
  SUM(sessions) AS sessions,
  SUM(orders) AS orders,
  SUM(revenue) AS revenue,
  SAFE_DIVIDE(SUM(orders), NULLIF(SUM(sessions), 0)) * 100 AS conversion_rate_pct
FROM `visibility.ga4_ecommerce`
GROUP BY date, dma;
