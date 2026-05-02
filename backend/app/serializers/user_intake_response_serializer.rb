class UserIntakeResponseSerializer
  include JSONAPI::Serializer

  attributes :id, :user_id, :needs_categories, :goals, :barriers, :preferred_contact, :created_at, :updated_at

  attribute :housing_status do |r|
    r.housing_status
  end

  attribute :employment_status do |r|
    r.employment_status
  end

  attribute :urgency do |r|
    r.urgency
  end
end
