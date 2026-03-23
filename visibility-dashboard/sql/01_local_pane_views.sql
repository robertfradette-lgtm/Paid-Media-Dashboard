-- Visibility Dashboard: Local Pane (SOCI / GBP)
-- BigQuery SQL — run after loading SOCI CSV into bigquery.soci_local table

-- 1) Raw SOCI table (create via load job or external table)
-- Columns: date, location_id, store_name, dma, city, state, gbp_cid, local_impressions,
--          top3_impressions, calls, directions, website_clicks, hours_ok, holiday_hours_set,
--          categories_count, attributes_count, menu_url_present, utm_present, photos_last30d,
--          avg_rating, new_reviews, response_time_hours

-- 2) Local Pack Share (% Top-3 Impressions)
CREATE OR REPLACE VIEW `visibility.local_pack_share` AS
SELECT
  date,
  dma,
  location_id,
  store_name,
  city,
  state,
  local_impressions AS total_local_impressions,
  top3_impressions,
  SAFE_DIVIDE(top3_impressions, NULLIF(local_impressions, 0)) * 100 AS local_pack_share_pct
FROM `visibility.soci_local`;

-- 3) Listing Accuracy Index (0–100) = 0.4*hours + 0.3*categories + 0.2*menu_utm + 0.1*media
CREATE OR REPLACE VIEW `visibility.listing_accuracy_index` AS
SELECT
  date,
  dma,
  location_id,
  store_name,
  (COALESCE(IF(hours_ok = TRUE, 1, 0), 0) * 0.4 +
   COALESCE(IF(holiday_hours_set = TRUE, 1, 0), 0) * 0.2 +
   LEAST(1, COALESCE(categories_count, 0) / 3.0) * 0.15 +
   LEAST(1, COALESCE(attributes_count, 0) / 12.0) * 0.15 +
   COALESCE(IF(menu_url_present = TRUE, 0.1, 0), 0) +
   COALESCE(IF(utm_present = TRUE, 0.1, 0), 0) +
   LEAST(1, COALESCE(photos_last30d, 0) / 8.0) * 0.1) * 100 AS listing_accuracy_index
FROM `visibility.soci_local`;

-- 4) GBP Actions rollup (Calls, Directions, Website Clicks by month)
CREATE OR REPLACE VIEW `visibility.gbp_actions_monthly` AS
SELECT
  DATE_TRUNC(date, MONTH) AS month,
  dma,
  location_id,
  store_name,
  SUM(calls) AS total_calls,
  SUM(directions) AS total_directions,
  SUM(website_clicks) AS total_website_clicks
FROM `visibility.soci_local`
GROUP BY 1, 2, 3, 4;

-- 5) Reputation metrics
CREATE OR REPLACE VIEW `visibility.reputation` AS
SELECT
  date,
  dma,
  location_id,
  store_name,
  avg_rating,
  new_reviews,
  response_time_hours,
  CASE WHEN response_time_hours <= 48 THEN 'OK' ELSE 'Over SLA' END AS response_sla_status
FROM `visibility.soci_local`;
