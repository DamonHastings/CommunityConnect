require 'rails_helper'

RSpec.describe "Matches API", type: :request do
  let!(:user_with_intake)    { create(:user) }
  let!(:user_without_intake) { create(:user) }
  let!(:_intake) do
    create(:user_intake_response,
      user: user_with_intake,
      housing_status: :stable,
      employment_status: :employed_full_time,
      needs_categories: ["food_nutrition"],
      urgency: :ongoing,
      preferred_contact: "email")
  end

  # ── GET /api/v1/matches ───────────────────────────────────────────────────

  describe "GET /api/v1/matches" do
    context "with completed intake" do
      it "returns has_intake true and matching collections" do
        get "/api/v1/matches", headers: auth_headers_for(user_with_intake)
        expect(response).to have_http_status(:ok)
        expect(json[:has_intake]).to eq(true)
        expect(json).to have_key(:needs_categories)
        expect(json).to have_key(:organizations)
        expect(json).to have_key(:opportunities)
        expect(json).to have_key(:programs)
      end
    end

    context "without intake" do
      it "returns has_intake false and empty collections" do
        get "/api/v1/matches", headers: auth_headers_for(user_without_intake)
        expect(response).to have_http_status(:ok)
        expect(json[:has_intake]).to eq(false)
        expect(json[:needs_categories]).to be_empty
        expect(json[:organizations]).to be_empty
        expect(json[:opportunities]).to be_empty
      end
    end

    context "when unauthenticated" do
      it "returns 401" do
        get "/api/v1/matches"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
