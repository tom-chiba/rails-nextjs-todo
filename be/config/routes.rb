Rails.application.routes.draw do
  if defined?(Rswag::Ui)
    mount Rswag::Ui::Engine => "/api-docs"
  end
  if defined?(Rswag::Api)
    mount Rswag::Api::Engine => "/api-docs"
  end

  namespace :api do
    namespace :v1 do
      resources :todos, only: [ :index, :create, :update, :destroy ]
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
