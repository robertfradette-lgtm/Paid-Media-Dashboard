# Organic Pane Explore
# SEMrush Position Tracking, Site Audit, Backlinks

explore: organic_pane {
  label: "Organic / Technical"
  description: "Share of Voice, Top-3 keywords, Site Health, Authority"
  group_label: "Visibility"

  join: delta_organic {
    type: left_outer
    sql_on: ${organic_pane.date} = ${delta_organic.date}
      AND (${organic_pane.dma} = ${delta_organic.dma} OR (${organic_pane.dma} IS NULL AND ${delta_organic.dma} IS NULL))
      AND (${organic_pane.device} = ${delta_organic.device} OR (${organic_pane.device} IS NULL AND ${delta_organic.device} IS NULL))
    relationship: one_to_one
  }
}
