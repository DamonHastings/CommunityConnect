class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :organization_memberships, dependent: :destroy
  has_many :organizations, through: :organization_memberships
  has_one :user_intake_response, dependent: :destroy
  has_many :service_applications, dependent: :destroy
  has_many :program_applications, dependent: :destroy
  has_many :saved_organizations, dependent: :destroy
  has_many :saved_orgs, through: :saved_organizations, source: :organization
  has_many :referrals, foreign_key: :referred_user_id, dependent: :destroy
  has_many :conversation_participants, dependent: :destroy
  has_many :conversations, through: :conversation_participants
  has_many :notifications, dependent: :destroy
  has_many :org_followers, dependent: :destroy
  has_many :followed_orgs, through: :org_followers, source: :organization
  has_many :caseloads, foreign_key: :navigator_id, dependent: :destroy
  has_many :caseload_clients, through: :caseloads, source: :client

  enum :profile_type, {
    individual_seeker: 0,
    individual_professional: 1,
    community_org: 2,
    business_service_provider: 3,
    volunteer: 4,
    resource_navigator: 5
  }

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :profile_type, presence: true

  def full_name
    "#{first_name} #{last_name}"
  end

  def admin_of?(organization)
    organization_memberships.exists?(organization: organization, role: :admin)
  end

  def member_of?(organization)
    organization_memberships.exists?(organization: organization)
  end
end
