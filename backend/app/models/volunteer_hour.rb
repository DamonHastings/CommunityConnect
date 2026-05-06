class VolunteerHour < ApplicationRecord
  belongs_to :service_application

  validates :hours, presence: true, numericality: { greater_than: 0 }
  validates :date, presence: true

  delegate :user, to: :service_application
end
