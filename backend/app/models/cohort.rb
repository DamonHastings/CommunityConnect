class Cohort < ApplicationRecord
  belongs_to :program
  has_many :cohort_memberships, dependent: :destroy
  has_many :members, through: :cohort_memberships, source: :user

  validates :name, presence: true
end
