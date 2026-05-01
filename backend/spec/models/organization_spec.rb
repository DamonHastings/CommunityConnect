require 'rails_helper'

RSpec.describe Organization, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }

    it "allows a blank contact_email" do
      org = build(:organization, contact_email: "")
      expect(org).to be_valid
    end

    it "rejects an invalid contact_email format" do
      org = build(:organization, contact_email: "not-an-email")
      expect(org).not_to be_valid
      expect(org.errors[:contact_email]).to be_present
    end

    it "accepts a valid contact_email" do
      org = build(:organization, contact_email: "hello@example.org")
      expect(org).to be_valid
    end
  end

  describe "associations" do
    it { is_expected.to belong_to(:creator).class_name("User").optional }
    it { is_expected.to have_many(:organization_memberships).dependent(:destroy) }
    it { is_expected.to have_many(:users).through(:organization_memberships) }
    it { is_expected.to have_many(:engagement_opportunities).dependent(:destroy) }
  end

  describe "enums" do
    it {
      is_expected.to define_enum_for(:category).with_values(
        food_bank: 0, shelter: 1, healthcare: 2, education: 3,
        housing: 4, mental_health: 5, youth_services: 6, other: 7
      )
    }

    it {
      is_expected.to define_enum_for(:status).with_values(
        pending: 0, active: 1, inactive: 2
      )
    }
  end

  describe "scopes" do
    let!(:sf_health) { create(:organization, category: :healthcare, city: "San Francisco", state: "CA") }
    let!(:la_edu)    { create(:organization, category: :education,  city: "Los Angeles",   state: "CA") }
    let!(:ny_health) { create(:organization, category: :healthcare, city: "New York",       state: "NY") }

    describe ".by_category" do
      it "returns organizations matching the category" do
        expect(Organization.by_category("healthcare")).to contain_exactly(sf_health, ny_health)
      end

      it "returns all when category is blank" do
        expect(Organization.by_category("")).to match_array(Organization.all)
      end
    end

    describe ".by_city" do
      it "returns organizations in the city (case-insensitive)" do
        expect(Organization.by_city("san francisco")).to contain_exactly(sf_health)
        expect(Organization.by_city("San Francisco")).to contain_exactly(sf_health)
      end
    end

    describe ".by_state" do
      it "returns organizations in the state (case-insensitive)" do
        expect(Organization.by_state("ca")).to contain_exactly(sf_health, la_edu)
        expect(Organization.by_state("CA")).to contain_exactly(sf_health, la_edu)
      end
    end
  end

  describe "#full_address" do
    it "joins address components with commas, skipping nils" do
      org = build(:organization,
        address: "123 Main St", city: "Springfield",
        state: "IL", zip: "62701", country: "US"
      )
      expect(org.full_address).to eq("123 Main St, Springfield, IL, 62701, US")
    end

    it "skips nil components" do
      org = build(:organization, address: nil, city: "Portland", state: "OR", zip: nil, country: nil)
      expect(org.full_address).to eq("Portland, OR")
    end
  end
end
