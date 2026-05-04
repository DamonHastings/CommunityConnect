class ProgramApplicationSerializer
  include JSONAPI::Serializer

  attributes :id, :status, :message, :notes, :created_at, :updated_at

  attribute :applicant do |app|
    { id: app.user_id, name: app.user.full_name, email: app.user.email }
  end

  attribute :program do |app|
    prog = app.program
    { id: prog.id, title: prog.title, organization: { id: prog.organization_id, name: prog.organization.name } }
  end
end
