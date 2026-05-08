class ClientProfileSerializer
  include JSONAPI::Serializer

  attributes :id, :first_name, :last_name, :email, :phone, :city, :state,
             :housing_status, :employment_status, :needs_categories,
             :urgency, :goals, :barriers, :notes, :created_at

  attribute :full_name do |profile|
    profile.full_name
  end

  attribute :application_count do |profile|
    profile.client_applications.size
  end
end
