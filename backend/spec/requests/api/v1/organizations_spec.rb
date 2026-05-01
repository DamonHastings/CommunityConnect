require 'rails_helper'

RSpec.describe "Organizations API", type: :request do
  let!(:user) { create(:user) }

  describe "GET /api/v1/organizations" do
    let!(:org1) { create(:organization, name: "Health Heroes",    category: :healthcare, city: "Portland", state: "OR") }
    let!(:org2) { create(:organization, name: "Youth Mentors",    category: :education,  city: "Portland", state: "OR") }
    let!(:org3) { create(:organization, name: "Health Alliance",  category: :healthcare, city: "Seattle",  state: "WA") }

    it "returns all organizations with pagination meta" do
      get "/api/v1/organizations"
      expect(response).to have_http_status(:ok)
      expect(json[:organizations].length).to eq(3)
      expect(json[:meta]).to include(:current_page, :total_pages, :total_count, :per_page)
    end

    it "filters by category" do
      get "/api/v1/organizations", params: { category: "healthcare" }
      names = json[:organizations].map { |o| o[:name] }
      expect(names).to contain_exactly("Health Heroes", "Health Alliance")
    end

    it "filters by city" do
      get "/api/v1/organizations", params: { city: "Portland" }
      expect(json[:organizations].length).to eq(2)
    end

    it "filters by state" do
      get "/api/v1/organizations", params: { state: "WA" }
      expect(json[:organizations].map { |o| o[:name] }).to eq(["Health Alliance"])
    end

    it "searches by text" do
      get "/api/v1/organizations", params: { q: "health" }
      names = json[:organizations].map { |o| o[:name] }
      expect(names).to include("Health Heroes", "Health Alliance")
      expect(names).not_to include("Youth Mentors")
    end

    it "paginates results" do
      get "/api/v1/organizations", params: { per_page: 2, page: 1 }
      expect(json[:organizations].length).to eq(2)
      expect(json[:meta][:total_count]).to eq(3)
      expect(json[:meta][:total_pages]).to eq(2)
    end
  end

  describe "GET /api/v1/organizations/:id" do
    let!(:org) { create(:organization) }

    it "returns the organization" do
      get "/api/v1/organizations/#{org.id}"
      expect(response).to have_http_status(:ok)
      expect(json[:organization][:id]).to eq(org.id)
    end

    it "returns 404 for a missing org" do
      get "/api/v1/organizations/0"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/organizations" do
    let(:valid_params) do
      { organization: { name: "New Org", category: "education", city: "Austin", state: "TX" } }
    end

    context "when authenticated" do
      let(:headers) { auth_headers_for(user) }

      it "creates the organization and returns 201" do
        expect {
          post "/api/v1/organizations", params: valid_params.to_json,
            headers: headers.merge("Content-Type" => "application/json")
        }.to change(Organization, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json[:organization][:name]).to eq("New Org")
      end

      it "makes the creator an admin member" do
        post "/api/v1/organizations", params: valid_params.to_json,
          headers: headers.merge("Content-Type" => "application/json")
        org = Organization.last
        expect(user.admin_of?(org)).to be true
      end

      it "returns 422 when name is missing" do
        post "/api/v1/organizations",
          params: { organization: { category: "education" } }.to_json,
          headers: headers.merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        post "/api/v1/organizations", params: valid_params.to_json,
          headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/organizations/:id" do
    let!(:org) { create(:organization) }

    context "as the org admin" do
      before { create(:organization_membership, user: user, organization: org, role: :admin) }

      it "updates the organization" do
        patch "/api/v1/organizations/#{org.id}",
          params: { organization: { name: "Updated Name" } }.to_json,
          headers: auth_headers_for(user).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:ok)
        expect(json[:organization][:name]).to eq("Updated Name")
      end
    end

    context "as a non-admin member" do
      before { create(:organization_membership, user: user, organization: org, role: :member) }

      it "returns 403" do
        patch "/api/v1/organizations/#{org.id}",
          params: { organization: { name: "Sneaky Update" } }.to_json,
          headers: auth_headers_for(user).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        patch "/api/v1/organizations/#{org.id}",
          params: { organization: { name: "X" } }.to_json,
          headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/organizations/:id" do
    let!(:org) { create(:organization) }

    context "as the org admin" do
      before { create(:organization_membership, user: user, organization: org, role: :admin) }

      it "deletes the organization and returns 204" do
        expect {
          delete "/api/v1/organizations/#{org.id}", headers: auth_headers_for(user)
        }.to change(Organization, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context "as a non-admin" do
      it "returns 403" do
        delete "/api/v1/organizations/#{org.id}", headers: auth_headers_for(user)
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
