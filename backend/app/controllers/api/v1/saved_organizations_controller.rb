class Api::V1::SavedOrganizationsController < ApplicationController
  before_action :authenticate_user!

  def index
    orgs = current_user.saved_orgs.includes(:engagement_opportunities)
    render json: { organizations: serialize_collection(orgs) }
  end

  def create
    current_user.saved_organizations.find_or_create_by!(organization_id: params[:organization_id])
    render json: { saved: true, organization_id: params[:organization_id].to_i }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    current_user.saved_organizations.find_by!(organization_id: params[:id])&.destroy
    head :no_content
  end

  private

  def serialize_collection(orgs)
    OrganizationSerializer.new(orgs).serializable_hash[:data].map { |d| d[:attributes] }
  end
end
