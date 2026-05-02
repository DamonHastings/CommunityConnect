class Api::V1::MyApplicationsController < ApplicationController
  before_action :authenticate_user!

  def index
    apps = current_user.service_applications
      .includes(engagement_opportunity: :organization)
      .order(created_at: :desc)
    render json: { applications: apps.map { |a| serialize(a) } }
  end

  private

  def serialize(app) = ServiceApplicationSerializer.new(app).serializable_hash[:data][:attributes]
end
