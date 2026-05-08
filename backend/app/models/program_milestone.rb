class ProgramMilestone < ApplicationRecord
  belongs_to :program
  has_many :milestone_completions, foreign_key: :milestone_id, dependent: :destroy

  validates :title, presence: true

  default_scope { order(:position, :created_at) }
end
