class CohortMembership < ApplicationRecord
  belongs_to :cohort
  belongs_to :user

  validates :user_id, uniqueness: { scope: :cohort_id }
end
