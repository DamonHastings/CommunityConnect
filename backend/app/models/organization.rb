class Organization < ApplicationRecord
  include PgSearch::Model

  belongs_to :creator, class_name: "User", optional: true
  has_many :organization_memberships, dependent: :destroy
  has_many :users, through: :organization_memberships
  has_many :engagement_opportunities, dependent: :destroy
  has_many :saved_by, class_name: "SavedOrganization", dependent: :destroy
  has_many :programs, dependent: :destroy
  has_many :program_organizations, dependent: :destroy
  has_many :submitted_applications, class_name: "ServiceApplication", foreign_key: :applicant_org_id, dependent: :nullify
  has_many :sent_referrals, class_name: "Referral", foreign_key: :referring_org_id, dependent: :destroy
  has_many :announcements, dependent: :destroy
  has_many :sent_partner_connections, class_name: "PartnerConnection", foreign_key: :requester_org_id, dependent: :destroy
  has_many :received_partner_connections, class_name: "PartnerConnection", foreign_key: :target_org_id, dependent: :destroy

  enum :category, {
    food_bank: 0,
    shelter: 1,
    healthcare: 2,
    education: 3,
    housing: 4,
    mental_health: 5,
    youth_services: 6,
    other: 7
  }

  enum :status, {
    pending: 0,
    active: 1,
    inactive: 2
  }

  enum :org_type, {
    nonprofit: 0,
    business: 1,
    school: 2,
    foundation: 3
  }

  validates :name, presence: true
  validates :contact_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

  geocoded_by :full_address
  after_validation :geocode, if: :address_changed?

  pg_search_scope :search_by_text,
    against: { name: "A", description: "B", mission: "C" },
    using: { tsearch: { prefix: true } }

  scope :by_category, ->(cat) { where(category: cat) if cat.present? }
  scope :by_city, ->(city) { where("lower(city) = ?", city.downcase) if city.present? }
  scope :by_state, ->(state) { where("lower(state) = ?", state.downcase) if state.present? }

  def full_address
    [address, city, state, zip, country].compact.join(", ")
  end

  def address_changed?
    address_previously_changed? || city_previously_changed? ||
      state_previously_changed? || zip_previously_changed?
  end
end
