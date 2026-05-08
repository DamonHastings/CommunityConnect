class ProgramMilestoneSerializer
  include JSONAPI::Serializer

  attributes :id, :program_id, :title, :description, :due_date, :position, :created_at

  attribute :completed_by_current_user do |milestone, params|
    next false unless params[:current_user]
    milestone.milestone_completions.any? { |mc| mc.user_id == params[:current_user].id }
  end

  attribute :completion_count do |milestone|
    milestone.milestone_completions.size
  end
end
