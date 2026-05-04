class Api::V1::OrganizationsController < ApplicationController
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  before_action :set_organization, only: [:show, :update, :destroy]

  def index
    organizations = Organization.all

    if params[:q].present?
      organizations = organizations.search_by_text(params[:q])
    end

    organizations = organizations.by_category(params[:category]) if params[:category].present?
    organizations = organizations.by_city(params[:city]) if params[:city].present?
    organizations = organizations.by_state(params[:state]) if params[:state].present?
    organizations = organizations.where(org_type: params[:org_type]) if params[:org_type].present?
    organizations = organizations.where(featured: true) if params[:featured].present?

    if params[:near].present? && params[:radius].present?
      lat, lng = params[:near].split(",").map(&:to_f)
      organizations = organizations.near([lat, lng], params[:radius].to_i)
    end

    organizations = organizations.page(params[:page]).per(params[:per_page] || 20)

    render json: {
      organizations: serialize_collection(organizations),
      meta: pagination_meta(organizations)
    }
  end

  def show
    render json: { organization: serialize(@organization) }
  end

  def create
    organization = Organization.new(organization_params.merge(creator: current_user, status: :active))
    authorize organization

    if organization.save
      organization.organization_memberships.create!(user: current_user, role: :admin)
      render json: { organization: serialize(organization) }, status: :created
    else
      render json: { errors: organization.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @organization

    if @organization.update(organization_params)
      render json: { organization: serialize(@organization) }
    else
      render json: { errors: @organization.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @organization
    @organization.destroy
    head :no_content
  end

  private

  def set_organization
    @organization = Organization.find(params[:id])
  end

  def organization_params
    params.require(:organization).permit(
      :name, :description, :mission, :category, :org_type, :website,
      :contact_email, :phone, :address, :city, :state, :zip, :country,
      *(current_user&.platform_admin? ? [:featured, :featured_until] : [])
    )
  end

  def serialize(org)
    OrganizationSerializer.new(org).serializable_hash[:data][:attributes]
  end

  def serialize_collection(orgs)
    OrganizationSerializer.new(orgs).serializable_hash[:data].map { |d| d[:attributes] }
  end

  def pagination_meta(collection)
    {
      current_page: collection.current_page,
      total_pages: collection.total_pages,
      total_count: collection.total_count,
      per_page: collection.limit_value
    }
  end
end
