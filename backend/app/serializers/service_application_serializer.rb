class ServiceApplicationSerializer
  include JSONAPI::Serializer

  attributes :id, :status, :message, :notes, :created_at, :updated_at

  attribute :applicant do |app|
    { id: app.user_id, name: app.user.full_name, email: app.user.email }
  end

  attribute :opportunity do |app|
    opp = app.engagement_opportunity
    { id: opp.id, title: opp.title, organization: { id: opp.organization_id, name: opp.organization.name } }
  end

  attribute :applicant_org do |app|
    app.applicant_org ? { id: app.applicant_org_id, name: app.applicant_org.name } : nil
  end
end
