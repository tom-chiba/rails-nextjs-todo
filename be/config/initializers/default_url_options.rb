Rails.application.routes.default_url_options = {
  host: ENV.fetch("RAILS_HOST", "localhost"),
  port: ENV.fetch("RAILS_PORT", nil),
  protocol: ENV.fetch("RAILS_PROTOCOL", "http")
}.compact_blank
