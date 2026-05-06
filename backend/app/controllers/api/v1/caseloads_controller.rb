class Api::V1::CaseloadsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_navigator!

  def index
    caseloads = current_user.caseloads.includes(:client).order(created_at: :desc)
    render json: { caseloads: caseloads.map { |c| serialize(c) } }
  end

  def create
    client = User.find(params[:client_id])
    caseload = current_user.caseloads.find_or_initialize_by(client: client)
    caseload.notes = params[:notes] if params[:notes]
    caseload.status = :active

    if caseload.save
      render json: { caseload: serialize(caseload) }, status: :created
    else
      render json: { errors: caseload.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    caseload = current_user.caseloads.find(params[:id])
    caseload.update!(caseload_params)
    render json: { caseload: serialize(caseload) }
  end

  def destroy
    current_user.caseloads.find(params[:id]).destroy
    head :no_content
  end

  private

  def require_navigator!
    render json: { error: "Not authorized" }, status: :forbidden unless current_user.resource_navigator?
  end

  def caseload_params
    params.permit(:notes, :status)
  end

  def serialize(caseload)
    {
      id: caseload.id,
      status: caseload.status,
      notes: caseload.notes,
      created_at: caseload.created_at,
      client: {
        id: caseload.client_id,
        name: caseload.client.full_name,
        email: caseload.client.email,
        profile_type: caseload.client.profile_type,
        city: caseload.client.city,
        state: caseload.client.state,
      },
    }
  end
end
