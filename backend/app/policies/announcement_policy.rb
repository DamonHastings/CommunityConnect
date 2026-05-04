class AnnouncementPolicy < ApplicationPolicy
  def create?
    user.present? && user.admin_of?(record.organization)
  end

  def destroy?
    user.present? && user.admin_of?(record.organization)
  end
end
