# Power BI Data Model Design

## Tables

| Table | Source | Key | Description |
|-------|--------|-----|-------------|
| soci_local | SOCI CSV | date, location_id, dma | GBP metrics |
| semrush_position | SEMrush CSV | date, project_id, keyword, dma, device | Position tracking |
| semrush_audit | SEMrush CSV | date, project_id | Site audit |
| semrush_backlinks | SEMrush CSV | date, project_id | Backlinks |
| semrush_ai | SEMrush CSV | date, brand_domain, platform, prompt, dma | AI visibility |
| ga4_ecommerce | GA4 CSV | date, dma, device, utm_campaign | Sessions, orders, revenue |
| pos_sales | POS CSV (opt) | date, location_id | Store sales |
| Date | Calendar | Date | Date dimension |
| DMA | Slicer | DMA | DMA dimension |
| Device | Slicer | Device | All / Mobile / Desktop |

## Relationships

```
Date[Date] ----- 1:* ----- soci_local[date]
Date[Date] ----- 1:* ----- semrush_position[date]
Date[Date] ----- 1:* ----- semrush_audit[date]
Date[Date] ----- 1:* ----- semrush_backlinks[date]
Date[Date] ----- 1:* ----- semrush_ai[date]
Date[Date] ----- 1:* ----- ga4_ecommerce[date]
Date[Date] ----- 1:* ----- pos_sales[date]

DMA (role-playing or shared) — filter dimension for DMA slicer
Device — filter dimension for Device slicer
```

No direct foreign keys between SOCI/SEMrush/GA4; they join via Date + DMA in the same report context.

## Create Date Dimension

```dax
Date = 
ADDCOLUMNS(
    CALENDAR(DATE(2024,1,1), DATE(2026,12,31)),
    "Year", YEAR([Date]),
    "Month", MONTH([Date]),
    "MonthName", FORMAT([Date], "MMMM"),
    "Quarter", "Q" & QUARTER([Date]),
    "MonthEnd", EOMONTH([Date], 0),
    "IsMTD", IF([Date] <= TODAY(), 1, 0)
)
```

## Report Layout (One Page)

1. **Top filters**: DMA (dropdown), Date range (slicer), Device (dropdown)
2. **Scorecards**: Local Pack Share %, SoV, AI SOV, Conversion Rate %
3. **Pane A — Local**: Trend line (Local Pack Share), table (Calls, Directions, Website Clicks by DMA), Listing Accuracy
4. **Pane B — Organic**: SoV trend, Top-3 keyword count, Site Health, Referring Domains
5. **Pane C — AI**: AI SOV by platform, Prompts Covered, Sentiment %
6. **Pane D — Commercial**: Conversion Rate, Orders, Revenue by DMA; Attribution by UTM
7. **Delta chips**: MoM and YoY for headline KPIs
