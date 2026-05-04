class Api::V1::MyProgramApplicationsController < ApplicationController
  before_action :authenticate_user!

  def index
    apps = current_user.program_applications
      .includes(program: :organization)
      .order(created_at: :desc)
    render json: { applications: apps.map { |a| serialize(a) } }
  end

  private

  def serialize(app) = ProgramApplicationSerializer.new(app).serializable_hash[:data][:attributes]
end
