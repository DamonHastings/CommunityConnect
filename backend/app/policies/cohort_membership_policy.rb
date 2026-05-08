class CohortMembershipPolicy < ApplicationPolicy
  def create?
    user.present? && user.admin_of?(record.cohort.program.organization)
  end

  def destroy?
    user.present? && user.admin_of?(record.cohort.program.organization)
  end
end
