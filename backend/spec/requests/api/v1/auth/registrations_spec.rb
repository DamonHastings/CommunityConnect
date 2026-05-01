require 'rails_helper'

RSpec.describe "POST /api/v1/auth/register", type: :request do
  let(:headers) { { "Content-Type" => "application/json" } }

  def post_register(params)
    post "/api/v1/auth/register", params: params.to_json, headers: headers
  end

  context "with valid params" do
    let(:params) do
      {
        user: {
          email: "ada@example.com",
          password: "password123",
          password_confirmation: "password123",
          first_name: "Ada",
          last_name: "Lovelace"
        }
      }
    end

    it "returns 201" do
      post_register(params)
      expect(response).to have_http_status(:created)
    end

    it "creates a user" do
      expect { post_register(params) }.to change(User, :count).by(1)
    end

    it "returns the user data" do
      post_register(params)
      expect(json[:user][:email]).to eq("ada@example.com")
      expect(json[:user][:first_name]).to eq("Ada")
    end

    it "returns a JWT in the Authorization header" do
      post_register(params)
      expect(response.headers["Authorization"]).to be_present
    end
  end

  context "with a duplicate email" do
    it "returns 422" do
      create(:user, email: "taken@example.com")
      post_register(user: { email: "taken@example.com", password: "password123",
        password_confirmation: "password123", first_name: "A", last_name: "B" })
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  context "with missing required fields" do
    it "returns 422 when first_name is missing" do
      post_register(user: { email: "x@example.com", password: "password123",
        password_confirmation: "password123", last_name: "Smith" })
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
