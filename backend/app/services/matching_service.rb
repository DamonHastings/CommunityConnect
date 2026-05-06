class MatchingService
  NEEDS_TO_CATEGORIES = {
    "food_nutrition"        => ["food_bank"],
    "housing_shelter"       => ["shelter", "housing"],
    "healthcare"            => ["healthcare"],
    "mental_health"         => ["mental_health"],
    "education"             => ["education"],
    "childcare"             => ["youth_services"],
    "substance_use_support" => ["mental_health", "healthcare"],
    "other"                 => ["other"]
  }.freeze

  TEXT_SEARCH_NEEDS = {
    "job_training"         => "job employment training career workforce",
    "transportation"       => "transportation transit ride",
    "legal_aid"            => "legal law attorney justice",
    "financial_assistance" => "financial assistance emergency fund benefit"
  }.freeze

  NEEDS_TO_PROGRAM_TYPES = {
    "job_training"          => ["job_training", "mentorship", "workshop"],
    "education"             => ["tutoring", "workshop", "summer_program", "mentorship"],
    "mental_health"         => ["mentorship", "workshop", "other"],
    "food_nutrition"        => ["community_event", "other"],
    "housing_shelter"       => ["workshop", "other"],
    "healthcare"            => ["workshop", "other"],
    "childcare"             => ["summer_program", "community_event"],
    "substance_use_support" => ["mentorship", "workshop"],
    "other"                 => ["other"]
  }.freeze

  def initialize(intake)
    @intake = intake
    @needs  = intake.needs_categories
  end

  def matched_organizations(limit: 6)
    return [] if @needs.empty?

    target_categories = @needs.flat_map { |n| NEEDS_TO_CATEGORIES[n] || [] }.uniq
    search_terms      = @needs.flat_map { |n| TEXT_SEARCH_NEEDS[n]&.split || [] }.uniq

    matched_ids = []
    matched_ids.concat(Organization.active.where(category: target_categories).pluck(:id)) if target_categories.any?
    matched_ids.concat(Organization.active.search_by_text(search_terms.join(" ")).pluck(:id)) if search_terms.any?
    matched_ids.uniq!

    return [] if matched_ids.empty?

    orgs = Organization.active.where(id: matched_ids).includes(:engagement_opportunities)

    orgs.map do |org|
      score      = @needs.sum { |n| (NEEDS_TO_CATEGORIES[n] || []).include?(org.category) ? 1 : 0 }
      open_count = org.engagement_opportunities.count { |op| op.status == "open" }
      [org, score, open_count]
    end
      .sort_by { |_, score, open_count| [-score, -open_count] }
      .first(limit)
      .map(&:first)
  end

  def matched_programs(limit: 5)
    return [] if @needs.empty?

    target_types = @needs.flat_map { |n| NEEDS_TO_PROGRAM_TYPES[n] || [] }.uniq

    return [] if target_types.empty?

    Program
      .where(status: [:published, :active])
      .where(program_type: target_types)
      .includes(:organization)
      .order(created_at: :desc)
      .limit(limit)
  end

  def matched_opportunities(org_ids, limit: 5)
    return EngagementOpportunity.none if org_ids.empty?

    EngagementOpportunity
      .open_opportunities
      .where(organization_id: org_ids)
      .includes(:organization)
      .order(created_at: :desc)
      .limit(limit)
  end
end
