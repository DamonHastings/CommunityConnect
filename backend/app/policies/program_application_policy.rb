class ProgramApplicationPolicy < ApplicationPolicy
  def create? = user.present?

  def update?
    return false unless user.present?
    user.id == record.user_id || user.admin_of?(record.program.organization)
  end

  def destroy? = user.present? && user.id == record.user_id

  def view_applications?
    user.present? && user.admin_of?(record)
  end
end
