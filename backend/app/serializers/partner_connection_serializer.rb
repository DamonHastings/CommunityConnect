class PartnerConnectionSerializer
  include JSONAPI::Serializer

  attributes :status, :message, :created_at

  attribute :requester_org do |pc|
    admin = pc.requester_org.organization_memberships.admin.includes(:user).first
    { id: pc.requester_org_id, name: pc.requester_org.name, primary_admin_id: admin&.user_id }
  end

  attribute :target_org do |pc|
    admin = pc.target_org.organization_memberships.admin.includes(:user).first
    { id: pc.target_org_id, name: pc.target_org.name, primary_admin_id: admin&.user_id }
  end
end
