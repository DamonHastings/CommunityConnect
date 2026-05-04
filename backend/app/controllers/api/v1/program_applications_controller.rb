class Api::V1::ProgramApplicationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_program, only: [:index, :create]
  before_action :set_application, only: [:update, :destroy]

  def index
    authorize @program, :view_applications?
    apps = @program.program_applications.includes(:user).order(created_at: :desc)
    render json: { applications: apps.map { |a| serialize(a) } }
  end

  def create
    app = @program.program_applications.build(user: current_user, message: application_params[:message])
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

  def set_program = @program = Program.find(params[:program_id])
  def set_application = @application = ProgramApplication.find(params[:id])
  def application_params = params.require(:application).permit(:message)
  def update_params = params.require(:application).permit(:status, :notes)
  def serialize(app) = ProgramApplicationSerializer.new(app).serializable_hash[:data][:attributes]
end
