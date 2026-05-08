class CohortPolicy < ApplicationPolicy
  def create?
    user.present? && user.admin_of?(record.program.organization)
  end

  def update?
    user.present? && user.admin_of?(record.program.organization)
  end

  def destroy?
    user.present? && user.admin_of?(record.program.organization)
  end
end
