class ClientProfile < ApplicationRecord
  belongs_to :advocate, class_name: "User"
  has_many :client_applications, dependent: :destroy

  enum :housing_status, {
    housed_stable: 0,
    housed_at_risk: 1,
    unhoused: 2,
    shelter: 3,
    transitional: 4
  }, prefix: :housing

  enum :employment_status, {
    employed_full_time: 0,
    employed_part_time: 1,
    unemployed_seeking: 2,
    unemployed_not_seeking: 3,
    student: 4,
    retired: 5,
    unable_to_work: 6
  }, prefix: :employment

  enum :urgency, {
    low: 0,
    medium: 1,
    high: 2,
    crisis: 3
  }

  validates :first_name, presence: true
  validates :last_name, presence: true

  def full_name
    "#{first_name} #{last_name}"
  end
end
