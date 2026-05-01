class Api::V1::EngagementOpportunitiesController < ApplicationController
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  before_action :set_opportunity, only: [:show, :update, :destroy]

  def index
    opportunities = if params[:organization_id].present?
      Organization.find(params[:organization_id]).engagement_opportunities
    else
      EngagementOpportunity.all
    end

    opportunities = opportunities.by_type(params[:type]) if params[:type].present?
    opportunities = opportunities.where(status: params[:status]) if params[:status].present?

    opportunities = opportunities.includes(:organization)
      .order(created_at: :desc)
      .page(params[:page])
      .per(params[:per_page] || 20)

    render json: {
      opportunities: serialize_collection(opportunities),
      meta: pagination_meta(opportunities)
    }
  end

  def show
    render json: { opportunity: serialize(@opportunity) }
  end

  def create
    organization = Organization.find(params[:organization_id])
    opportunity = organization.engagement_opportunities.build(opportunity_params)
    authorize opportunity

    if opportunity.save
      render json: { opportunity: serialize(opportunity) }, status: :created
    else
      render json: { errors: opportunity.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @opportunity

    if @opportunity.update(opportunity_params)
      render json: { opportunity: serialize(@opportunity) }
    else
      render json: { errors: @opportunity.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @opportunity
    @opportunity.destroy
    head :no_content
  end

  private

  def set_opportunity
    @opportunity = EngagementOpportunity.find(params[:id])
  end

  def opportunity_params
    params.require(:opportunity).permit(
      :title, :description, :opportunity_type, :status,
      :remote, :start_date, :end_date, :requirements, :contact_email
    )
  end

  def serialize(opp)
    EngagementOpportunitySerializer.new(opp).serializable_hash[:data][:attributes]
  end

  def serialize_collection(opps)
    EngagementOpportunitySerializer.new(opps).serializable_hash[:data].map { |d| d[:attributes] }
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
