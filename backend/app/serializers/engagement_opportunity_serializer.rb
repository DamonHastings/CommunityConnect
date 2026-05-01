class EngagementOpportunitySerializer
  include JSONAPI::Serializer

  attributes :id, :title, :description, :opportunity_type, :status,
             :remote, :start_date, :end_date, :requirements, :contact_email, :created_at

  attribute :organization do |opp|
    { id: opp.organization_id, name: opp.organization.name }
  end
end
