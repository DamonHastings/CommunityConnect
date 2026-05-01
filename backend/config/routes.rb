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

      resources :organizations do
        member do
          post :members, to: "organizations/memberships#create"
          delete "members/:user_id", to: "organizations/memberships#destroy"
        end
        resources :opportunities, controller: "engagement_opportunities", only: [:index, :create]
      end

      resources :opportunities, controller: "engagement_opportunities", only: [:index, :show, :update, :destroy]
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
