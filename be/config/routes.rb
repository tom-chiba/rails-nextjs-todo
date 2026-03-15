Rails.application.routes.draw do
  if defined?(Rswag::Ui)
    mount Rswag::Ui::Engine => "/api-docs"
  end
  if defined?(Rswag::Api)
    mount Rswag::Api::Engine => "/api-docs"
  end

  namespace :api do
    namespace :v1 do
      namespace :auth do
        post "sign_up", to: "registrations#create"
        post "sign_in", to: "sessions#create"
        delete "sign_out", to: "sessions#destroy"
        delete "account", to: "registrations#destroy"
        resources :passwords, param: :token, only: %i[create update]
      end

      resources :todos, only: [ :index, :create, :update, :destroy ] do
        delete :bulk_destroy, on: :collection
        resource :image, only: [ :destroy ], controller: "todo_images"
      end
      get "me", to: "me#show"
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
