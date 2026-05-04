class Api::V1::PartnerConnectionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_organization, only: [:index, :create]
  before_action :set_connection, only: [:update, :destroy]

  def index
    connections = PartnerConnection.includes(:requester_org, :target_org)
      .where("requester_org_id = ? OR target_org_id = ?", @organization.id, @organization.id)
    connections = connections.where(status: params[:status]) if params[:status].present?
    render json: { partner_connections: serialize_connections(connections) }
  end

  def create
    connection = PartnerConnection.new(
      requester_org: @organization,
      target_org_id: params[:target_org_id],
      message: params[:message]
    )
    authorize connection
    if connection.save
      render json: { partner_connection: serialize_connection(connection) }, status: :created
    else
      render json: { errors: connection.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @connection
    if @connection.update(status: params[:status])
      render json: { partner_connection: serialize_connection(@connection) }
    else
      render json: { errors: @connection.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @connection
    @connection.destroy
    head :no_content
  end

  private

  def set_organization
    @organization = Organization.find(params[:organization_id])
  end

  def set_connection
    @connection = PartnerConnection.includes(:requester_org, :target_org).find(params[:id])
  end

  def serialize_connection(pc)
    PartnerConnectionSerializer.new(pc).serializable_hash[:data][:attributes].merge(id: pc.id)
  end

  def serialize_connections(pcs)
    pcs.map { |pc| serialize_connection(pc) }
  end
end
