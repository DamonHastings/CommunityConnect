require 'rails_helper'

RSpec.describe EngagementOpportunity, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:organization) }
  end

  describe "associations" do
    it { is_expected.to belong_to(:organization) }
  end

  describe "enums" do
    it {
      is_expected.to define_enum_for(:opportunity_type).with_values(
        volunteer: 0, partnership: 1, funding: 2, mentorship: 3, resource_sharing: 4
      )
    }

    it {
      is_expected.to define_enum_for(:status).with_values(
        open: 0, closed: 1, filled: 2
      )
    }
  end

  describe "scopes" do
    let!(:open_vol)    { create(:engagement_opportunity, status: :open,   opportunity_type: :volunteer) }
    let!(:closed_vol)  { create(:engagement_opportunity, status: :closed, opportunity_type: :volunteer) }
    let!(:open_mentor) { create(:engagement_opportunity, status: :open,   opportunity_type: :mentorship) }
    let!(:past_opp)    { create(:engagement_opportunity, status: :open, opportunity_type: :funding, start_date: Date.current - 1.week) }
    let!(:remote_opp)  { create(:engagement_opportunity, status: :open,   opportunity_type: :mentorship, remote: 'true') }

    describe ".open_opportunities" do
      it "returns only open opportunities" do
        expect(EngagementOpportunity.open_opportunities).to contain_exactly(open_vol, open_mentor, past_opp, remote_opp)
      end
    end

    describe ".by_type" do
      it "filters by opportunity_type" do
        expect(EngagementOpportunity.by_type("volunteer")).to contain_exactly(open_vol, closed_vol)
      end

      it "returns all when type is blank" do
        expect(EngagementOpportunity.by_type("")).to match_array(EngagementOpportunity.all)
      end
    end

    describe ".upcoming" do
      it "returns opportunities with a start_date on or after today" do
        expect(EngagementOpportunity.upcoming).to contain_exactly(open_vol, closed_vol, open_mentor, remote_opp)
      end

      it "excludes past opportunities" do
        expect(EngagementOpportunity.upcoming).not_to include(past_opp)
      end
    end

    describe ".remote"  do 
      it "returns remote opportunities" do
        expect(EngagementOpportunity.remote_only).to contain_exactly(remote_opp)
      end
    end
  end
end
