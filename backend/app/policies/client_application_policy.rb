class ClientApplicationPolicy < ApplicationPolicy
  def create?
    user.present? && record.client_profile.advocate_id == user.id
  end

  def update?
    user.present? && (
      record.client_profile.advocate_id == user.id ||
      user.admin_of?(record.program.organization)
    )
  end
end
