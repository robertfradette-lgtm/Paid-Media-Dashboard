# Local Pane Explore
# Joins SOCI/local data with delta for MoM/YoY

explore: local_pane {
  label: "Local / Maps"
  description: "GBP metrics, Local Pack share, listing accuracy, reputation"
  group_label: "Visibility"

  join: delta_local {
    type: left_outer
    sql_on: ${local_pane.date} = ${delta_local.date}
      AND (${local_pane.dma} = ${delta_local.dma} OR (${local_pane.dma} IS NULL AND ${delta_local.dma} IS NULL))
    relationship: one_to_one
  }
}
