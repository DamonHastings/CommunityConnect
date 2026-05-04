class ServiceApplication < ApplicationRecord
  belongs_to :user
  belongs_to :engagement_opportunity
  belongs_to :applicant_org, class_name: "Organization", optional: true

  enum :status, { pending: 0, approved: 1, rejected: 2, withdrawn: 3 }

  validates :user_id, uniqueness: { scope: :engagement_opportunity_id, message: "has already applied to this opportunity" }
end
