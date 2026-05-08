class Api::V1::ProgramMilestonesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_program, only: [:index, :create]
  before_action :set_milestone, only: [:update, :destroy]

  def index
    milestones = @program.program_milestones.includes(:milestone_completions)
    render json: { milestones: milestones.map { |m| serialize(m) } }
  end

  def create
    milestone = @program.program_milestones.build(milestone_params)
    authorize milestone
    if milestone.save
      render json: { milestone: serialize(milestone) }, status: :created
    else
      render json: { errors: milestone.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @milestone
    if @milestone.update(milestone_params)
      render json: { milestone: serialize(@milestone) }
    else
      render json: { errors: @milestone.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @milestone
    @milestone.destroy!
    head :no_content
  end

  private

  def set_program = @program = Program.find(params[:program_id])
  def set_milestone = @milestone = ProgramMilestone.includes(:program).find(params[:id])
  def milestone_params = params.require(:milestone).permit(:title, :description, :due_date, :position)
  def serialize(m) = ProgramMilestoneSerializer.new(m, params: { current_user: current_user }).serializable_hash[:data][:attributes]
end
