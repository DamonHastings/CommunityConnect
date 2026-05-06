require 'rails_helper'

RSpec.describe "Partner Connections API", type: :request do
  let!(:requester_admin) { create(:user) }
  let!(:target_admin)    { create(:user) }
  let!(:outsider)        { create(:user) }
  let!(:requester_org)   { create(:organization) }
  let!(:target_org)      { create(:organization) }
  let!(:_req_mem)        { create(:organization_membership, user: requester_admin, organization: requester_org, role: :admin) }
  let!(:_tgt_mem)        { create(:organization_membership, user: target_admin, organization: target_org, role: :admin) }

  # ── GET /api/v1/organizations/:organization_id/partner_connections ─────────

  describe "GET /api/v1/organizations/:organization_id/partner_connections" do
    let!(:connection) do
      PartnerConnection.create!(requester_org: requester_org, target_org: target_org, status: :pending)
    end

    it "returns connections for the org (as requester)" do
      get "/api/v1/organizations/#{requester_org.id}/partner_connections",
        headers: auth_headers_for(requester_admin)
      expect(response).to have_http_status(:ok)
      ids = json[:partner_connections].map { |c| c[:id] }
      expect(ids).to include(connection.id)
    end

    it "returns connections for the org (as target)" do
      get "/api/v1/organizations/#{target_org.id}/partner_connections",
        headers: auth_headers_for(target_admin)
      expect(response).to have_http_status(:ok)
      ids = json[:partner_connections].map { |c| c[:id] }
      expect(ids).to include(connection.id)
    end

    it "filters by status" do
      get "/api/v1/organizations/#{requester_org.id}/partner_connections?status=accepted",
        headers: auth_headers_for(requester_admin)
      expect(response).to have_http_status(:ok)
      expect(json[:partner_connections]).to be_empty
    end

    it "returns 401 when unauthenticated" do
      get "/api/v1/organizations/#{requester_org.id}/partner_connections"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── POST /api/v1/organizations/:organization_id/partner_connections ────────

  describe "POST /api/v1/organizations/:organization_id/partner_connections" do
    let(:valid_params) { { target_org_id: target_org.id, message: "Let's partner up" }.to_json }

    it "creates a pending connection and notifies the target org admin" do
      expect {
        post "/api/v1/organizations/#{requester_org.id}/partner_connections",
          params: valid_params,
          headers: auth_headers_for(requester_admin).merge("Content-Type" => "application/json")
      }.to change(PartnerConnection, :count).by(1).and change(Notification, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json[:partner_connection][:status]).to eq("pending")
    end

    it "returns 422 for a self-connection" do
      post "/api/v1/organizations/#{requester_org.id}/partner_connections",
        params: { target_org_id: requester_org.id }.to_json,
        headers: auth_headers_for(requester_admin).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 403 for a non-member" do
      post "/api/v1/organizations/#{requester_org.id}/partner_connections",
        params: valid_params,
        headers: auth_headers_for(outsider).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 401 when unauthenticated" do
      post "/api/v1/organizations/#{requester_org.id}/partner_connections",
        params: valid_params,
        headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── PATCH /api/v1/partner_connections/:id ─────────────────────────────────

  describe "PATCH /api/v1/partner_connections/:id" do
    let!(:connection) do
      PartnerConnection.create!(requester_org: requester_org, target_org: target_org, status: :pending)
    end

    it "allows the target org admin to accept" do
      patch "/api/v1/partner_connections/#{connection.id}",
        params: { status: "accepted" }.to_json,
        headers: auth_headers_for(target_admin).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:ok)
      expect(json[:partner_connection][:status]).to eq("accepted")
    end

    it "allows the target org admin to decline" do
      patch "/api/v1/partner_connections/#{connection.id}",
        params: { status: "declined" }.to_json,
        headers: auth_headers_for(target_admin).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:ok)
      expect(json[:partner_connection][:status]).to eq("declined")
    end

    it "returns 403 for an outsider" do
      patch "/api/v1/partner_connections/#{connection.id}",
        params: { status: "accepted" }.to_json,
        headers: auth_headers_for(outsider).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:forbidden)
    end
  end

  # ── DELETE /api/v1/partner_connections/:id ────────────────────────────────

  describe "DELETE /api/v1/partner_connections/:id" do
    let!(:connection) do
      PartnerConnection.create!(requester_org: requester_org, target_org: target_org, status: :pending)
    end

    it "allows the requester org admin to destroy the connection" do
      expect {
        delete "/api/v1/partner_connections/#{connection.id}",
          headers: auth_headers_for(requester_admin)
      }.to change(PartnerConnection, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 403 for an outsider" do
      delete "/api/v1/partner_connections/#{connection.id}",
        headers: auth_headers_for(outsider)
      expect(response).to have_http_status(:forbidden)
    end
  end
end
