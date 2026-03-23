# Omnichannel Visibility Dashboard - LookML Dashboard
# One page, 4 panes: Local, Organic, AI, Commercial
# Filters: DMA, Date Range (Month/QTD/YTD), Device

- dashboard: omnichannel_visibility
  title: Omnichannel Visibility Dashboard
  layout: newspaper
  preferred_viewer: dashboards-next
  description: One-page visibility dashboard with Local, Organic, AI, Commercial panes. DMA, date, device filters.

  # Filters (top row)
  filters:
  - name: dma
    title: DMA
    type: list_filter
    default_value: all
    allow_multiple_values: true
    required: false

  - name: date_range
    title: Date Range
    type: date_filter
    default_value: 30 days
    allow_multiple_values: false
    required: true

  - name: device
    title: Device
    type: list_filter
    default_value: all
    allow_multiple_values: true
    required: false

  # Elements - Scorecards (top row)
  elements:
  - name: local_pack_share
    title: Local Pack Share (% Top-3)
    model: visibility
    explore: local_pane
    type: look
    # Look reference would point to saved look with Local Pack Share measure

  - name: sov
    title: Share of Voice
    model: visibility
    explore: organic_pane
    type: look

  - name: ai_sov
    title: AI Share of Voice
    model: visibility
    explore: ai_pane
    type: look

  - name: conversion_rate
    title: Conversion Rate (%)
    model: visibility
    explore: commercial_pane
    type: look

  # Additional elements: add looks/tiles for each pane's visualizations
  # Pane A: Local — GBP Actions trend, Listing Accuracy, Reputation
  # Pane B: Organic — SoV trend, Top-3 Count, Site Health, Authority
  # Pane C: AI — AI SOV by platform, Prompts Covered, Sentiment
  # Pane D: Commercial — Orders/Revenue by DMA, Attribution view, Delta
