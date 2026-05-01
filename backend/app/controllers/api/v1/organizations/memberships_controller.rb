class Api::V1::Organizations::MembershipsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_organization

  def create
    authorize @organization, :manage_members?

    user = User.find_by!(email: params[:email])

    if @organization.organization_memberships.exists?(user: user)
      render json: { error: "User is already a member" }, status: :unprocessable_entity
      return
    end

    membership = @organization.organization_memberships.create!(
      user: user,
      role: params[:role] || :member,
      invited_by: current_user,
      joined_at: Time.current
    )

    render json: { membership: membership_data(membership) }, status: :created
  end

  def destroy
    authorize @organization, :manage_members?

    membership = @organization.organization_memberships.find_by!(user_id: params[:user_id])

    if membership.user == current_user
      render json: { error: "Cannot remove yourself from the organization" }, status: :unprocessable_entity
      return
    end

    membership.destroy
    head :no_content
  end

  private

  def set_organization
    @organization = Organization.find(params[:id])
  end

  def membership_data(membership)
    {
      id: membership.id,
      user_id: membership.user_id,
      user_name: membership.user.full_name,
      user_email: membership.user.email,
      role: membership.role,
      joined_at: membership.joined_at
    }
  end
end
