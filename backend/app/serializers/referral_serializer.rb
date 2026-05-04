class ReferralSerializer
  include JSONAPI::Serializer

  attributes :status, :message, :created_at

  attribute :referring_org do |r|
    { id: r.referring_org_id, name: r.referring_org.name }
  end

  attribute :referred_user do |r|
    { id: r.referred_user_id, name: r.referred_user.full_name }
  end

  attribute :target do |r|
    next nil unless r.target_type && r.target_id
    target = r.target
    next nil unless target
    case r.target_type
    when "Program"
      { type: "Program", id: target.id, title: target.title }
    when "Organization"
      { type: "Organization", id: target.id, name: target.name }
    end
  end
end
