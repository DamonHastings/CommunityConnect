class OrganizationPolicy < ApplicationPolicy
  def create? = user.present?

  def update? = user_is_org_admin?

  def destroy? = user_is_org_admin? || user.platform_admin?

  def manage_members? = user_is_org_admin?

  private

  def user_is_org_admin?
    user.present? && user.admin_of?(record)
  end
end
