class OrganizationSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :description, :mission, :category, :website,
             :contact_email, :phone, :address, :city, :state, :zip, :country,
             :latitude, :longitude, :status, :verified, :created_at

  attribute :member_count do |org|
    org.users.count
  end

  attribute :open_opportunity_count do |org|
    org.engagement_opportunities.open_opportunities.count
  end
end
