class UserIntakeResponse < ApplicationRecord
  belongs_to :user

  enum :housing_status, {
    stable: 0,
    at_risk: 1,
    transitional: 2,
    experiencing_homelessness: 3,
    prefer_not_to_say: 4
  }

  enum :employment_status, {
    employed_full_time: 0,
    employed_part_time: 1,
    unemployed_seeking: 2,
    unemployed_not_seeking: 3,
    self_employed: 4,
    unable_to_work: 5
  }

  enum :urgency, {
    immediate: 0,
    within_weeks: 1,
    within_months: 2,
    ongoing: 3
  }

  validates :user_id, uniqueness: true
end
