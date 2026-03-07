Rails.application.routes.default_url_options = {
  host: ENV.fetch("RAILS_HOST", "localhost"),
  port: ENV.fetch("RAILS_PORT", 3000),
  protocol: ENV.fetch("RAILS_PROTOCOL", "http")
}.compact_blank
