class EngagementOpportunity < ApplicationRecord
  belongs_to :organization

  enum :opportunity_type, {
    volunteer: 0,
    partnership: 1,
    funding: 2,
    mentorship: 3,
    resource_sharing: 4
  }

  enum :status, {
    open: 0,
    closed: 1,
    filled: 2
  }

  validates :title, presence: true
  validates :organization, presence: true

  scope :open_opportunities, -> { where(status: :open) }
  scope :by_type, ->(type) { where(opportunity_type: type) if type.present? }
  scope :upcoming, -> { where("start_date >= ?", Date.current) }
end
