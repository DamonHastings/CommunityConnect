class Api::V1::IntakeResponsesController < ApplicationController
  before_action :authenticate_user!

  def show
    intake = current_user.user_intake_response
    if intake
      render json: { intake_response: serialize(intake) }
    else
      render json: { intake_response: nil }
    end
  end

  def upsert
    intake = current_user.user_intake_response || current_user.build_user_intake_response
    if intake.update(intake_params)
      render json: { intake_response: serialize(intake) }, status: intake.previously_new_record? ? :created : :ok
    else
      render json: { errors: intake.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def intake_params
    params.require(:intake_response).permit(
      :housing_status,
      :employment_status,
      :urgency,
      :goals,
      :barriers,
      :preferred_contact,
      needs_categories: []
    )
  end

  def serialize(intake)
    UserIntakeResponseSerializer.new(intake).serializable_hash[:data][:attributes]
  end
end
