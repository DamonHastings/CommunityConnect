class Api::V1::MatchesController < ApplicationController
  before_action :authenticate_user!

  def show
    intake = current_user.user_intake_response

    unless intake
      return render json: { has_intake: false, needs_categories: [], organizations: [], opportunities: [] }
    end

    service = ::MatchingService.new(intake)
    orgs    = service.matched_organizations
    opps    = service.matched_opportunities(orgs.map(&:id))

    render json: {
      has_intake:       true,
      needs_categories: intake.needs_categories,
      organizations:    orgs.map { |o| serialize_org(o) },
      opportunities:    opps.map { |op| serialize_opp(op) }
    }
  end

  private

  def serialize_org(org)
    OrganizationSerializer.new(org).serializable_hash[:data][:attributes]
  end

  def serialize_opp(opp)
    EngagementOpportunitySerializer.new(opp).serializable_hash[:data][:attributes]
  end
end
