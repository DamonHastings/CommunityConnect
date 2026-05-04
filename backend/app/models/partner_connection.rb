class PartnerConnection < ApplicationRecord
  belongs_to :requester_org, class_name: "Organization"
  belongs_to :target_org, class_name: "Organization"

  enum :status, { pending: 0, accepted: 1, declined: 2 }

  validates :requester_org, :target_org, presence: true
  validate :orgs_must_differ

  def other_org(org)
    requester_org_id == org.id ? target_org : requester_org
  end

  private

  def orgs_must_differ
    errors.add(:target_org, "can't be the same as the requesting organization") if requester_org_id == target_org_id
  end
end
