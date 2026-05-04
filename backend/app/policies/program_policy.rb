class ProgramPolicy < ApplicationPolicy
  def create?
    user.present? && user.member_of?(record.organization)
  end

  def update?
    user.present? && user.member_of?(record.organization)
  end

  def destroy?
    user.present? && user.admin_of?(record.organization)
  end
end
