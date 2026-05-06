require 'rails_helper'

RSpec.describe "Referrals API", type: :request do
  let!(:org_admin)     { create(:user) }
  let!(:referred_user) { create(:user) }
  let!(:outsider)      { create(:user) }
  let!(:org)           { create(:organization) }
  let!(:_admin_mem)    { create(:organization_membership, user: org_admin, organization: org, role: :admin) }

  # ── GET /api/v1/organizations/:organization_id/referrals ───────────────────

  describe "GET /api/v1/organizations/:organization_id/referrals" do
    let!(:referral) { Referral.create!(referring_org: org, referred_user: referred_user, status: :pending) }

    it "returns the org's sent referrals for an admin" do
      get "/api/v1/organizations/#{org.id}/referrals",
        headers: auth_headers_for(org_admin)
      expect(response).to have_http_status(:ok)
      expect(json[:referrals].map { |r| r[:id] }).to include(referral.id)
    end

    it "returns 401 when unauthenticated" do
      get "/api/v1/organizations/#{org.id}/referrals"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── POST /api/v1/organizations/:organization_id/referrals ──────────────────

  describe "POST /api/v1/organizations/:organization_id/referrals" do
    context "by email" do
      it "creates a referral and notifies the referred user" do
        expect {
          post "/api/v1/organizations/#{org.id}/referrals",
            params: { referred_user_email: referred_user.email, message: "Check this out" }.to_json,
            headers: auth_headers_for(org_admin).merge("Content-Type" => "application/json")
        }.to change(Referral, :count).by(1).and change(Notification, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json[:referral][:status]).to eq("pending")
      end

      it "returns 404 when email is not found" do
        post "/api/v1/organizations/#{org.id}/referrals",
          params: { referred_user_email: "nobody@nowhere.example" }.to_json,
          headers: auth_headers_for(org_admin).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:not_found)
      end
    end

    context "by user_id" do
      it "creates a referral" do
        expect {
          post "/api/v1/organizations/#{org.id}/referrals",
            params: { referred_user_id: referred_user.id }.to_json,
            headers: auth_headers_for(org_admin).merge("Content-Type" => "application/json")
        }.to change(Referral, :count).by(1)
        expect(response).to have_http_status(:created)
      end
    end

    context "as non-member" do
      it "returns 403" do
        post "/api/v1/organizations/#{org.id}/referrals",
          params: { referred_user_email: referred_user.email }.to_json,
          headers: auth_headers_for(outsider).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  # ── PATCH /api/v1/referrals/:id ────────────────────────────────────────────

  describe "PATCH /api/v1/referrals/:id" do
    let!(:referral) { Referral.create!(referring_org: org, referred_user: referred_user, status: :pending) }

    it "allows the referred user to accept, and notifies org admins" do
      expect {
        patch "/api/v1/referrals/#{referral.id}",
          params: { status: "accepted" }.to_json,
          headers: auth_headers_for(referred_user).merge("Content-Type" => "application/json")
      }.to change(Notification, :count).by(1)

      expect(response).to have_http_status(:ok)
      expect(json[:referral][:status]).to eq("accepted")
    end

    it "allows the referred user to decline" do
      patch "/api/v1/referrals/#{referral.id}",
        params: { status: "declined" }.to_json,
        headers: auth_headers_for(referred_user).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:ok)
      expect(json[:referral][:status]).to eq("declined")
    end

    it "returns 403 when attempted by an outsider" do
      patch "/api/v1/referrals/#{referral.id}",
        params: { status: "accepted" }.to_json,
        headers: auth_headers_for(outsider).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:forbidden)
    end
  end

  # ── GET /api/v1/my/referrals ───────────────────────────────────────────────

  describe "GET /api/v1/my/referrals" do
    let!(:referral) { Referral.create!(referring_org: org, referred_user: referred_user, status: :pending) }

    it "returns referrals addressed to the current user" do
      get "/api/v1/my/referrals", headers: auth_headers_for(referred_user)
      expect(response).to have_http_status(:ok)
      expect(json[:referrals].map { |r| r[:id] }).to include(referral.id)
    end

    it "does not include referrals for other users" do
      get "/api/v1/my/referrals", headers: auth_headers_for(outsider)
      expect(response).to have_http_status(:ok)
      expect(json[:referrals]).to be_empty
    end

    it "returns 401 when unauthenticated" do
      get "/api/v1/my/referrals"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
