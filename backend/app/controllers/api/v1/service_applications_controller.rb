class Api::V1::ServiceApplicationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_opportunity, only: [:index, :create]
  before_action :set_application, only: [:update, :destroy]

  def index
    authorize @opportunity, :view_applications?
    apps = @opportunity.service_applications.includes(:user, :applicant_org).order(created_at: :desc)
    render json: { applications: apps.map { |a| serialize(a) } }
  end

  def create
    app = @opportunity.service_applications.build(
      user: current_user,
      message: application_params[:message],
      applicant_org_id: application_params[:applicant_org_id]
    )
    authorize app
    if app.save
      render json: { application: serialize(app) }, status: :created
    else
      render json: { errors: app.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @application
    if @application.update(update_params)
      render json: { application: serialize(@application) }
    else
      render json: { errors: @application.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @application
    @application.update!(status: :withdrawn)
    render json: { application: serialize(@application) }
  end

  private

  def set_opportunity = @opportunity = EngagementOpportunity.find(params[:opportunity_id])
  def set_application = @application = ServiceApplication.find(params[:id])
  def application_params = params.require(:application).permit(:message, :applicant_org_id)
  def update_params = params.require(:application).permit(:status, :notes)
  def serialize(app) = ServiceApplicationSerializer.new(app).serializable_hash[:data][:attributes]
end
