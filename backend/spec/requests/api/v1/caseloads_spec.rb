require 'rails_helper'

RSpec.describe "Caseloads API", type: :request do
  let!(:navigator) { create(:user, profile_type: :resource_navigator) }
  let!(:client)    { create(:user) }
  let!(:non_nav)   { create(:user) }

  # ── GET /api/v1/caseloads ────────────────────────────────────────────────────

  describe "GET /api/v1/caseloads" do
    let!(:caseload) { Caseload.create!(navigator: navigator, client: client, status: :active) }

    it "returns the navigator's caseloads" do
      get "/api/v1/caseloads", headers: auth_headers_for(navigator)
      expect(response).to have_http_status(:ok)
      expect(json[:caseloads].map { |c| c[:id] }).to include(caseload.id)
    end

    it "returns 403 for non-navigator" do
      get "/api/v1/caseloads", headers: auth_headers_for(non_nav)
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 401 when unauthenticated" do
      get "/api/v1/caseloads"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── POST /api/v1/caseloads ───────────────────────────────────────────────────

  describe "POST /api/v1/caseloads" do
    let(:valid_params) { { client_id: client.id, notes: "First contact" }.to_json }

    it "adds a client to the navigator's caseload" do
      expect {
        post "/api/v1/caseloads",
          params: valid_params,
          headers: auth_headers_for(navigator).merge("Content-Type" => "application/json")
      }.to change(Caseload, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json[:caseload][:client][:id]).to eq(client.id)
      expect(json[:caseload][:status]).to eq("active")
    end

    it "re-activates a previously closed caseload without creating a duplicate" do
      Caseload.create!(navigator: navigator, client: client, status: :closed)

      expect {
        post "/api/v1/caseloads",
          params: valid_params,
          headers: auth_headers_for(navigator).merge("Content-Type" => "application/json")
      }.not_to change(Caseload, :count)

      expect(response).to have_http_status(:created)
      expect(json[:caseload][:status]).to eq("active")
    end

    it "returns 403 for non-navigator" do
      post "/api/v1/caseloads",
        params: valid_params,
        headers: auth_headers_for(non_nav).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 401 when unauthenticated" do
      post "/api/v1/caseloads",
        params: valid_params,
        headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── PATCH /api/v1/caseloads/:id ─────────────────────────────────────────────

  describe "PATCH /api/v1/caseloads/:id" do
    let!(:caseload) { Caseload.create!(navigator: navigator, client: client, status: :active) }

    it "updates the caseload status to closed" do
      patch "/api/v1/caseloads/#{caseload.id}",
        params: { status: "closed" }.to_json,
        headers: auth_headers_for(navigator).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:ok)
      expect(json[:caseload][:status]).to eq("closed")
    end

    it "updates the caseload notes" do
      patch "/api/v1/caseloads/#{caseload.id}",
        params: { notes: "Updated notes" }.to_json,
        headers: auth_headers_for(navigator).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:ok)
      expect(json[:caseload][:notes]).to eq("Updated notes")
    end

    it "returns 404 when another navigator tries to update" do
      other_nav = create(:user, profile_type: :resource_navigator)
      patch "/api/v1/caseloads/#{caseload.id}",
        params: { status: "closed" }.to_json,
        headers: auth_headers_for(other_nav).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:not_found)
    end
  end

  # ── DELETE /api/v1/caseloads/:id ────────────────────────────────────────────

  describe "DELETE /api/v1/caseloads/:id" do
    let!(:caseload) { Caseload.create!(navigator: navigator, client: client, status: :active) }

    it "removes the caseload entry" do
      expect {
        delete "/api/v1/caseloads/#{caseload.id}",
          headers: auth_headers_for(navigator)
      }.to change(Caseload, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 when another navigator tries to delete" do
      other_nav = create(:user, profile_type: :resource_navigator)
      delete "/api/v1/caseloads/#{caseload.id}",
        headers: auth_headers_for(other_nav)
      expect(response).to have_http_status(:not_found)
    end
  end
end
