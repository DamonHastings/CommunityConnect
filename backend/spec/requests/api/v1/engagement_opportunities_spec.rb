require 'rails_helper'

RSpec.describe "Engagement Opportunities API", type: :request do
  let!(:member_user) { create(:user) }
  let!(:admin_user)  { create(:user) }
  let!(:org)         { create(:organization) }
  let!(:_member)     { create(:organization_membership, user: member_user, organization: org, role: :member) }
  let!(:_admin)      { create(:organization_membership, user: admin_user,  organization: org, role: :admin) }

  describe "GET /api/v1/opportunities" do
    let!(:vol_open)   { create(:engagement_opportunity, organization: org, opportunity_type: :volunteer, status: :open) }
    let!(:mentor_open){ create(:engagement_opportunity, organization: org, opportunity_type: :mentorship, status: :open) }
    let!(:vol_closed) { create(:engagement_opportunity, organization: org, opportunity_type: :volunteer, status: :closed) }
    let!(:vol_closed_onsite) { create(:engagement_opportunity, organization: org, opportunity_type: :volunteer, status: :closed, remote: false) }
    let!(:vol_closed_remote) { create(:engagement_opportunity, organization: org, opportunity_type: :volunteer, status: :closed, remote: true) }

    it "returns all opportunities with pagination meta" do
      get "/api/v1/opportunities"
      expect(response).to have_http_status(:ok)
      expect(json[:opportunities].length).to eq(5)
      expect(json[:meta]).to include(:total_count, :current_page)
    end

    it "filters by type" do
      get "/api/v1/opportunities", params: { type: "volunteer" }
      expect(json[:opportunities].length).to eq(4)
    end

    it "filters by status" do
      get "/api/v1/opportunities", params: { status: "open" }
      expect(json[:opportunities].length).to eq(2)
    end

    it "filters by remote" do
      get "/api/v1/opportunities", params: { remote: "true" }
      expect(json[:opportunities].length).to eq(1)
    end

    it "filters by onsite (remote: false)" do
      get "/api/v1/opportunities", params: { remote: "false" }
      expect(json[:opportunities].length).to eq(4)
    end
    it "does not filter by remote if not present" do
      get "/api/v1/opportunities"
      expect(json[:opportunities].length).to eq(5)
    end
  end

  describe "GET /api/v1/organizations/:organization_id/opportunities" do
    let!(:other_org) { create(:organization) }
    let!(:opp)       { create(:engagement_opportunity, organization: org) }
    let!(:other_opp) { create(:engagement_opportunity, organization: other_org) }

    it "returns only opportunities for the specified organization" do
      get "/api/v1/organizations/#{org.id}/opportunities"
      expect(response).to have_http_status(:ok)
      ids = json[:opportunities].map { |o| o[:id] }
      expect(ids).to include(opp.id)
      expect(ids).not_to include(other_opp.id)
    end
  end

  describe "GET /api/v1/opportunities/:id" do
    let!(:opp) { create(:engagement_opportunity, organization: org) }

    it "returns the opportunity" do
      get "/api/v1/opportunities/#{opp.id}"
      expect(response).to have_http_status(:ok)
      expect(json[:opportunity][:id]).to eq(opp.id)
    end

    it "returns 404 for a missing opportunity" do
      get "/api/v1/opportunities/0"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/organizations/:organization_id/opportunities" do
    let(:valid_params) do
      { opportunity: { title: "Summer Volunteer", opportunity_type: "volunteer", status: "open" } }
    end

    context "as an org member" do
      it "creates the opportunity and returns 201" do
        expect {
          post "/api/v1/organizations/#{org.id}/opportunities",
            params: valid_params.to_json,
            headers: auth_headers_for(member_user).merge("Content-Type" => "application/json")
        }.to change(EngagementOpportunity, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json[:opportunity][:title]).to eq("Summer Volunteer")
      end

      it "returns 422 when title is missing" do
        post "/api/v1/organizations/#{org.id}/opportunities",
          params: { opportunity: { opportunity_type: "volunteer" } }.to_json,
          headers: auth_headers_for(member_user).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "as a non-member" do
      let!(:outsider) { create(:user) }

      it "returns 403" do
        post "/api/v1/organizations/#{org.id}/opportunities",
          params: valid_params.to_json,
          headers: auth_headers_for(outsider).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        post "/api/v1/organizations/#{org.id}/opportunities",
          params: valid_params.to_json,
          headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/opportunities/:id" do
    let!(:opp) { create(:engagement_opportunity, organization: org, title: "Original Title") }

    context "as an org member" do
      it "updates the opportunity" do
        patch "/api/v1/opportunities/#{opp.id}",
          params: { opportunity: { title: "Updated Title" } }.to_json,
          headers: auth_headers_for(member_user).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:ok)
        expect(json[:opportunity][:title]).to eq("Updated Title")
      end
    end

    context "as a non-member" do
      let!(:outsider) { create(:user) }

      it "returns 403" do
        patch "/api/v1/opportunities/#{opp.id}",
          params: { opportunity: { title: "X" } }.to_json,
          headers: auth_headers_for(outsider).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "DELETE /api/v1/opportunities/:id" do
    let!(:opp) { create(:engagement_opportunity, organization: org) }

    context "as an org admin" do
      it "deletes the opportunity and returns 204" do
        expect {
          delete "/api/v1/opportunities/#{opp.id}", headers: auth_headers_for(admin_user)
        }.to change(EngagementOpportunity, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end
    end

    context "as a plain member (not admin)" do
      it "returns 403" do
        delete "/api/v1/opportunities/#{opp.id}", headers: auth_headers_for(member_user)
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        delete "/api/v1/opportunities/#{opp.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
