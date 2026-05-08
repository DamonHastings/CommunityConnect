class MilestoneCompletion < ApplicationRecord
  belongs_to :milestone, class_name: "ProgramMilestone"
  belongs_to :user

  validates :user_id, uniqueness: { scope: :milestone_id }
end
