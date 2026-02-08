require "rails_helper"

RSpec.configure do |config|
  config.openapi_root = Rails.root.to_s + "/swagger"

  config.openapi_specs = {
    "v1/swagger.yaml" => {
      openapi: "3.0.1",
      info: {
        title: "Todo API V1",
        version: "v1"
      },
      paths: {},
      servers: [
        { url: "http://localhost:3000", description: "Development server" }
      ],
      components: {
        schemas: {
          Todo: {
            type: :object,
            properties: {
              id: { type: :integer },
              text: { type: :string },
              completed: { type: :boolean },
              created_at: { type: :string, format: "date-time" },
              updated_at: { type: :string, format: "date-time" }
            },
            required: %w[id text completed created_at updated_at]
          },
          TodoInput: {
            type: :object,
            properties: {
              todo: {
                type: :object,
                properties: {
                  text: { type: :string },
                  completed: { type: :boolean }
                }
              }
            },
            required: %w[todo]
          },
          Errors: {
            type: :object,
            properties: {
              errors: { type: :object }
            },
            required: %w[errors]
          }
        }
      }
    }
  }

  config.openapi_format = :yaml
end
