# frozen_string_literal: true
# Idempotent seed data for all personas. Run with: rails db:seed

puts "Seeding CommunityConnect..."

# ── 1. Users ──────────────────────────────────────────────────────────────────

carol = User.find_or_create_by!(email: "carol@example.com") do |u|
  u.first_name   = "Carol"
  u.last_name    = "Admin"
  u.password     = "password123"
  u.profile_type = :community_org
  u.bio          = "Community organizer with 10 years of experience connecting people with resources."
  u.city         = "Portland"
  u.state        = "OR"
end

jason = User.find_or_create_by!(email: "jason.intake3@example.com") do |u|
  u.first_name   = "Jason"
  u.last_name    = "Seeker"
  u.password     = "password123"
  u.profile_type = :individual_seeker
  u.city         = "Portland"
  u.state        = "OR"
end

volunteer_user = User.find_or_create_by!(email: "volunteer@example.com") do |u|
  u.first_name   = "Val"
  u.last_name    = "Volunteer"
  u.password     = "password123"
  u.profile_type = :volunteer
  u.bio          = "Passionate about community service and food security."
  u.availability = "weekends"
  u.city         = "Portland"
  u.state        = "OR"
end

navigator_user = User.find_or_create_by!(email: "navigator@example.com") do |u|
  u.first_name   = "Nina"
  u.last_name    = "Navigator"
  u.password     = "password123"
  u.profile_type = :resource_navigator
  u.bio          = "Certified resource navigator helping community members access services."
  u.city         = "Portland"
  u.state        = "OR"
end

professional_user = User.find_or_create_by!(email: "professional@example.com") do |u|
  u.first_name      = "Pete"
  u.last_name       = "Professional"
  u.password        = "password123"
  u.profile_type    = :individual_professional
  u.bio             = "Licensed social worker specializing in housing and employment services."
  u.specialty       = "Social Work"
  u.services_offered = ["job_training", "mentorship"]
  u.city            = "Portland"
  u.state           = "OR"
end

biz_user = User.find_or_create_by!(email: "biz@example.com") do |u|
  u.first_name   = "Blake"
  u.last_name    = "Business"
  u.password     = "password123"
  u.profile_type = :business_service_provider
  u.bio          = "Small business owner offering workforce development partnerships."
  u.city         = "Portland"
  u.state        = "OR"
end

seeker2 = User.find_or_create_by!(email: "seeker2@example.com") do |u|
  u.first_name   = "Sam"
  u.last_name    = "Seeker"
  u.password     = "password123"
  u.profile_type = :individual_seeker
  u.city         = "Portland"
  u.state        = "OR"
end

# seeker3 has NO intake — used to test the intake redirect flow
User.find_or_create_by!(email: "seeker3@example.com") do |u|
  u.first_name   = "Sara"
  u.last_name    = "NewSeeker"
  u.password     = "password123"
  u.profile_type = :individual_seeker
  u.city         = "Portland"
  u.state        = "OR"
end

puts "  #{User.count} users"

# ── 2. Organizations ──────────────────────────────────────────────────────────

food_bank = Organization.find_or_create_by!(name: "City Food Bank") do |o|
  o.category      = :food_bank
  o.org_type      = :nonprofit
  o.status        = :active
  o.creator       = carol
  o.description   = "Providing emergency food assistance to families in need across Portland."
  o.mission       = "No one in our community should go hungry."
  o.contact_email = "info@cityfoodbank.org"
  o.phone         = "503-555-0101"
  o.city          = "Portland"
  o.state         = "OR"
  o.zip           ="97201"
  o.country       = "US"
end

youth_center = Organization.find_or_create_by!(name: "Metro Youth Center") do |o|
  o.category      = :youth_services
  o.org_type      = :nonprofit
  o.status        = :active
  o.creator       = carol
  o.description   = "Empowering youth through education, mentorship, and job training programs."
  o.mission       = "Every young person deserves opportunity."
  o.contact_email = "info@metroyouth.org"
  o.phone         = "503-555-0202"
  o.city          = "Portland"
  o.state         = "OR"
  o.zip           ="97202"
  o.country       = "US"
end

nav_org = Organization.find_or_create_by!(name: "Community Navigation Hub") do |o|
  o.category      = :other
  o.org_type      = :nonprofit
  o.status        = :active
  o.creator       = navigator_user
  o.description   = "Connecting individuals with the resources and services they need."
  o.mission       = "Bridging the gap between people and services."
  o.contact_email = "info@navhub.org"
  o.phone         = "503-555-0303"
  o.city          = "Portland"
  o.state         = "OR"
  o.zip           ="97203"
  o.country       = "US"
end

Organization.find_or_create_by!(name: "BizCorp Services") do |o|
  o.category      = :other
  o.org_type      = :business
  o.status        = :active
  o.creator       = biz_user
  o.description   = "Workforce development and corporate social responsibility partnerships."
  o.mission       = "Building stronger communities through business engagement."
  o.contact_email = "info@bizcorp.com"
  o.phone         = "503-555-0404"
  o.city          = "Portland"
  o.state         = "OR"
  o.zip           ="97204"
  o.country       = "US"
end

foundation = Organization.find_or_create_by!(name: "Healthy Futures Foundation") do |o|
  o.category      = :healthcare
  o.org_type      = :foundation
  o.status        = :active
  o.creator       = carol
  o.description   = "Funding community health initiatives and preventive care programs."
  o.mission       = "Investing in healthier communities for all."
  o.contact_email = "grants@healthyfutures.org"
  o.phone         = "503-555-0505"
  o.city          = "Portland"
  o.state         = "OR"
  o.zip           ="97205"
  o.country       = "US"
end

puts "  #{Organization.count} organizations"

# ── 3. Memberships ────────────────────────────────────────────────────────────

biz_corp = Organization.find_by!(name: "BizCorp Services")

[
  [carol,          food_bank,   :admin],
  [carol,          youth_center, :admin],
  [carol,          foundation,  :admin],
  [navigator_user, nav_org,     :admin],
  [biz_user,       biz_corp,    :admin],
].each do |user, org, role|
  OrganizationMembership.find_or_create_by!(user: user, organization: org) do |m|
    m.role      = role
    m.joined_at = Time.current
  end
end

puts "  #{OrganizationMembership.count} memberships"

# ── 4. Engagement Opportunities ───────────────────────────────────────────────

pantry_opp = EngagementOpportunity.find_or_create_by!(
  organization: food_bank,
  title: "Weekend Food Pantry Volunteer"
) do |o|
  o.opportunity_type = :volunteer
  o.status           = :open
  o.description      = "Help sort and distribute food donations every Saturday morning."
  o.requirements     = "Able to lift 25 lbs. No experience needed."
  o.contact_email    = "volunteer@cityfoodbank.org"
  o.remote           = false
  o.start_date       = Date.today + 1.week
  o.end_date         = Date.today + 12.weeks
end

EngagementOpportunity.find_or_create_by!(
  organization: food_bank,
  title: "Meal Delivery Driver"
) do |o|
  o.opportunity_type = :volunteer
  o.status           = :open
  o.description      = "Deliver prepared meals to homebound seniors on weekday afternoons."
  o.requirements     = "Valid driver's license and reliable vehicle."
  o.contact_email    = "volunteer@cityfoodbank.org"
  o.remote           = false
  o.start_date       = Date.today + 1.week
  o.end_date         = Date.today + 12.weeks
end

EngagementOpportunity.find_or_create_by!(
  organization: food_bank,
  title: "Corporate Partnership Opportunity"
) do |o|
  o.opportunity_type = :partnership
  o.status           = :open
  o.description      = "Partner with us to sponsor food drives and community events."
  o.contact_email    = "partnerships@cityfoodbank.org"
  o.remote           = false
  o.start_date       = Date.today + 2.weeks
  o.end_date         = Date.today + 52.weeks
end

EngagementOpportunity.find_or_create_by!(
  organization: youth_center,
  title: "Youth Mentorship Opportunity"
) do |o|
  o.opportunity_type = :mentorship
  o.status           = :open
  o.description      = "Mentor a young person aged 14-18 for one hour per week."
  o.requirements     = "Background check required. Minimum 6-month commitment."
  o.contact_email    = "mentors@metroyouth.org"
  o.remote           = false
  o.start_date       = Date.today + 2.weeks
  o.end_date         = Date.today + 26.weeks
end

EngagementOpportunity.find_or_create_by!(
  organization: foundation,
  title: "Community Tech Resources Grant"
) do |o|
  o.opportunity_type = :funding
  o.status           = :open
  o.description      = "Grants of $5,000–$25,000 for nonprofits improving digital access."
  o.requirements     = "501(c)(3) status required. Applications due end of quarter."
  o.contact_email    = "grants@healthyfutures.org"
  o.remote           = true
  o.start_date       = Date.today
  o.end_date         = Date.today + 8.weeks
end

puts "  #{EngagementOpportunity.count} opportunities"

# ── 5. Programs ───────────────────────────────────────────────────────────────

summer_program = Program.find_or_create_by!(
  organization: youth_center,
  title: "Summer Job Training"
) do |p|
  p.program_type          = :job_training
  p.status                = :published
  p.description           = "10-week intensive job skills program for young adults aged 18-25."
  p.goals                 = "Participants will develop resume, interview, and workplace skills."
  p.application_opens_at  = 1.week.ago
  p.application_closes_at = 4.weeks.from_now
  p.starts_on             = Date.today + 6.weeks
  p.ends_on               = Date.today + 16.weeks
end

Program.find_or_create_by!(
  organization: youth_center,
  title: "Weekly Tutoring Program"
) do |p|
  p.program_type          = :tutoring
  p.status                = :active
  p.description           = "One-on-one and small group tutoring for K-12 students."
  p.goals                 = "Improve academic performance and build study habits."
  p.application_opens_at  = 1.week.ago
  p.application_closes_at = 4.weeks.from_now
  p.starts_on             = Date.today + 1.week
  p.ends_on               = Date.today + 20.weeks
end

puts "  #{Program.count} programs"

# ── 6. Intake Responses ───────────────────────────────────────────────────────

UserIntakeResponse.find_or_create_by!(user: jason) do |ir|
  ir.housing_status    = :at_risk
  ir.employment_status = :unemployed_seeking
  ir.needs_categories  = ["food_nutrition", "housing_shelter", "job_training"]
  ir.urgency           = :within_weeks
  ir.goals             = "Find stable housing and full-time employment."
  ir.barriers          = "No transportation, limited work history."
  ir.preferred_contact = "email"
end

UserIntakeResponse.find_or_create_by!(user: seeker2) do |ir|
  ir.housing_status    = :stable
  ir.employment_status = :unemployed_seeking
  ir.needs_categories  = ["job_training", "food_nutrition"]
  ir.urgency           = :within_months
  ir.goals             = "Find a job in the tech sector."
  ir.preferred_contact = "email"
end

puts "  #{UserIntakeResponse.count} intake responses"

# ── 7. Service Applications ───────────────────────────────────────────────────

vol_approved_app = ServiceApplication.find_or_create_by!(
  user: volunteer_user,
  engagement_opportunity: pantry_opp
) do |a|
  a.status  = :approved
  a.message = "I am available every Saturday and have experience in food distribution."
end

ServiceApplication.find_or_create_by!(
  user: jason,
  engagement_opportunity: pantry_opp
) do |a|
  a.status  = :pending
  a.message = "I would love to help on weekends. Flexible schedule."
end

puts "  #{ServiceApplication.count} service applications"

# ── 8. Program Applications ───────────────────────────────────────────────────

ProgramApplication.find_or_create_by!(user: volunteer_user, program: summer_program) do |a|
  a.status  = :pending
  a.message = "Excited to develop job skills and career connections."
end

ProgramApplication.find_or_create_by!(user: jason, program: summer_program) do |a|
  a.status  = :approved
  a.message = "This program aligns perfectly with my career goals."
end

puts "  #{ProgramApplication.count} program applications"

# ── 9. Volunteer Hours ────────────────────────────────────────────────────────

VolunteerHour.find_or_create_by!(
  service_application: vol_approved_app,
  date: Date.today - 14
) do |h|
  h.hours = 4.0
  h.notes = "Sorting donations at the warehouse."
end

VolunteerHour.find_or_create_by!(
  service_application: vol_approved_app,
  date: Date.today - 7
) do |h|
  h.hours = 3.5
  h.notes = "Saturday distribution shift."
end

puts "  #{VolunteerHour.count} volunteer hour entries (total: #{VolunteerHour.sum(:hours)}h)"

# ── 10. Caseloads ─────────────────────────────────────────────────────────────

Caseload.find_or_create_by!(navigator: navigator_user, client: jason) do |c|
  c.status = :active
  c.notes  = "Needs food and housing resources. Follow up on job training referral."
end

Caseload.find_or_create_by!(navigator: navigator_user, client: seeker2) do |c|
  c.status = :active
  c.notes  = "Employment support case. Interested in tech sector opportunities."
end

puts "  #{Caseload.count} caseloads"

# ── 11. Referrals ─────────────────────────────────────────────────────────────

Referral.find_or_create_by!(referring_org: nav_org, referred_user: jason) do |r|
  r.target  = summer_program
  r.status  = :pending
  r.message = "Great fit for job training. Please reach out to Jason directly."
end

puts "  #{Referral.count} referrals"

# ── 12. Partner Connections ───────────────────────────────────────────────────

PartnerConnection.find_or_create_by!(
  requester_org: food_bank,
  target_org: youth_center
) do |pc|
  pc.status  = :accepted
  pc.message = "Excited to collaborate on youth food security programs."
end

PartnerConnection.find_or_create_by!(
  requester_org: biz_corp,
  target_org: food_bank
) do |pc|
  pc.status  = :pending
  pc.message = "We would love to sponsor your next food drive."
end

puts "  #{PartnerConnection.count} partner connections"

# ── 13. Announcements ────────────────────────────────────────────────────────

[
  [food_bank,   "Holiday Food Drive",           "We're collecting donations through December 31st. Drop-off at any location."],
  [youth_center, "Summer Program Applications Open", "Apply now for our Summer Job Training program — limited spots available!"],
  [nav_org,     "New Services Available",        "We now offer one-on-one navigation appointments. Schedule yours today."],
  [foundation,  "Grant Cycle Open",              "Applications for our Q2 community health grants are now being accepted."],
].each do |org, title, body|
  Announcement.find_or_create_by!(organization: org, title: title) do |a|
    a.body         = body
    a.published_at = 1.day.ago
  end
end

puts "  #{Announcement.count} announcements"

# ── 14. Advocate + Client Profiles ───────────────────────────────────────────

advocate_user = User.find_or_create_by!(email: "advocate@example.com") do |u|
  u.first_name   = "Alex"
  u.last_name    = "Advocate"
  u.password     = "password123"
  u.profile_type = :advocate
  u.bio          = "Social services advocate helping clients navigate housing and employment resources."
  u.city         = "Portland"
  u.state        = "OR"
end

maria = ClientProfile.find_or_create_by!(advocate: advocate_user, first_name: "Maria", last_name: "Santos") do |cp|
  cp.city             = "Portland"
  cp.state            = "OR"
  cp.housing_status   = :housed_at_risk
  cp.employment_status = :unemployed_seeking
  cp.needs_categories = ["food_nutrition", "housing_shelter"]
  cp.urgency          = :high
  cp.goals            = "Secure stable housing and food assistance before the end of the month."
  cp.barriers         = "No transportation, limited English proficiency."
end

ClientProfile.find_or_create_by!(advocate: advocate_user, first_name: "David", last_name: "Chen") do |cp|
  cp.city             = "Portland"
  cp.state            = "OR"
  cp.housing_status   = :housed_stable
  cp.employment_status = :unemployed_seeking
  cp.needs_categories = ["job_training"]
  cp.urgency          = :medium
  cp.goals            = "Find job training program in a tech-adjacent field."
  cp.barriers         = "Limited work history, recent career transition."
end

puts "  #{ClientProfile.count} client profiles"

# ── 15. Program Milestones ────────────────────────────────────────────────────

summer_program = Program.find_by!(title: "Summer Job Training")

orientation = ProgramMilestone.find_or_create_by!(program: summer_program, title: "Orientation") do |m|
  m.description = "Attend program orientation and meet your cohort."
  m.due_date    = summer_program.starts_on + 1.week
  m.position    = 0
end

ProgramMilestone.find_or_create_by!(program: summer_program, title: "Midpoint Check-In") do |m|
  m.description = "Complete midpoint skills assessment and meet with your advisor."
  m.due_date    = summer_program.starts_on + 5.weeks
  m.position    = 1
end

ProgramMilestone.find_or_create_by!(program: summer_program, title: "Graduation") do |m|
  m.description = "Present your job readiness portfolio and receive your certificate."
  m.due_date    = summer_program.ends_on
  m.position    = 2
end

puts "  #{ProgramMilestone.count} program milestones"

# ── 16. Cohort + Jason membership ─────────────────────────────────────────────

jason = User.find_by!(email: "jason.intake3@example.com")

spring_cohort = Cohort.find_or_create_by!(program: summer_program, name: "Spring 2026 Cohort") do |c|
  c.starts_on = summer_program.starts_on
  c.ends_on   = summer_program.ends_on
  c.notes     = "First cohort for the Summer Job Training program."
end

CohortMembership.find_or_create_by!(cohort: spring_cohort, user: jason)

puts "  #{Cohort.count} cohorts, #{CohortMembership.count} memberships"

# ── 17. Milestone Completion for Jason ───────────────────────────────────────

MilestoneCompletion.find_or_create_by!(milestone: orientation, user: jason) do |mc|
  mc.completed_at = 1.week.ago
  mc.notes        = "Attended orientation on time. Strong participant."
end

puts "  #{MilestoneCompletion.count} milestone completions"

puts "\nDone!"
puts "  #{User.count} users | #{Organization.count} orgs | #{EngagementOpportunity.count} opps | #{Program.count} programs"
puts "  #{ServiceApplication.count} service apps | #{ProgramApplication.count} program apps | #{VolunteerHour.sum(:hours)}h logged"
puts "  #{Caseload.count} caseloads | #{Referral.count} referrals | #{PartnerConnection.count} partner connections"
puts "  #{ClientProfile.count} client profiles | #{Cohort.count} cohorts | #{ProgramMilestone.count} milestones"
