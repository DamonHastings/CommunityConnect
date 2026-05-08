class Program < ApplicationRecord
  belongs_to :organization
  has_many :program_applications, dependent: :destroy
  has_many :program_organizations, dependent: :destroy
  has_many :co_organizations, through: :program_organizations, source: :organization
  has_many :cohorts, dependent: :destroy
  has_many :program_milestones, dependent: :destroy
  has_many :client_applications, dependent: :destroy

  after_create :create_owner_program_organization

  enum :program_type, {
    mentorship: 0,
    workshop: 1,
    summer_program: 2,
    tutoring: 3,
    job_training: 4,
    volunteer: 5,
    community_event: 6,
    other: 7
  }

  enum :status, {
    draft: 0,
    published: 1,
    active: 2,
    completed: 3,
    cancelled: 4
  }

  validates :title, presence: true
  validates :organization, presence: true
  validate :end_date_after_start_date
  validate :application_window_valid

  scope :published_or_active, -> { where(status: [:published, :active]) }
  scope :by_type, ->(type) { where(program_type: type) if type.present? }
  scope :by_org, ->(org_id) { where(organization_id: org_id) if org_id.present? }
  scope :remote_only, -> { where(remote: true) }
  scope :upcoming, -> { where("starts_on >= ?", Date.current) }

  def applications_open?
    return false unless application_opens_at && application_closes_at
    Time.current.between?(application_opens_at, application_closes_at)
  end

  private

  def create_owner_program_organization
    program_organizations.find_or_create_by!(organization: organization, role: :owner)
  end

  def end_date_after_start_date
    return if ends_on.blank? || starts_on.blank?
    errors.add(:ends_on, "must be after start date") if ends_on < starts_on
  end

  def application_window_valid
    return if application_opens_at.blank? || application_closes_at.blank?
    errors.add(:application_closes_at, "must be after application opens date") if application_closes_at <= application_opens_at
  end
end
