class Caseload < ApplicationRecord
  belongs_to :navigator, class_name: "User"
  belongs_to :client, class_name: "User"

  enum :status, { active: 0, closed: 1 }

  validates :navigator_id, uniqueness: { scope: :client_id }
end
