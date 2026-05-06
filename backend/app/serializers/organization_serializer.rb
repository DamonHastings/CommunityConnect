class OrganizationSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :description, :mission, :category, :org_type, :featured, :website,
             :contact_email, :phone, :address, :city, :state, :zip, :country,
             :latitude, :longitude, :status, :verified, :created_at

  attribute :member_count do |org|
    org.users.count
  end

  attribute :open_opportunity_count do |org|
    org.engagement_opportunities.open_opportunities.count
  end

  attribute :primary_admin do |org|
    admin = org.organization_memberships.admin.includes(:user).first
    admin ? { id: admin.user_id, name: admin.user.full_name } : nil
  end

  attribute :follower_count do |org|
    org.org_followers.count
  end

end
