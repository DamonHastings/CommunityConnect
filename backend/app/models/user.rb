class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :organization_memberships, dependent: :destroy
  has_many :organizations, through: :organization_memberships

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
