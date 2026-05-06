require 'rails_helper'

RSpec.describe "Volunteer Hours API", type: :request do
  let!(:volunteer) { create(:user) }
  let!(:other_user) { create(:user) }
  let!(:opp)        { create(:engagement_opportunity, opportunity_type: :volunteer, status: :open) }
  let!(:application) { create(:service_application, user: volunteer, engagement_opportunity: opp, status: :approved) }

  # ── GET /api/v1/my_applications/:application_id/volunteer_hours ───────────

  describe "GET /api/v1/my_applications/:application_id/volunteer_hours" do
    let!(:hour) do
      application.volunteer_hours.create!(hours: 3.0, date: Date.today - 7, notes: "First shift")
    end

    it "returns the hours and total for the owner" do
      get "/api/v1/my_applications/#{application.id}/volunteer_hours",
        headers: auth_headers_for(volunteer)
      expect(response).to have_http_status(:ok)
      expect(json[:hours].map { |h| h[:id] }).to include(hour.id)
      expect(json[:total_hours]).to eq(3.0)
    end

    it "returns 404 when another user tries to access" do
      get "/api/v1/my_applications/#{application.id}/volunteer_hours",
        headers: auth_headers_for(other_user)
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 when unauthenticated" do
      get "/api/v1/my_applications/#{application.id}/volunteer_hours"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── POST /api/v1/my_applications/:application_id/volunteer_hours ──────────

  describe "POST /api/v1/my_applications/:application_id/volunteer_hours" do
    let(:valid_params) { { volunteer_hour: { hours: 4.5, date: Date.today.to_s, notes: "Sorting donations" } }.to_json }

    it "creates a volunteer hour entry" do
      expect {
        post "/api/v1/my_applications/#{application.id}/volunteer_hours",
          params: valid_params,
          headers: auth_headers_for(volunteer).merge("Content-Type" => "application/json")
      }.to change { application.volunteer_hours.count }.by(1)

      expect(response).to have_http_status(:created)
      expect(json[:hour][:hours]).to eq(4.5)
    end

    it "returns 422 without hours" do
      post "/api/v1/my_applications/#{application.id}/volunteer_hours",
        params: { volunteer_hour: { date: Date.today.to_s } }.to_json,
        headers: auth_headers_for(volunteer).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 404 when another user tries to post" do
      post "/api/v1/my_applications/#{application.id}/volunteer_hours",
        params: valid_params,
        headers: auth_headers_for(other_user).merge("Content-Type" => "application/json")
      expect(response).to have_http_status(:not_found)
    end
  end

  # ── DELETE /api/v1/my_applications/:application_id/volunteer_hours/:id ────

  describe "DELETE /api/v1/my_applications/:application_id/volunteer_hours/:id" do
    let!(:hour) do
      application.volunteer_hours.create!(hours: 2.0, date: Date.today - 1, notes: "Test shift")
    end

    it "removes the volunteer hour entry" do
      expect {
        delete "/api/v1/my_applications/#{application.id}/volunteer_hours/#{hour.id}",
          headers: auth_headers_for(volunteer)
      }.to change { application.volunteer_hours.count }.by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 when another user tries to delete" do
      delete "/api/v1/my_applications/#{application.id}/volunteer_hours/#{hour.id}",
        headers: auth_headers_for(other_user)
      expect(response).to have_http_status(:not_found)
    end
  end
end
