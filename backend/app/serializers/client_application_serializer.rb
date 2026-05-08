class ClientApplicationSerializer
  include JSONAPI::Serializer

  attributes :id, :client_profile_id, :program_id, :status, :message, :notes, :created_at

  attribute :program do |app|
    { id: app.program_id, title: app.program.title }
  end

  attribute :client_profile do |app|
    { id: app.client_profile_id, full_name: app.client_profile.full_name }
  end
end
