class Api::V1::ProgramsController < ApplicationController
  before_action :authenticate_user!, only: [:create, :update, :destroy]
  before_action :set_program, only: [:show, :update, :destroy]

  def index
    programs = if params[:organization_id].present?
      org = Organization.find(params[:organization_id])
      base = org.programs
      current_user&.member_of?(org) ? base : base.published_or_active
    else
      Program.published_or_active
    end

    programs = programs.by_type(params[:type]) if params[:type].present?
    programs = programs.where(remote: ActiveModel::Type::Boolean.new.cast(params[:remote])) if params.key?(:remote)

    programs = programs.includes(:organization, program_organizations: :organization)
      .order(created_at: :desc)
      .page(params[:page])
      .per(params[:per_page] || 20)

    render json: {
      programs: serialize_collection(programs),
      meta: pagination_meta(programs)
    }
  end

  def show
    if @program.draft? && !current_user&.member_of?(@program.organization)
      return render json: { error: "Not found" }, status: :not_found
    end
    render json: { program: serialize_with_user(@program) }
  end

  def create
    organization = Organization.find(params[:organization_id])
    program = organization.programs.build(program_params)
    authorize program

    if program.save
      render json: { program: serialize(program) }, status: :created
    else
      render json: { errors: program.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    authorize @program

    if @program.update(program_params)
      render json: { program: serialize(@program) }
    else
      render json: { errors: @program.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @program
    @program.destroy
    head :no_content
  end

  private

  def set_program
    @program = Program.includes(program_organizations: :organization).find(params[:id])
  end

  def program_params
    params.require(:program).permit(
      :title, :description, :goals, :outcomes, :program_type, :status,
      :capacity, :city, :state, :remote, :contact_email,
      :application_opens_at, :application_closes_at,
      :starts_on, :ends_on
    )
  end

  def serialize(program)
    ProgramSerializer.new(program).serializable_hash[:data][:attributes]
  end

  def serialize_with_user(program)
    ProgramSerializer.new(program, params: { current_user: current_user }).serializable_hash[:data][:attributes]
  end

  def serialize_collection(programs)
    ProgramSerializer.new(programs).serializable_hash[:data].map { |d| d[:attributes] }
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
