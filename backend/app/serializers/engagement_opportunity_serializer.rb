class EngagementOpportunitySerializer
  include JSONAPI::Serializer

  attributes :id, :title, :description, :opportunity_type, :status,
             :remote, :start_date, :end_date, :requirements, :contact_email, :created_at

  attribute :organization do |opp|
    { id: opp.organization_id, name: opp.organization.name }
  end

  attribute :my_application do |opp, params|
    next nil unless params[:current_user]
    app = opp.service_applications.find_by(user_id: params[:current_user].id)
    app ? { id: app.id, status: app.status } : nil
  end
end
