# AI Pane Explore
# SEMrush AI Visibility

explore: ai_pane {
  label: "AI Visibility"
  description: "AI Share of Voice, prompts covered, sentiment"
  group_label: "Visibility"

  join: delta_ai {
    type: left_outer
    sql_on: ${ai_pane.date} = ${delta_ai.date}
      AND (${ai_pane.dma} = ${delta_ai.dma} OR (${ai_pane.dma} IS NULL AND ${delta_ai.dma} IS NULL))
      AND (${ai_pane.platform} = ${delta_ai.platform} OR (${ai_pane.platform} IS NULL AND ${delta_ai.platform} IS NULL))
    relationship: one_to_one
  }
}
