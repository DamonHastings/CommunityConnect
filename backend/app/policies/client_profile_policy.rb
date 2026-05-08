class ClientProfilePolicy < ApplicationPolicy
  def create?
    user.present? && user.advocate?
  end

  def update?
    user.present? && record.advocate_id == user.id
  end

  def destroy?
    user.present? && record.advocate_id == user.id
  end
end
