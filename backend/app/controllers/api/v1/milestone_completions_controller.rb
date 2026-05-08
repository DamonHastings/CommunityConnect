class Api::V1::MilestoneCompletionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_milestone

  def create
    completion = @milestone.milestone_completions.build(user: current_user, completed_at: Time.current)
    authorize completion
    if completion.save
      render json: { completion: serialize(completion) }, status: :created
    else
      render json: { errors: completion.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    completion = @milestone.milestone_completions.find_by!(user: current_user)
    authorize completion
    completion.destroy!
    head :no_content
  end

  private

  def set_milestone = @milestone = ProgramMilestone.includes(:program).find(params[:milestone_id])

  def serialize(c)
    { id: c.id, milestone_id: c.milestone_id, user_id: c.user_id, completed_at: c.completed_at }
  end
end
