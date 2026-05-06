class ProgramSerializer
  include JSONAPI::Serializer

  attributes :id, :title, :description, :goals, :outcomes, :program_type, :status,
             :capacity, :city, :state, :remote, :contact_email,
             :application_opens_at, :application_closes_at,
             :starts_on, :ends_on, :created_at

  attribute :organization do |p|
    { id: p.organization_id, name: p.organization.name }
  end

  attribute :organizations do |p|
    p.program_organizations.includes(:organization).map do |po|
      { id: po.organization_id, name: po.organization.name, role: po.role }
    end
  end

  attribute :applications_open do |p|
    p.applications_open?
  end

  attribute :my_application do |p, params|
    next nil unless params[:current_user]
    app = p.program_applications.find_by(user_id: params[:current_user].id)
    app ? { id: app.id, status: app.status } : nil
  end
end
