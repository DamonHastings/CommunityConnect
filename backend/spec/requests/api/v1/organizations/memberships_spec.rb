require 'rails_helper'

RSpec.describe "Organization Memberships API", type: :request do
  let!(:admin)   { create(:user) }
  let!(:org)     { create(:organization) }
  let!(:_admin_membership) { create(:organization_membership, user: admin, organization: org, role: :admin) }

  describe "POST /api/v1/organizations/:id/members" do
    let!(:invitee) { create(:user) }

    context "as an org admin" do
      it "adds the user as a member and returns 201" do
        post "/api/v1/organizations/#{org.id}/members",
          params: { email: invitee.email, role: "member" }.to_json,
          headers: auth_headers_for(admin).merge("Content-Type" => "application/json")

        expect(response).to have_http_status(:created)
        expect(json[:membership][:user_email]).to eq(invitee.email)
        expect(json[:membership][:role]).to eq("member")
      end

      it "prevents adding the same user twice" do
        create(:organization_membership, user: invitee, organization: org)

        post "/api/v1/organizations/#{org.id}/members",
          params: { email: invitee.email }.to_json,
          headers: auth_headers_for(admin).merge("Content-Type" => "application/json")

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json[:error]).to match(/already a member/i)
      end

      it "returns 404 for an unknown email" do
        post "/api/v1/organizations/#{org.id}/members",
          params: { email: "nobody@example.com" }.to_json,
          headers: auth_headers_for(admin).merge("Content-Type" => "application/json")

        expect(response).to have_http_status(:not_found)
      end
    end

    context "as a non-admin member" do
      let!(:member) { create(:user) }
      let!(:_membership) { create(:organization_membership, user: member, organization: org, role: :member) }

      it "returns 403" do
        post "/api/v1/organizations/#{org.id}/members",
          params: { email: invitee.email }.to_json,
          headers: auth_headers_for(member).merge("Content-Type" => "application/json")
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        post "/api/v1/organizations/#{org.id}/members",
          params: { email: invitee.email }.to_json,
          headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/organizations/:id/members/:user_id" do
    let!(:member) { create(:user) }
    let!(:membership) { create(:organization_membership, user: member, organization: org, role: :member) }

    context "as an org admin" do
      it "removes the member and returns 204" do
        expect {
          delete "/api/v1/organizations/#{org.id}/members/#{member.id}",
            headers: auth_headers_for(admin)
        }.to change(OrganizationMembership, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "prevents removing yourself from the organization" do
        delete "/api/v1/organizations/#{org.id}/members/#{admin.id}",
          headers: auth_headers_for(admin)

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json[:error]).to match(/cannot remove yourself/i)
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        delete "/api/v1/organizations/#{org.id}/members/#{member.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
