class Api::V1::ClientApplicationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_profile, only: [:index, :create]
  before_action :set_application, only: [:update]

  def index
    apps = @profile.client_applications.includes(:program).order(created_at: :desc)
    render json: { applications: apps.map { |a| serialize(a) } }
  end

  def create
    app = @profile.client_applications.build(
      program_id: params.dig(:application, :program_id),
      message: params.dig(:application, :message)
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

  private

  def set_profile = @profile = ClientProfile.find(params[:client_profile_id])
  def set_application = @application = ClientApplication.includes(:client_profile, :program).find(params[:id])
  def update_params = params.require(:application).permit(:status, :notes)
  def serialize(a) = ClientApplicationSerializer.new(a).serializable_hash[:data][:attributes]
end
