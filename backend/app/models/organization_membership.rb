class OrganizationMembership < ApplicationRecord
  belongs_to :user
  belongs_to :organization
  belongs_to :invited_by, class_name: "User", optional: true, foreign_key: :invited_by_id

  enum :role, { member: 0, admin: 1 }

  validates :user_id, uniqueness: { scope: :organization_id }
end
