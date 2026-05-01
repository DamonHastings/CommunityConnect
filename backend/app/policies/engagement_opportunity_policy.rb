class EngagementOpportunityPolicy < ApplicationPolicy
  def create? = user.present? && user.member_of?(record.organization)

  def update? = user.present? && user.member_of?(record.organization)

  def destroy? = user.present? && (user.admin_of?(record.organization) || user.platform_admin?)
end
