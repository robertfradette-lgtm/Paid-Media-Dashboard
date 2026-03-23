-- Visibility Dashboard: AI Pane (SEMrush AI Toolkit)
-- BigQuery SQL — run after loading SEMrush AI Visibility export (6E schema)

-- 1) AI Share of Voice by platform & DMA
CREATE OR REPLACE VIEW `visibility.ai_sov` AS
SELECT
  date,
  brand_domain,
  platform,
  dma,
  COUNT(DISTINCT prompt) AS prompts_tracked,
  SUM(CASE WHEN cited = TRUE THEN 1 ELSE 0 END) AS prompts_covered,
  AVG(CASE WHEN cited = TRUE THEN ai_visibility_score ELSE 0 END) AS ai_visibility_score
FROM `visibility.semrush_ai_visibility`
GROUP BY date, brand_domain, platform, dma;

-- 2) AI Sentiment distribution
CREATE OR REPLACE VIEW `visibility.ai_sentiment` AS
SELECT
  date,
  brand_domain,
  platform,
  dma,
  sentiment,
  COUNT(*) AS mention_count
FROM `visibility.semrush_ai_visibility`
WHERE cited = TRUE
GROUP BY date, brand_domain, platform, dma, sentiment;
