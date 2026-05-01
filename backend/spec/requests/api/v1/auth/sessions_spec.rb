require 'rails_helper'

RSpec.describe "Auth Sessions", type: :request do
  let(:headers) { { "Content-Type" => "application/json" } }
  let!(:user)   { create(:user, email: "user@example.com", password: "password123") }

  describe "POST /api/v1/auth/login" do
    context "with valid credentials" do
      before do
        post "/api/v1/auth/login",
          params: { user: { email: "user@example.com", password: "password123" } }.to_json,
          headers: headers
      end

      it "returns 200" do
        expect(response).to have_http_status(:ok)
      end

      it "returns the user data" do
        expect(json[:user][:email]).to eq("user@example.com")
      end

      it "returns a JWT in the Authorization header" do
        expect(response.headers["Authorization"]).to be_present
      end
    end

    context "with invalid credentials" do
      it "returns 401" do
        post "/api/v1/auth/login",
          params: { user: { email: "user@example.com", password: "wrong" } }.to_json,
          headers: headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    it "returns 200" do
      token_headers = auth_headers_for(user)
      delete "/api/v1/auth/logout", headers: token_headers
      expect(response).to have_http_status(:ok)
    end
  end
end
