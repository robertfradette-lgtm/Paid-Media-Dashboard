# Local / Maps (SOCI) - Pane A
view: local_pane {
  sql_table_name: visibility.local_pack_share_daily ;;
  drill_fields: [detail*]

  dimension: date {
    type: time
    timeframes: [date, week, month, quarter, year]
    convert_tz: no
    datatype: date
    description: "Report date"
  }

  dimension: location_id { type: string; sql: ${TABLE}.location_id ;; }
  dimension: store_name { type: string; sql: ${TABLE}.store_name ;; }
  dimension: dma { type: string; sql: ${TABLE}.dma ;; }
  dimension: city { type: string; sql: ${TABLE}.city ;; }
  dimension: state { type: string; sql: ${TABLE}.state ;; }
  dimension: device { type: string; sql: ${TABLE}.device ;; }

  measure: total_local_impressions {
    type: sum
    sql: ${TABLE}.local_impressions ;;
    format_string: "#,##0"
    value_format_name: decimal_0
  }

  measure: total_top3_impressions {
    type: sum
    sql: ${TABLE}.top3_impressions ;;
    format_string: "#,##0"
  }

  measure: local_pack_share_pct {
    type: number
    sql: 100.0 * ${total_top3_impressions} / NULLIF(${total_local_impressions}, 0) ;;
    format_string: "0.0%"
    value_format_name: percent_1
    description: "Top-3 Impressions / Total Local Impressions (Local Pack Share)"
  }

  measure: calls { type: sum; sql: ${TABLE}.calls ;; format_string: "#,##0" }
  measure: directions { type: sum; sql: ${TABLE}.directions ;; format_string: "#,##0" }
  measure: website_clicks { type: sum; sql: ${TABLE}.website_clicks ;; format_string: "#,##0" }

  measure: listing_accuracy_avg {
    type: average
    sql: ${TABLE}.listing_accuracy_index ;;
    format_string: "0.0"
    value_format_name: decimal_1
  }

  measure: avg_rating { type: average; sql: ${TABLE}.avg_rating ;; format_string: "0.00" }
  measure: new_reviews { type: sum; sql: ${TABLE}.new_reviews ;; format_string: "#,##0" }
  measure: response_time_median {
    type: median
    sql: ${TABLE}.response_time_hours ;;
    format_string: "0"
    value_format_name: decimal_0
  }
}
