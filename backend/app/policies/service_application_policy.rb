class ServiceApplicationPolicy < ApplicationPolicy
  def create? = user.present?

  def update?
    return false unless user.present?
    user.id == record.user_id || user.admin_of?(record.engagement_opportunity.organization)
  end

  def destroy? = user.present? && user.id == record.user_id
end
