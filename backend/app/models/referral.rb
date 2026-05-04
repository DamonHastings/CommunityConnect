class Referral < ApplicationRecord
  belongs_to :referring_org, class_name: "Organization"
  belongs_to :referred_user, class_name: "User"
  belongs_to :target, polymorphic: true, optional: true

  enum :status, { pending: 0, accepted: 1, declined: 2 }

  validates :referring_org, :referred_user, presence: true
end
