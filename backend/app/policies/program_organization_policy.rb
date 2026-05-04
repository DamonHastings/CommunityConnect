class ProgramOrganizationPolicy < ApplicationPolicy
  def create?
    user.admin_of?(record.program.organization)
  end

  def destroy?
    user.admin_of?(record.program.organization)
  end
end
