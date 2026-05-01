class UserSerializer
  include JSONAPI::Serializer

  attributes :id, :email, :first_name, :last_name, :platform_admin, :created_at

  attribute :full_name do |user|
    user.full_name
  end

  attribute :organizations do |user|
    user.organizations.map do |org|
      membership = user.organization_memberships.find { |m| m.organization_id == org.id }
      { id: org.id, name: org.name, role: membership&.role }
    end
  end
end
