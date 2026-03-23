# Organic / Technical (SEMrush) - Pane B
view: organic_pane {
  sql_table_name: visibility.organic_sov_daily ;;
  drill_fields: [detail*]

  dimension: date {
    type: time
    timeframes: [date, week, month, quarter, year]
    convert_tz: no
    datatype: date
  }

  dimension: project_id { type: string; sql: ${TABLE}.project_id ;; }
  dimension: keyword { type: string; sql: ${TABLE}.keyword ;; }
  dimension: keyword_group { type: string; sql: ${TABLE}.keyword_group ;; }
  dimension: dma { type: string; sql: ${TABLE}.dma ;; }
  dimension: device { type: string; sql: ${TABLE}.device ;; }
  dimension: ranking_url { type: string; sql: ${TABLE}.ranking_url ;; }

  measure: sov_avg {
    type: average
    sql: ${TABLE}.visibility_percent ;;
    format_string: "0.0"
    value_format_name: decimal_1
    description: "Share of Voice (average visibility % across keyword set)"
  }

  measure: top3_keyword_count {
    type: count
    sql: ${TABLE}.keyword ;;
    filters: [position: "1-3"]
    format_string: "#,##0"
  }

  measure: count_distinct_keywords {
    type: count_distinct
    sql: ${TABLE}.keyword ;;
    format_string: "#,##0"
  }
}

view: organic_audit_pane {
  sql_table_name: visibility.organic_audit_daily ;;
  drill_fields: [detail*]

  dimension: date {
    type: time
    timeframes: [date, week, month, quarter, year]
    convert_tz: no
    datatype: date
  }

  dimension: project_id { type: string; sql: ${TABLE}.project_id ;; }
  dimension: dma { type: string; sql: ${TABLE}.dma ;; }

  dimension: position {
    type: number
    sql: ${TABLE}.position ;;
    value_format_name: decimal_0
  }

  dimension_group: position_filter {
    type: string
    sql: CASE WHEN ${TABLE}.position BETWEEN 1 AND 3 THEN '1-3' ELSE '4+' END ;;
    html: ""
  }

  measure: site_health_avg {
    type: average
    sql: ${TABLE}.site_health ;;
    format_string: "0"
  }

  measure: errors_sum { type: sum; sql: ${TABLE}.errors ;; }
  measure: warnings_sum { type: sum; sql: ${TABLE}.warnings ;; }
}

view: organic_backlinks_pane {
  sql_table_name: visibility.organic_backlinks_daily ;;
  drill_fields: [detail*]

  dimension: date {
    type: time
    timeframes: [date, week, month, quarter, year]
    convert_tz: no
    datatype: date
  }

  dimension: project_id { type: string; sql: ${TABLE}.project_id ;; }
  dimension: dma { type: string; sql: ${TABLE}.dma ;; }

  measure: ref_domains { type: sum; sql: ${TABLE}.ref_domains ;; }
  measure: total_backlinks { type: sum; sql: ${TABLE}.total_backlinks ;; }
  measure: high_value_links_added { type: sum; sql: ${TABLE}.high_value_links_added ;; }
}
