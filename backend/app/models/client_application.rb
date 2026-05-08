class ClientApplication < ApplicationRecord
  belongs_to :client_profile
  belongs_to :program

  enum :status, {
    pending: 0,
    approved: 1,
    rejected: 2,
    withdrawn: 3
  }

  validates :client_profile_id, uniqueness: { scope: :program_id }
end
