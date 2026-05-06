class Api::V1::VolunteerHoursController < ApplicationController
  before_action :authenticate_user!
  before_action :set_application

  def index
    render json: {
      hours: @application.volunteer_hours.order(date: :desc).map { |h| serialize(h) },
      total_hours: @application.volunteer_hours.sum(:hours).to_f
    }
  end

  def create
    hour = @application.volunteer_hours.build(hour_params)
    if hour.save
      render json: { hour: serialize(hour) }, status: :created
    else
      render json: { errors: hour.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @application.volunteer_hours.find(params[:id]).destroy
    head :no_content
  end

  private

  def set_application
    @application = current_user.service_applications.find(params[:application_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Not found" }, status: :not_found
  end

  def hour_params
    params.require(:volunteer_hour).permit(:hours, :date, :notes)
  end

  def serialize(hour)
    { id: hour.id, hours: hour.hours.to_f, date: hour.date, notes: hour.notes, created_at: hour.created_at }
  end
end
