# Visibility Dashboard - Looker Project
# Connects to BigQuery; requires views from sql/ folder to be deployed first.

project_name: "visibility_dashboard"
allowed_db_connections: ["bigquery"]
max_connections_per_model: 5

# Uncomment to enable datagroups for caching
# datagroup: visibility_default {
#   sql_trigger: SELECT MAX(date) FROM `{{ project }}.visibility.soci_local` ;;
#   max_cache_age: "1 hour"
# }
