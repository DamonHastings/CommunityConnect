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

      resources :users, only: [:show] do
        collection { get :search }
      end
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
        resources :referrals, only: [:index, :create]
      end
      resources :partner_connections, only: [:update, :destroy]
      resources :referrals, only: [:update]
      get "my/referrals", to: "my_referrals#index"

      resources :programs, only: [:index, :show, :update, :destroy] do
        resources :applications, controller: "program_applications", only: [:index, :create]
        resources :organizations, controller: "program_organizations", only: [:index, :create, :destroy]
        resources :cohorts, only: [:index, :create]
        resources :milestones, controller: "program_milestones", only: [:index, :create]
      end
      resources :program_applications, only: [:update, :destroy]
      get "my/program_applications", to: "my_program_applications#index"
      resources :cohorts, only: [:update, :destroy] do
        resources :memberships, controller: "cohort_memberships", only: [:create] do
          collection { delete ":user_id", to: "cohort_memberships#destroy" }
        end
      end
      resources :milestones, controller: "program_milestones", only: [:update, :destroy] do
        resources :completions, controller: "milestone_completions", only: [:create, :destroy]
      end
      get "my/tasks", to: "user_tasks#index"
      resources :tasks, controller: "user_tasks", only: [:create, :update, :destroy]
      resources :client_profiles do
        resources :applications, controller: "client_applications", only: [:index, :create]
      end
      resources :client_applications, only: [:update]

      resources :opportunities, controller: "engagement_opportunities", only: [:index, :show, :update, :destroy] do
        resources :applications, controller: "service_applications", only: [:index, :create]
        get "upcoming", to: "engagement_opportunities#upcoming"
      end
      resources :applications, controller: "service_applications", only: [:update, :destroy]
      get "my/applications", to: "my_applications#index"
      resources :my_applications, only: [] do
        resources :volunteer_hours, only: [:index, :create, :destroy]
      end
      resources :saved_organizations, only: [:index, :create, :destroy]
      resources :org_followers, only: [:create, :destroy], param: :organization_id
      resources :caseloads, only: [:index, :create, :update, :destroy]
      get "feed", to: "feed#index"
      post "demo/cleanup", to: "demo_cleanups#create" unless Rails.env.production?

      resources :notifications, only: [:index, :update] do
        collection do
          patch :read_all
        end
      end

      resources :conversations, only: [:index, :show, :create] do
        resources :messages, only: [:create]
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
