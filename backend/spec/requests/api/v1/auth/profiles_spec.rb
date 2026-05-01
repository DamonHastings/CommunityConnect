require 'rails_helper'

RSpec.describe "GET /api/v1/auth/me", type: :request do
  let!(:user) { create(:user) }

  context "when authenticated" do
    it "returns the current user's profile" do
      get "/api/v1/auth/me", headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      expect(json[:user][:email]).to eq(user.email)
    end
  end

  context "when unauthenticated" do
    it "returns 401" do
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
