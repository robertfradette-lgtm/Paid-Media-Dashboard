-- Visibility Dashboard: Organic Pane (SEMrush)
-- BigQuery SQL — run after loading SEMrush exports

-- 1) Position Tracking (create table from 6B schema)
-- 2) Share of Voice = AVG(visibility_percent) per keyword group
CREATE OR REPLACE VIEW `visibility.organic_sov` AS
SELECT
  date,
  project_id,
  keyword_group,
  dma,
  device,
  COUNT(DISTINCT keyword) AS keyword_count,
  AVG(visibility_percent) AS share_of_voice_pct,
  SUM(CASE WHEN position <= 3 THEN 1 ELSE 0 END) AS top3_keyword_count
FROM `visibility.semrush_position_tracking`
GROUP BY date, project_id, keyword_group, dma, device;

-- 3) Site Audit (create table from 6C schema)
-- site_health, errors, warnings, notices, core_web_vitals_pass_pct

-- 4) Backlinks (create table from 6D schema)
-- ref_domains, total_backlinks, high_value_links_added
