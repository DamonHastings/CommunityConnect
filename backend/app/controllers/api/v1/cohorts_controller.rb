class Api::V1::CohortsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_program, only: [:index, :create]
  before_action :set_cohort, only: [:update, :destroy]

  def index
    cohorts = @program.cohorts.includes(:cohort_memberships, :members)
    render json: { cohorts: cohorts.map { |c| serialize(c) } }
  end

  def create
    cohort = @program.cohorts.build(cohort_params)
    authorize cohort
    if cohort.save
      render json: { cohort: serialize(cohort) }, status: :created
    else
      render json: { errors: cohort.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @cohort
    if @cohort.update(cohort_params)
      render json: { cohort: serialize(@cohort) }
    else
      render json: { errors: @cohort.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @cohort
    @cohort.destroy!
    head :no_content
  end

  private

  def set_program = @program = Program.find(params[:program_id])
  def set_cohort = @cohort = Cohort.includes(:program).find(params[:id])
  def cohort_params = params.require(:cohort).permit(:name, :starts_on, :ends_on, :notes)
  def serialize(cohort) = CohortSerializer.new(cohort).serializable_hash[:data][:attributes]
end
