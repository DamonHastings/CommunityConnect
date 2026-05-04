class PartnerConnectionPolicy < ApplicationPolicy
  def create?
    user.admin_of?(record.requester_org)
  end

  def update?
    user.admin_of?(record.target_org)
  end

  def destroy?
    user.admin_of?(record.requester_org)
  end
end
