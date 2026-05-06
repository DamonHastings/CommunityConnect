class UserSerializer
  include JSONAPI::Serializer

  attributes :id, :email, :first_name, :last_name, :platform_admin, :created_at,
             :bio, :phone, :city, :state, :website, :availability,
             :services_offered, :services_needed, :specialty, :communities_served

  attribute :profile_type do |user|
    user.profile_type
  end

  attribute :full_name do |user|
    user.full_name
  end

  attribute :intake_completed do |user|
    user.profile_type == 'individual_seeker' ? user.user_intake_response.present? : nil
  end

  attribute :organizations do |user|
    user.organizations.map do |org|
      membership = user.organization_memberships.find { |m| m.organization_id == org.id }
      { id: org.id, name: org.name, role: membership&.role }
    end
  end

  attribute :saved_org_ids do |user|
    user.saved_organizations.pluck(:organization_id)
  end

  attribute :followed_org_ids do |user|
    user.org_followers.pluck(:organization_id)
  end
end
