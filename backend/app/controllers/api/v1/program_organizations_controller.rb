class Api::V1::ProgramOrganizationsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_program

  def index
    render json: {
      organizations: @program.program_organizations.includes(:organization).map do |po|
        { id: po.organization_id, name: po.organization.name, role: po.role }
      end
    }
  end

  def create
    org = Organization.find(params[:organization_id])
    po = @program.program_organizations.build(organization: org, role: params[:role] || :partner)
    authorize po, policy_class: ProgramOrganizationPolicy
    if po.save
      render json: { organization: { id: org.id, name: org.name, role: po.role } }, status: :created
    else
      render json: { errors: po.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    po = @program.program_organizations.find_by!(organization_id: params[:id])
    authorize po, policy_class: ProgramOrganizationPolicy
    po.destroy
    head :no_content
  end

  private

  def set_program
    @program = Program.find(params[:program_id])
  end
end
