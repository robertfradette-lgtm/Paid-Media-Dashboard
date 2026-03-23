// Power Query M - Visibility Dashboard Data Sources
// Use as "Get Data > Blank Query" or add to Dataflow
// Adapt connection strings and paths to your storage (SharePoint, Azure Blob, local CSV)

// ============================================================
// 1. SOCI — Local (CSV from vendor)
// ============================================================
let
    Source = Csv.Document(File.Contents("C:\Data\visibility\soci_local.csv"),[Delimiter=",", Columns=22, Encoding=65001]),
    PromoteHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    ChangeTypes = Table.TransformColumnTypes(PromoteHeaders,{
        {"date", type date},
        {"location_id", type text},
        {"store_name", type text},
        {"dma", type text},
        {"city", type text},
        {"state", type text},
        {"gbp_cid", type text},
        {"local_impressions", Int64.Type},
        {"top3_impressions", Int64.Type},
        {"calls", Int64.Type},
        {"directions", Int64.Type},
        {"website_clicks", Int64.Type},
        {"hours_ok", type logical},
        {"holiday_hours_set", type logical},
        {"categories_count", Int64.Type},
        {"attributes_count", Int64.Type},
        {"menu_url_present", type logical},
        {"utm_present", type logical},
        {"photos_last30d", Int64.Type},
        {"avg_rating", type number},
        {"new_reviews", Int64.Type},
        {"response_time_hours", Int64.Type}
    })
in
    ChangeTypes

// ============================================================
// 2. SEMrush — Position Tracking
// ============================================================
let
    Source = Csv.Document(File.Contents("C:\Data\visibility\semrush_position.csv"),[Delimiter=",", Columns=9, Encoding=65001]),
    PromoteHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    ChangeTypes = Table.TransformColumnTypes(PromoteHeaders,{
        {"date", type date},
        {"project_id", type text},
        {"keyword", type text},
        {"keyword_group", type text},
        {"dma", type text},
        {"device", type text},
        {"position", Int64.Type},
        {"visibility_percent", type number},
        {"ranking_url", type text}
    })
in
    ChangeTypes

// ============================================================
// 3. SEMrush — Site Audit
// ============================================================
let
    Source = Csv.Document(File.Contents("C:\Data\visibility\semrush_audit.csv"),[Delimiter=",", Columns=6, Encoding=65001]),
    PromoteHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    ChangeTypes = Table.TransformColumnTypes(PromoteHeaders,{
        {"date", type date},
        {"project_id", type text},
        {"site_health", Int64.Type},
        {"errors", Int64.Type},
        {"warnings", Int64.Type},
        {"notices", Int64.Type},
        {"core_web_vitals_pass_pct", Int64.Type}
    })
in
    ChangeTypes

// ============================================================
// 4. SEMrush — Backlinks
// ============================================================
let
    Source = Csv.Document(File.Contents("C:\Data\visibility\semrush_backlinks.csv"),[Delimiter=",", Columns=5, Encoding=65001]),
    PromoteHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    ChangeTypes = Table.TransformColumnTypes(PromoteHeaders,{
        {"date", type date},
        {"project_id", type text},
        {"ref_domains", Int64.Type},
        {"total_backlinks", Int64.Type},
        {"high_value_links_added", Int64.Type}
    })
in
    ChangeTypes

// ============================================================
// 5. SEMrush — AI Visibility
// ============================================================
let
    Source = Csv.Document(File.Contents("C:\Data\visibility\semrush_ai.csv"),[Delimiter=",", Columns=9, Encoding=65001]),
    PromoteHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    ChangeTypes = Table.TransformColumnTypes(PromoteHeaders,{
        {"date", type date},
        {"brand_domain", type text},
        {"platform", type text},
        {"prompt", type text},
        {"dma", type text},
        {"ai_visibility_score", type number},
        {"cited", type logical},
        {"position_in_answer", Int64.Type},
        {"sentiment", type text}
    })
in
    ChangeTypes

// ============================================================
// 6. GA4 — Ecommerce Summary
// ============================================================
let
    Source = Csv.Document(File.Contents("C:\Data\visibility\ga4_ecommerce.csv"),[Delimiter=",", Columns=9, Encoding=65001]),
    PromoteHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    ChangeTypes = Table.TransformColumnTypes(PromoteHeaders,{
        {"date", type date},
        {"dma", type text},
        {"device", type text},
        {"sessions", Int64.Type},
        {"orders", Int64.Type},
        {"revenue", type number},
        {"conversion_rate", type number},
        {"utm_source", type text},
        {"utm_medium", type text},
        {"utm_campaign", type text}
    })
in
    ChangeTypes

// ============================================================
// 7. POS (optional)
// ============================================================
let
    Source = Csv.Document(File.Contents("C:\Data\visibility\pos_sales.csv"),[Delimiter=",", Columns=4, Encoding=65001]),
    PromoteHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    ChangeTypes = Table.TransformColumnTypes(PromoteHeaders,{
        {"date", type date},
        {"location_id", type text},
        {"net_sales", type number},
        {"orders", Int64.Type}
    })
in
    ChangeTypes
