# AI Visibility (SEMrush AI Toolkit) - Pane C
view: ai_pane {
  sql_table_name: visibility.ai_visibility_daily ;;
  drill_fields: [detail*]

  dimension: date {
    type: time
    timeframes: [date, week, month, quarter, year]
    convert_tz: no
    datatype: date
  }

  dimension: brand_domain { type: string; sql: ${TABLE}.brand_domain ;; }
  dimension: platform { type: string; sql: ${TABLE}.platform ;; }
  dimension: prompt { type: string; sql: ${TABLE}.prompt ;; }
  dimension: dma { type: string; sql: ${TABLE}.dma ;; }

  dimension: cited {
    type: yesno
    sql: ${TABLE}.cited ;;
  }

  dimension: sentiment {
    type: string
    sql: ${TABLE}.sentiment ;;
  }

  measure: ai_sov_avg {
    type: average
    sql: ${TABLE}.ai_visibility_score ;;
    format_string: "0.00"
    value_format_name: decimal_2
    description: "AI Share of Voice"
  }

  measure: prompts_covered {
    type: count
    sql: ${TABLE}.prompt ;;
    filters: [cited: "Yes"]
    format_string: "#,##0"
  }

  measure: prompts_total {
    type: count
    sql: ${TABLE}.prompt ;;
    format_string: "#,##0"
  }

  measure: sentiment_positive_pct {
    type: number
    sql: 100.0 * SUM(CASE WHEN ${TABLE}.sentiment = 'positive' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) ;;
    format_string: "0.0%"
  }

  measure: sentiment_neutral_pct {
    type: number
    sql: 100.0 * SUM(CASE WHEN ${TABLE}.sentiment = 'neutral' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) ;;
    format_string: "0.0%"
  }

  measure: sentiment_negative_pct {
    type: number
    sql: 100.0 * SUM(CASE WHEN ${TABLE}.sentiment = 'negative' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) ;;
    format_string: "0.0%"
  }
}
