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

  after_create :notify_followers

  validates :title, presence: true
  validates :organization, presence: true
  validate :end_date_after_start_date

  private

  def notify_followers
    organization.org_followers.includes(:user).each do |follower|
      Notification.create!(
        user: follower.user,
        notification_type: :new_content,
        title: "New opportunity from #{organization.name}",
        body: title.truncate(100),
        url: "/organizations/#{organization.id}",
        actor_name: organization.name
      )
    end
  end

  def end_date_after_start_date
    return if end_date.blank? || start_date.blank?
    errors.add(:end_date, "must be after start date") if end_date < start_date
  end

  scope :open_opportunities, -> { where(status: :open) }
  scope :by_type, ->(type) { where(opportunity_type: type) if type.present? }
  scope :upcoming, -> { where("start_date >= ?", Date.current) }
  scope :remote_only, -> { where(remote: true)}
end
