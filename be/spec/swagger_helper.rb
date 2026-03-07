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
              image_url: { type: :string, nullable: true },
              created_at: { type: :string, format: "date-time" },
              updated_at: { type: :string, format: "date-time" }
            },
            required: %w[id text completed image_url created_at updated_at]
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
          AuthInput: {
            type: :object,
            properties: {
              email_address: { type: :string, format: "email" },
              password: { type: :string }
            },
            required: %w[email_address password]
          },
          RegistrationInput: {
            type: :object,
            properties: {
              email_address: { type: :string, format: "email" },
              password: { type: :string },
              password_confirmation: { type: :string }
            },
            required: %w[email_address password password_confirmation]
          },
          PasswordResetRequestInput: {
            type: :object,
            properties: {
              email_address: { type: :string, format: "email" }
            },
            required: %w[email_address]
          },
          PasswordResetInput: {
            type: :object,
            properties: {
              password: { type: :string },
              password_confirmation: { type: :string }
            },
            required: %w[password password_confirmation]
          },
          AuthResponse: {
            type: :object,
            properties: {
              email_address: { type: :string, format: "email" }
            },
            required: %w[email_address]
          },
          MeResponse: {
            type: :object,
            properties: {
              id: { type: :integer },
              email_address: { type: :string, format: "email" }
            },
            required: %w[id email_address]
          },
          MessageResponse: {
            type: :object,
            properties: {
              message: { type: :string }
            },
            required: %w[message]
          },
          BulkDeleteInput: {
            type: :object,
            properties: {
              ids: { type: :array, items: { type: :integer } }
            },
            required: %w[ids]
          },
          Error: {
            type: :object,
            properties: {
              error: { type: :string }
            },
            required: %w[error]
          },
          Errors: {
            type: :object,
            properties: {
              errors: { type: :object }
            },
            required: %w[errors]
          },
          ValidationErrors: {
            type: :object,
            properties: {
              errors: {
                type: :array,
                items: { type: :string }
              }
            },
            required: %w[errors]
          }
        }
      }
    }
  }

  config.openapi_format = :yaml
end
