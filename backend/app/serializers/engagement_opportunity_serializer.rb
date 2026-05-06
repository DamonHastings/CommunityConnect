class EngagementOpportunitySerializer
  include JSONAPI::Serializer

  attributes :id, :title, :description, :opportunity_type, :status,
             :remote, :start_date, :end_date, :requirements, :contact_email,
             :funding_amount, :eligibility, :created_at

  attribute :organization do |opp|
    {
      id: opp.organization_id,
      name: opp.organization.name,
      city: opp.organization.city,
      state: opp.organization.state,
    }
  end

  attribute :my_application do |opp, params|
    next nil unless params[:current_user]
    app = opp.service_applications.find_by(user_id: params[:current_user].id)
    app ? { id: app.id, status: app.status } : nil
  end
end
