class Api::V1::FeedController < ApplicationController
  before_action :authenticate_user!

  LOOKBACK = 30.days

  def index
    user_org_ids = current_user.organizations.pluck(:id)

    partner_org_ids = PartnerConnection.accepted
      .where("requester_org_id IN (?) OR target_org_id IN (?)", user_org_ids, user_org_ids)
      .flat_map { |pc| [pc.requester_org_id, pc.target_org_id] }
      .uniq
      .then { |ids| ids - user_org_ids }

    connected_org_ids = (user_org_ids + partner_org_ids).uniq

    items = []

    # New opportunities
    EngagementOpportunity
      .where("created_at > ?", LOOKBACK.ago)
      .includes(:organization)
      .each do |opp|
        items << {
          type: "new_opportunity",
          id: "opportunity_#{opp.id}",
          title: opp.title,
          body: opp.description&.truncate(140),
          org_name: opp.organization.name,
          org_id: opp.organization_id,
          url: "/opportunities/#{opp.id}",
          tag: connection_tag(opp.organization_id, user_org_ids, partner_org_ids),
          created_at: opp.created_at,
        }
      end

    # New programs
    Program
      .where("created_at > ?", LOOKBACK.ago)
      .includes(:organization)
      .each do |prog|
        org = prog.organization
        next unless org
        items << {
          type: "new_program",
          id: "program_#{prog.id}",
          title: prog.title,
          body: prog.description&.truncate(140),
          org_name: org.name,
          org_id: org.id,
          url: "/programs/#{prog.id}",
          tag: connection_tag(org.id, user_org_ids, partner_org_ids),
          created_at: prog.created_at,
        }
      end

    # Announcements
    Announcement
      .where("created_at > ?", LOOKBACK.ago)
      .includes(:organization)
      .each do |ann|
        items << {
          type: "announcement",
          id: "announcement_#{ann.id}",
          title: ann.title,
          body: ann.body&.truncate(140),
          org_name: ann.organization.name,
          org_id: ann.organization_id,
          url: "/organizations/#{ann.organization_id}",
          tag: connection_tag(ann.organization_id, user_org_ids, partner_org_ids),
          created_at: ann.created_at,
        }
      end

    # Application status updates for this user
    ServiceApplication
      .where(user: current_user)
      .where.not(status: :pending)
      .where("updated_at > ?", LOOKBACK.ago)
      .includes(engagement_opportunity: :organization)
      .each do |app|
        opp = app.engagement_opportunity
        items << {
          type: "application_update",
          id: "service_app_#{app.id}",
          title: "Application #{app.status.capitalize}",
          body: "Your application for \"#{opp.title}\" was #{app.status}.",
          org_name: opp.organization.name,
          org_id: opp.organization_id,
          url: "/my-services",
          tag: "yours",
          created_at: app.updated_at,
        }
      end

    ProgramApplication
      .where(user: current_user)
      .where.not(status: :pending)
      .where("updated_at > ?", LOOKBACK.ago)
      .includes(program: :organization)
      .each do |app|
        prog = app.program
        org = prog.organization
        items << {
          type: "application_update",
          id: "program_app_#{app.id}",
          title: "Application #{app.status.capitalize}",
          body: "Your application for the \"#{prog.title}\" program was #{app.status}.",
          org_name: org&.name || "Unknown org",
          org_id: org&.id,
          url: "/my-services",
          tag: "yours",
          created_at: app.updated_at,
        }
      end

    # Withdrawal notifications for org admins/members
    if user_org_ids.any?
      ServiceApplication
        .where(status: :withdrawn)
        .where("service_applications.updated_at > ?", LOOKBACK.ago)
        .joins(:engagement_opportunity)
        .where(engagement_opportunities: { organization_id: user_org_ids })
        .includes(:user, engagement_opportunity: :organization)
        .each do |app|
          opp = app.engagement_opportunity
          applicant = "#{app.user.first_name} #{app.user.last_name}".strip
          items << {
            type: "application_update",
            id: "withdrawal_#{app.id}",
            title: "Application Withdrawn",
            body: "#{applicant} withdrew their application for \"#{opp.title}\".",
            org_name: opp.organization.name,
            org_id: opp.organization_id,
            url: "/organizations/#{opp.organization_id}/manage",
            tag: "yours",
            created_at: app.updated_at,
          }
        end

      ProgramApplication
        .where(status: :withdrawn)
        .where("program_applications.updated_at > ?", LOOKBACK.ago)
        .joins(program: :program_organizations)
        .where(program_organizations: { organization_id: user_org_ids })
        .includes(:user, program: :organization)
        .each do |app|
          prog = app.program
          org = prog.organization
          next unless org
          applicant = "#{app.user.first_name} #{app.user.last_name}".strip
          items << {
            type: "application_update",
            id: "prog_withdrawal_#{app.id}",
            title: "Application Withdrawn",
            body: "#{applicant} withdrew their application for the \"#{prog.title}\" program.",
            org_name: org.name,
            org_id: org.id,
            url: "/organizations/#{org.id}/manage",
            tag: "yours",
            created_at: app.updated_at,
          }
        end
    end

    # Partner connection requests for user's orgs
    if user_org_ids.any?
      PartnerConnection
        .pending
        .where(target_org_id: user_org_ids)
        .where("created_at > ?", LOOKBACK.ago)
        .includes(:requester_org)
        .each do |pc|
          items << {
            type: "partner_request",
            id: "partner_#{pc.id}",
            title: "New Partner Request",
            body: "#{pc.requester_org.name} wants to connect as a partner.",
            org_name: pc.requester_org.name,
            org_id: pc.requester_org_id,
            url: "/organizations/#{pc.requester_org_id}",
            tag: "yours",
            created_at: pc.created_at,
          }
        end
    end

    # Referrals received
    Referral
      .where(referred_user: current_user)
      .where("created_at > ?", LOOKBACK.ago)
      .includes(:referring_org)
      .each do |ref|
        items << {
          type: "referral",
          id: "referral_#{ref.id}",
          title: "You received a referral",
          body: ref.message&.truncate(140) || "#{ref.referring_org.name} referred you to a resource.",
          org_name: ref.referring_org.name,
          org_id: ref.referring_org_id,
          url: "/my-services",
          tag: "yours",
          created_at: ref.created_at,
        }
      end

    # Referral acceptances visible to the referring org's members
    if user_org_ids.any?
      Referral
        .where(referring_org_id: user_org_ids, status: :accepted)
        .where("updated_at > ?", LOOKBACK.ago)
        .includes(:referred_user, :referring_org)
        .each do |ref|
          recipient_name = "#{ref.referred_user.first_name} #{ref.referred_user.last_name}".strip
          items << {
            type: "referral",
            id: "referral_accepted_#{ref.id}",
            title: "Referral Accepted",
            body: "#{recipient_name} accepted your referral.",
            org_name: ref.referring_org.name,
            org_id: ref.referring_org_id,
            url: "/my-services",
            tag: "yours",
            created_at: ref.updated_at,
          }
        end
    end

    # Sort: "yours" and connected items first within each time bucket, then by recency
    sorted = items.sort_by do |item|
      priority = case item[:tag]
                 when "yours" then 0
                 when "your_org" then 1
                 when "partner" then 2
                 else 3
                 end
      [priority, -item[:created_at].to_i]
    end

    render json: { feed: sorted.first(50) }
  end

  private

  def connection_tag(org_id, user_org_ids, partner_org_ids)
    if user_org_ids.include?(org_id)
      "your_org"
    elsif partner_org_ids.include?(org_id)
      "partner"
    end
  end
end
