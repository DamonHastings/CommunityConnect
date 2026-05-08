class Api::V1::DemoCleanupsController < ApplicationController
  before_action :ensure_non_production!

  def create
    food_bank = Organization.find_by(name: "City Food Bank")
    youth_center = Organization.find_by(name: "Metro Youth Center")
    foundation = Organization.find_by(name: "Healthy Futures Foundation")
    biz_corp = Organization.find_by(name: "BizCorp Services")
    pantry_opp = food_bank&.engagement_opportunities&.find_by(title: "Weekend Food Pantry Volunteer")
    jason = User.find_by(email: "jason.intake3@example.com")

    if jason && pantry_opp
      ServiceApplication.find_by(user: jason, engagement_opportunity: pantry_opp)&.update!(
        status: :pending,
        notes: nil,
        award_amount: nil,
        disbursed: false
      )
    end

    User.where("email LIKE ?", "demo_seeker_%@example.com").destroy_all

    if food_bank
      food_bank.announcements.where(title: "Summer Volunteer Drive — Join Us!").destroy_all
      food_bank.engagement_opportunities.where(title: "Holiday Food Box Packing").destroy_all
    end

    if jason && food_bank
      SavedOrganization.where(user: jason, organization: food_bank).destroy_all
      OrgFollower.where(user: jason, organization: food_bank).destroy_all
    end

    refresh_feed_seed_data(food_bank, youth_center, foundation, biz_corp)

    VolunteerHour.where(notes: "Community outreach morning shift").destroy_all

    navigator = User.find_by(email: "navigator@example.com")
    professional = User.find_by(email: "professional@example.com")
    Caseload.where(navigator: navigator, client: professional).destroy_all if navigator && professional
    Conversation.between(navigator, professional)&.destroy if navigator && professional

    nav_org = Organization.find_by(name: "Community Navigation Hub")
    if food_bank && nav_org
      PartnerConnection
        .where(requester_org: food_bank, target_org: nav_org)
        .or(PartnerConnection.where(requester_org: nav_org, target_org: food_bank))
        .destroy_all

      Notification
        .where(notification_type: :partner_request, actor_name: food_bank.name)
        .where("body LIKE ?", "%wants to connect as a partner%")
        .destroy_all
    end

    Conversation.between(navigator, jason)&.destroy if navigator && jason

    summer_program = Program.find_by(title: "Summer Job Training")
    if nav_org && jason && summer_program
      Referral.where(
        referring_org: nav_org,
        referred_user: jason,
        target_type: "Program",
        target_id: summer_program.id,
        message: "This program aligns perfectly with Jason's employment goals."
      ).destroy_all
    end

    Notification.where(title: "Application Approved").where("body LIKE ?", "%Weekend Food Pantry Volunteer%").destroy_all
    Notification.where(title: "You received a referral").where("body LIKE ?", "%Summer Job Training%").destroy_all
    Notification.where(title: "New announcement from City Food Bank", body: "Summer Volunteer Drive — Join Us!").destroy_all
    Notification.where(title: "New opportunity from City Food Bank", body: "Holiday Food Box Packing").destroy_all

    # Clean up advocate demo users and their client profiles
    User.where("email LIKE ?", "demo_advocate_%@example.com").destroy_all

    # Clean up demo-created cohorts (keep the seeded "Spring 2026 Cohort")
    if youth_center
      youth_center_program_ids = youth_center.programs.pluck(:id)
      Cohort.where(program_id: youth_center_program_ids)
            .where.not(name: "Spring 2026 Cohort")
            .destroy_all
    end

    # Clean up demo-created milestones (keep only the three seeded ones)
    summer_program = Program.find_by(title: "Summer Job Training")
    if summer_program
      seeded_titles = ["Orientation", "Midpoint Check-In", "Graduation"]
      summer_program.program_milestones.where.not(title: seeded_titles).destroy_all

      if jason
        milestone_ids = summer_program.program_milestones.pluck(:id)
        MilestoneCompletion
          .where(milestone_id: milestone_ids)
          .where.not(user: jason)
          .destroy_all
      end
    end

    # Clean up demo-created tasks
    User.where("email LIKE ?", "demo_%@example.com").each do |u|
      u.user_tasks.destroy_all
    end
    jason&.user_tasks&.where(source_type: nil)&.destroy_all

    head :no_content
  end

  private

  def refresh_feed_seed_data(food_bank, youth_center, foundation, biz_corp)
    now = Time.current

    [food_bank, youth_center, foundation].compact.each do |org|
      org.engagement_opportunities.update_all(created_at: now, updated_at: now)
      org.programs.update_all(created_at: now, updated_at: now)
      org.announcements.update_all(created_at: now, updated_at: now, published_at: now)
    end

    if food_bank && youth_center
      PartnerConnection
        .where(requester_org: food_bank, target_org: youth_center, status: :accepted)
        .update_all(created_at: now, updated_at: now)
    end

    if biz_corp && food_bank
      PartnerConnection
        .where(requester_org: biz_corp, target_org: food_bank, status: :pending)
        .update_all(created_at: now, updated_at: now)
    end
  end

  def ensure_non_production!
    head :not_found if Rails.env.production?
  end
end
