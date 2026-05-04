class ConversationPolicy < ApplicationPolicy
  def show?
    record.participants.include?(user)
  end

  def create?
    user.present?
  end
end
