class ApplicationController < ActionController::API
  include Pundit::Authorization

  rescue_from Pundit::NotAuthorizedError, with: :forbidden
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  private

  def forbidden
    render json: { error: "Not authorized" }, status: :forbidden
  end

  def not_found
    render json: { error: "Not found" }, status: :not_found
  end
end
