require 'rails_helper'

RSpec.describe "Service Applications API", type: :request do
  let!(:org_admin)  { create(:user) }
  let!(:applicant)  { create(:user) }
  let!(:outsider)   { create(:user) }
  let!(:org)        { create(:organization) }
  let!(:_admin_mem) { create(:organization_membership, user: org_admin, organization: org, role: :admin) }
  let!(:opp)        { create(:engagement_opportunity, organization: org, opportunity_type: :volunteer, status: :open) }

  # ── GET /api/v1/opportunities/:opportunity_id/applications ──────────────────

  describe "GET /api/v1/opportunities/:opportunity_id/applications" do
    let!(:application) { create(:service_application, user: applicant, engagement_opportunity: opp) }

    context "as org admin" do
      it "returns the applications list" do
        get "/api/v1/opportunities/#{opp.id}/applications",
          headers: auth_headers_for(org_admin)
        expect(response).to have_http_status(:ok)
        expect(json[:applications].map { |a| a[:id] }).to include(application.id)
      end
    end

    context "as non-member" do
      it "returns 403" do
        get "/api/v1/opportunities/#{opp.id}/applications",
          headers: auth_headers_for(outsider)
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        get "/api/v1/opportunities/#{opp.id}/applications"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── POST /api/v1/opportunities/:opportunity_id/applications ─────────────────

  describe "POST /api/v1/opportunities/:opportunity_id/applications" do
    let(:valid_params) { { application: { message: "I want to help" } }.to_json }

    context "as any authenticated user" do
      it "creates a pending application" do
        expect {
          post "/api/v1/opportunities/#{opp.id}/applications",
            params: valid_params,
            headers: auth_headers_for(applicant).merge("Content-Type" => "application/json")
        }.to change(ServiceApplication, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json[:application][:status]).to eq("pending")
      end

      it "prevents duplicate applications" do
        create(:service_application, user: applicant, engagement_opportunity: opp)

        post "/api/v1/opportunities/#{opp.id}/applications",
          params: valid_params,
          headers: auth_headers_for(applicant).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        post "/api/v1/opportunities/#{opp.id}/applications",
          params: valid_params,
          headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── GET /api/v1/my/applications ─────────────────────────────────────────────

  describe "GET /api/v1/my/applications" do
    let!(:my_app)    { create(:service_application, user: applicant, engagement_opportunity: opp) }
    let!(:other_opp) { create(:engagement_opportunity, organization: org, opportunity_type: :volunteer) }
    let!(:other_app) { create(:service_application, user: org_admin, engagement_opportunity: other_opp) }

    it "returns only the authenticated user's applications" do
      get "/api/v1/my/applications", headers: auth_headers_for(applicant)
      expect(response).to have_http_status(:ok)
      ids = json[:applications].map { |a| a[:id] }
      expect(ids).to include(my_app.id)
      expect(ids).not_to include(other_app.id)
    end

    it "returns 401 when unauthenticated" do
      get "/api/v1/my/applications"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── PATCH /api/v1/applications/:id ──────────────────────────────────────────

  describe "PATCH /api/v1/applications/:id" do
    let!(:svc_app) { create(:service_application, user: applicant, engagement_opportunity: opp, status: :pending) }

    context "as org admin" do
      it "approves the application and creates a notification" do
        expect {
          patch "/api/v1/applications/#{svc_app.id}",
            params: { application: { status: "approved" } }.to_json,
            headers: auth_headers_for(org_admin).merge("Content-Type" => "application/json")
        }.to change(Notification, :count).by(1)

        expect(response).to have_http_status(:ok)
        expect(json[:application][:status]).to eq("approved")
      end

      it "rejects the application" do
        patch "/api/v1/applications/#{svc_app.id}",
          params: { application: { status: "rejected" } }.to_json,
          headers: auth_headers_for(org_admin).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:ok)
        expect(json[:application][:status]).to eq("rejected")
      end
    end

    context "as non-member" do
      it "returns 403" do
        patch "/api/v1/applications/#{svc_app.id}",
          params: { application: { status: "approved" } }.to_json,
          headers: auth_headers_for(outsider).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  # ── DELETE /api/v1/applications/:id ─────────────────────────────────────────

  describe "DELETE /api/v1/applications/:id" do
    let!(:svc_app) { create(:service_application, user: applicant, engagement_opportunity: opp, status: :pending) }

    it "marks the application as withdrawn" do
      delete "/api/v1/applications/#{svc_app.id}",
        headers: auth_headers_for(applicant)
      expect(response).to have_http_status(:ok)
      expect(json[:application][:status]).to eq("withdrawn")
    end

    it "returns 403 when attempted by a non-applicant" do
      delete "/api/v1/applications/#{svc_app.id}",
        headers: auth_headers_for(outsider)
      expect(response).to have_http_status(:forbidden)
    end
  end
end
