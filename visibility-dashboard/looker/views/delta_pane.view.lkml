# Delta / Period comparison - MoM, YoY
view: delta_local {
  sql_table_name: visibility.local_pack_share_delta ;;
  drill_fields: [detail*]

  dimension: date { type: date; sql: ${TABLE}.date ;; }
  dimension: dma { type: string; sql: ${TABLE}.dma ;; }
  dimension: device { type: string; sql: ${TABLE}.device ;; }

  measure: local_pack_share_pct { type: sum; sql: ${TABLE}.local_pack_share_pct ;;
    format_string: "0.0%" }
  measure: local_pack_share_mom_delta { type: sum; sql: ${TABLE}.mom_delta_pct ;;
    format_string: "+0.0%;-0.0%;0.0%" }
  measure: local_pack_share_yoy_delta { type: sum; sql: ${TABLE}.yoy_delta_pct ;;
    format_string: "+0.0%;-0.0%;0.0%" }
}

view: delta_commercial {
  sql_table_name: visibility.ga4_ecommerce_delta ;;
  drill_fields: [detail*]

  dimension: date { type: date; sql: ${TABLE}.date ;; }
  dimension: dma { type: string; sql: ${TABLE}.dma ;; }

  measure: conversion_rate { type: sum; sql: ${TABLE}.conversion_rate ;; format_string: "0.00%" }
  measure: conversion_mom_delta { type: sum; sql: ${TABLE}.mom_delta_pp ;; format_string: "+0.00;-0.00;0.00" }
  measure: conversion_yoy_delta { type: sum; sql: ${TABLE}.yoy_delta_pp ;; format_string: "+0.00;-0.00;0.00" }
  measure: revenue { type: sum; sql: ${TABLE}.revenue ;; format_string: "$#,##0" }
  measure: orders { type: sum; sql: ${TABLE}.orders ;; format_string: "#,##0" }
}
