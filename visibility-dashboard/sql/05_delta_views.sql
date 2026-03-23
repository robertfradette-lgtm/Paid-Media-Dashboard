-- Visibility Dashboard: MoM & YoY delta calculations
-- Use for delta chips on dashboard (compare to prior month / prior year)

-- Local Pack Share MoM/YoY
CREATE OR REPLACE VIEW `visibility.local_pack_share_delta` AS
WITH base AS (
  SELECT month, dma, AVG(local_pack_share_pct) AS avg_share
  FROM (
    SELECT DATE_TRUNC(date, MONTH) AS month, dma, local_pack_share_pct
    FROM `visibility.local_pack_share`
  )
  GROUP BY month, dma
),
prev_month AS (SELECT month, dma, avg_share AS prev_month_share FROM base),
prev_year AS (SELECT month, dma, avg_share AS prev_year_share FROM base)
SELECT
  curr.month,
  curr.dma,
  curr.avg_share,
  curr.avg_share - pm.prev_month_share AS mom_delta_pp,
  curr.avg_share - py.prev_year_share AS yoy_delta_pp
FROM base curr
LEFT JOIN prev_month pm ON curr.dma = pm.dma AND pm.month = DATE_SUB(curr.month, INTERVAL 1 MONTH)
LEFT JOIN prev_year py ON curr.dma = py.dma AND py.month = DATE_SUB(curr.month, INTERVAL 1 YEAR);
