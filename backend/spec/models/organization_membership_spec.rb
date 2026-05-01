require 'rails_helper'

RSpec.describe OrganizationMembership, type: :model do
  describe "validations" do
    subject { create(:organization_membership) }
    it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:organization_id) }
  end

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:organization) }
    it { is_expected.to belong_to(:invited_by).class_name("User").optional }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:role).with_values(member: 0, admin: 1) }
  end

  describe "uniqueness constraint" do
    it "prevents a user from being added to the same org twice" do
      membership = create(:organization_membership)
      duplicate  = build(:organization_membership,
        user: membership.user, organization: membership.organization)
      expect(duplicate).not_to be_valid
    end

    it "allows the same user in different organizations" do
      user = create(:user)
      create(:organization_membership, user: user)
      second_org = create(:organization)
      membership = build(:organization_membership, user: user, organization: second_org)
      expect(membership).to be_valid
    end
  end
end
