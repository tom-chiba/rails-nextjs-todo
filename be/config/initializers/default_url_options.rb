Rails.application.routes.default_url_options = {
  host: ENV.fetch("HOST", "localhost"),
  port: Rails.env.development? ? ENV.fetch("PORT", 3000) : nil,
  protocol: Rails.env.production? ? "https" : "http"
}.compact_blank
