class Api::V1::Auth::ProfilesController < ApplicationController
  before_action :authenticate_user!

  def show
    render json: {
      user: UserSerializer.new(current_user).serializable_hash[:data][:attributes]
    }
  end
end
