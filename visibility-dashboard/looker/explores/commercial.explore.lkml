# Commercial Pane Explore
# GA4 + optional POS

explore: commercial_pane {
  label: "Commercial"
  description: "Conversion rate, orders, revenue, attribution"
  group_label: "Visibility"

  join: delta_commercial {
    type: left_outer
    sql_on: ${commercial_pane.date} = ${delta_commercial.date}
      AND (${commercial_pane.dma} = ${delta_commercial.dma} OR (${commercial_pane.dma} IS NULL AND ${delta_commercial.dma} IS NULL))
      AND (${commercial_pane.device} = ${delta_commercial.device} OR (${commercial_pane.device} IS NULL AND ${delta_commercial.device} IS NULL))
      AND (${commercial_pane.utm_source} = ${delta_commercial.utm_source} OR (${commercial_pane.utm_source} IS NULL AND ${delta_commercial.utm_source} IS NULL))
    relationship: one_to_one
  }
}
