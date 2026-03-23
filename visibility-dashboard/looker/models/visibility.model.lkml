# Visibility Dashboard - Central Model
# Join Local, Organic, AI, Commercial via DMA and Date.

connection: "bigquery"

include: "/views/**/*.view.lkml"
include: "/explores/**/*.explore.lkml"

# Datagroups for caching (optional)
# persist_with: visibility_default
