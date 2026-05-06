class Api::V1::OrgFollowersController < ApplicationController
  before_action :authenticate_user!

  def create
    org = Organization.find(params[:organization_id])
    current_user.org_followers.find_or_create_by!(organization: org)
    render json: { followed: true }
  rescue ActiveRecord::RecordInvalid
    render json: { followed: true }
  end

  def destroy
    org = Organization.find(params[:organization_id])
    current_user.org_followers.find_by(organization: org)&.destroy
    render json: { followed: false }
  end
end
