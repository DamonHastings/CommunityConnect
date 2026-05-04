Rails.application.routes.draw do
  devise_for :users,
    path: "api/v1/auth",
    path_names: {
      sign_in: "login",
      sign_out: "logout",
      registration: "register"
    },
    controllers: {
      sessions: "api/v1/auth/sessions",
      registrations: "api/v1/auth/registrations"
    }

  namespace :api do
    namespace :v1 do
      get "auth/me", to: "auth/profiles#show" 
      patch "auth/me", to: "auth/profiles#update"

      get "intake", to: "intake_responses#show"
      post "intake", to: "intake_responses#upsert"
      patch "intake", to: "intake_responses#upsert"

      get "matches", to: "matches#show"

      resources :users, only: [:show]
      get 'professionals', to: 'professionals#index'

      resources :organizations do
        member do
          post :members, to: "organizations/memberships#create"
          delete "members/:user_id", to: "organizations/memberships#destroy"
        end
        resources :opportunities, controller: "engagement_opportunities", only: [:index, :create]
        resources :programs, only: [:index, :create]
        resources :announcements, only: [:index, :create, :destroy]
        resources :partner_connections, only: [:index, :create]
      end
      resources :partner_connections, only: [:update, :destroy]

      resources :programs, only: [:index, :show, :update, :destroy] do
        resources :applications, controller: "program_applications", only: [:index, :create]
      end
      resources :program_applications, only: [:update, :destroy]
      get "my/program_applications", to: "my_program_applications#index"

      resources :opportunities, controller: "engagement_opportunities", only: [:index, :show, :update, :destroy] do
        resources :applications, controller: "service_applications", only: [:index, :create]
        get "upcoming", to: "engagement_opportunities#upcoming"
      end
      resources :applications, controller: "service_applications", only: [:update, :destroy]
      get "my/applications", to: "my_applications#index"
      resources :saved_organizations, only: [:index, :create, :destroy]
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
