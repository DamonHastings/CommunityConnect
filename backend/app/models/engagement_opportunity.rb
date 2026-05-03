class EngagementOpportunity < ApplicationRecord
  belongs_to :organization
  has_many :service_applications, dependent: :destroy

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
  validate :end_date_after_start_date
  
  private

  def end_date_after_start_date
    return if end_date.blank? || start_date.blank?
    errors.add(:end_date, "must be after start date") if end_date < start_date
  end

  scope :open_opportunities, -> { where(status: :open) }
  scope :by_type, ->(type) { where(opportunity_type: type) if type.present? }
  scope :upcoming, -> { where("start_date >= ?", Date.current) }
  scope :remote_only, -> { where(remote: true)}
end
