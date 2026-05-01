require 'rails_helper'

RSpec.describe User, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:first_name) }
    it { is_expected.to validate_presence_of(:last_name) }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
  end

  describe "associations" do
    it { is_expected.to have_many(:organization_memberships).dependent(:destroy) }
    it { is_expected.to have_many(:organizations).through(:organization_memberships) }
  end

  describe "#full_name" do
    it "returns first and last name joined" do
      user = build(:user, first_name: "Ada", last_name: "Lovelace")
      expect(user.full_name).to eq("Ada Lovelace")
    end
  end

  describe "#admin_of?" do
    let(:user) { create(:user) }
    let(:org)  { create(:organization) }

    it "returns true when the user has an admin membership" do
      create(:organization_membership, user: user, organization: org, role: :admin)
      expect(user.admin_of?(org)).to be true
    end

    it "returns false when the user has a member (non-admin) membership" do
      create(:organization_membership, user: user, organization: org, role: :member)
      expect(user.admin_of?(org)).to be false
    end

    it "returns false when the user has no membership" do
      expect(user.admin_of?(org)).to be false
    end
  end

  describe "#member_of?" do
    let(:user) { create(:user) }
    let(:org)  { create(:organization) }

    it "returns true when the user has any membership" do
      create(:organization_membership, user: user, organization: org)
      expect(user.member_of?(org)).to be true
    end

    it "returns false when the user has no membership" do
      expect(user.member_of?(org)).to be false
    end
  end
end
