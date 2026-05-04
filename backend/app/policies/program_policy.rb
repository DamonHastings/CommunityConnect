class ProgramPolicy < ApplicationPolicy
  def create?
    user.present? && user.member_of?(record.organization)
  end

  def update?
    user.present? && co_orgs.any? { |org| user.member_of?(org) }
  end

  def destroy?
    user.present? && co_orgs.any? { |org| user.admin_of?(org) }
  end

  private

  def co_orgs
    [record.organization] + record.co_organizations.to_a
  end
end
