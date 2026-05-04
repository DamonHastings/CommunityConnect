class PartnerConnectionSerializer
  include JSONAPI::Serializer

  attributes :status, :message, :created_at

  attribute :requester_org do |pc|
    { id: pc.requester_org_id, name: pc.requester_org.name }
  end

  attribute :target_org do |pc|
    { id: pc.target_org_id, name: pc.target_org.name }
  end
end
