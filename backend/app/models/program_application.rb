class ProgramApplication < ApplicationRecord
  belongs_to :user
  belongs_to :program

  enum :status, { pending: 0, approved: 1, rejected: 2, withdrawn: 3 }

  validates :user_id, uniqueness: { scope: :program_id, message: "has already applied to this program" }
end
