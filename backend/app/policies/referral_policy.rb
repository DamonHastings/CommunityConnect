class ReferralPolicy < ApplicationPolicy
  def create?
    user.admin_of?(record.referring_org) ||
      (user.resource_navigator? && user.member_of?(record.referring_org))
  end

  def update?
    record.referred_user_id == user.id
  end
end
