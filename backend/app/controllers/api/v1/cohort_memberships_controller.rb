class Api::V1::CohortMembershipsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_cohort

  def create
    membership = @cohort.cohort_memberships.build(user_id: params[:user_id])
    authorize membership
    if membership.save
      render json: { cohort: serialize_cohort(@cohort.reload) }, status: :created
    else
      render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    membership = @cohort.cohort_memberships.find_by!(user_id: params[:user_id])
    authorize membership
    membership.destroy!
    render json: { cohort: serialize_cohort(@cohort.reload) }
  end

  private

  def set_cohort = @cohort = Cohort.includes(:program, :cohort_memberships, :members).find(params[:cohort_id])
  def serialize_cohort(cohort) = CohortSerializer.new(cohort).serializable_hash[:data][:attributes]
end
