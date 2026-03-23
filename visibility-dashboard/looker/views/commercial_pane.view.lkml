# Commercial (GA4/POS) - Pane D
view: commercial_pane {
  sql_table_name: visibility.ga4_ecommerce_daily ;;
  drill_fields: [detail*]

  dimension: date {
    type: time
    timeframes: [date, week, month, quarter, year]
    convert_tz: no
    datatype: date
  }

  dimension: dma { type: string; sql: ${TABLE}.dma ;; }
  dimension: device { type: string; sql: ${TABLE}.device ;; }
  dimension: utm_source { type: string; sql: ${TABLE}.utm_source ;; }
  dimension: utm_medium { type: string; sql: ${TABLE}.utm_medium ;; }
  dimension: utm_campaign { type: string; sql: ${TABLE}.utm_campaign ;; }

  dimension: attribution_channel {
    type: string
    sql: CASE
      WHEN ${TABLE}.utm_medium = 'organic_gbp' THEN 'GBP'
      WHEN ${TABLE}.utm_medium LIKE '%organic%' THEN 'Organic'
      WHEN ${TABLE}.utm_medium LIKE '%cpc%' OR ${TABLE}.utm_medium LIKE '%paid%' THEN 'Paid'
      ELSE 'Direct'
    END ;;
  }

  measure: sessions { type: sum; sql: ${TABLE}.sessions ;; format_string: "#,##0" }
  measure: orders { type: sum; sql: ${TABLE}.orders ;; format_string: "#,##0" }
  measure: revenue { type: sum; sql: ${TABLE}.revenue ;; format_string: "$#,##0" value_format_name: usd_0 }

  measure: conversion_rate {
    type: number
    sql: 100.0 * ${orders} / NULLIF(${sessions}, 0) ;;
    format_string: "0.00%"
    value_format_name: percent_2
  }
}
