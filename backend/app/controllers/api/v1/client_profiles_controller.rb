class Api::V1::ClientProfilesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_profile, only: [:show, :update, :destroy]

  def index
    profiles = current_user.client_profiles.includes(:client_applications)
    render json: { client_profiles: profiles.map { |p| serialize(p) } }
  end

  def show
    authorize @profile
    render json: { client_profile: serialize(@profile) }
  end

  def create
    profile = current_user.client_profiles.build(profile_params)
    authorize profile
    if profile.save
      render json: { client_profile: serialize(profile) }, status: :created
    else
      render json: { errors: profile.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @profile
    if @profile.update(profile_params)
      render json: { client_profile: serialize(@profile) }
    else
      render json: { errors: @profile.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @profile
    @profile.destroy!
    head :no_content
  end

  private

  def set_profile = @profile = ClientProfile.find(params[:id])

  def profile_params
    params.require(:client_profile).permit(
      :first_name, :last_name, :email, :phone, :city, :state,
      :housing_status, :employment_status, :urgency, :goals, :barriers, :notes,
      needs_categories: []
    )
  end

  def serialize(p) = ClientProfileSerializer.new(p).serializable_hash[:data][:attributes]
end
