class ProgramSerializer
  include JSONAPI::Serializer

  attributes :id, :title, :description, :goals, :program_type, :status,
             :capacity, :city, :state, :remote, :contact_email,
             :application_opens_at, :application_closes_at,
             :starts_on, :ends_on, :created_at

  attribute :organization do |p|
    { id: p.organization_id, name: p.organization.name }
  end

  attribute :applications_open do |p|
    p.applications_open?
  end
end
