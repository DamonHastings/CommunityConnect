class Api::V1::Auth::ProfilesController < ApplicationController
  before_action :authenticate_user!

  def show
    render json: {
      user: UserSerializer.new(current_user).serializable_hash[:data][:attributes]
    }
  end

  def update
    if current_user.update(profile_params)
      render json: {
        user: UserSerializer.new(current_user).serializable_hash[:data][:attributes]
      }
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.require(:user).permit(
      :bio, :phone, :city, :state, :website, :availability, :profile_type, :specialty,
      services_offered: [], services_needed: [], communities_served: []
    )
  end
end
