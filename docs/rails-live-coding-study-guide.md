# Rails Live Coding Study Guide

Use this guide to prepare for a Ruby on Rails live-coding interview over the next week. The goal is not to memorize Rails trivia. The goal is to practice reading an existing Rails app, making small product-driven changes, explaining your choices, and verifying behavior with tests.

This guide uses CommunityConnect as the practice app. It is a Rails API with Devise/JWT authentication, Pundit authorization, JSONAPI serializers, Kaminari pagination, pg_search, Geocoder, RSpec, FactoryBot, and Shoulda Matchers.

## How To Practice

Work in short interview-style sessions:

1. Read the relevant files for 5-10 minutes.
2. Say the implementation plan out loud.
3. Write the smallest useful change.
4. Add or update tests.
5. Run the focused spec file.
6. Explain the tradeoffs and edge cases.

When practicing, prefer these commands from `backend`:

```sh
bundle exec rspec spec/models/engagement_opportunity_spec.rb
bundle exec rspec spec/requests/api/v1/engagement_opportunities_spec.rb
bundle exec rspec spec/requests/api/v1/organizations_spec.rb
bundle exec rubocop
```

If an interview gives you 30-45 minutes, do not try to build everything. State the end-to-end path, implement one valuable slice, and leave obvious extension points.

## App Map

Start by knowing where common work lives:

- Routes: `backend/config/routes.rb`
- Models: `backend/app/models/user.rb`, `backend/app/models/organization.rb`, `backend/app/models/engagement_opportunity.rb`, `backend/app/models/user_intake_response.rb`
- Controllers: `backend/app/controllers/api/v1`
- Authorization: `backend/app/policies/application_policy.rb`, `backend/app/policies/organization_policy.rb`, `backend/app/policies/engagement_opportunity_policy.rb`
- Serializers: `backend/app/serializers`
- Request helpers: `backend/spec/support/request_helpers.rb`
- Request specs: `backend/spec/requests/api/v1`
- Model specs: `backend/spec/models`
- Product roadmap: `docs/prioritized-features.md`

The most interview-relevant existing flow is engagement opportunities:

```text
request -> route -> controller -> strong params -> model validations/scopes -> policy -> serializer -> response spec
```

Practice tracing that flow before changing code.

## Day 1: Rails API Reading And Routing

Focus: Rails request lifecycle, REST routes, nested resources, controller shape.

Read:

- `backend/config/routes.rb`
- `backend/app/controllers/api/v1/engagement_opportunities_controller.rb`
- `backend/spec/requests/api/v1/engagement_opportunities_spec.rb`

Drills:

- Explain the difference between `GET /api/v1/opportunities` and `GET /api/v1/organizations/:organization_id/opportunities`.
- Add a new query filter to opportunities in practice, such as `remote=true`, then write request specs for true, false, and omitted values.
- Add a route for a custom collection endpoint, such as `GET /api/v1/opportunities/upcoming`, then explain when a scope plus filter is better than a custom route.

Interview narration practice:

- "I am going to start at the route, find the controller action, identify the data access, then add the smallest spec that captures the behavior."
- "Because this is an API, I care about status code, response shape, authorization, and edge cases."

## Day 2: Active Record Modeling

Focus: associations, enums, validations, scopes, migrations, and callbacks.

Read:

- `backend/app/models/user.rb`
- `backend/app/models/organization.rb`
- `backend/app/models/engagement_opportunity.rb`
- `backend/db/schema.rb`
- `backend/spec/models/engagement_opportunity_spec.rb`

Drills:

- Add a model-level validation that `end_date` cannot be before `start_date` for `EngagementOpportunity`.
- Add a scope like `remote_only` or `starting_after(date)` and test it.
- Explain why `Organization` has `has_many :users, through: :organization_memberships`.
- Explain the tradeoff of Rails enums backed by integers. Practice adding an enum value without reordering existing values.

Real-value exercise:

- Improve opportunity date handling:
  - Require `start_date` when an opportunity is `open`.
  - Reject an `end_date` earlier than `start_date`.
  - Add model specs for valid and invalid combinations.
  - Add request specs proving invalid input returns `422`.

What interviewers watch for:

- You avoid putting business rules only in controllers.
- You test model behavior independently from request behavior.
- You do not reorder integer enum values.

## Day 3: Authentication, Authorization, And Ownership

Focus: Devise/JWT request auth, current user, Pundit policies, membership rules.

Read:

- `backend/spec/support/request_helpers.rb`
- `backend/app/policies/application_policy.rb`
- `backend/app/policies/engagement_opportunity_policy.rb`
- `backend/app/controllers/api/v1/auth/sessions_controller.rb`
- `backend/app/controllers/api/v1/auth/profiles_controller.rb`

Drills:

- Explain how `auth_headers_for(user)` signs in a test user and captures the JWT authorization header.
- Add an authorization rule in a policy and prove it with request specs.
- Practice distinguishing `401 unauthorized` from `403 forbidden`.

Real-value exercise:

- Tighten opportunity deletion:
  - Only org admins or platform admins can delete.
  - Members can create and update.
  - Outsiders cannot create, update, or delete.
  - Tests should cover member, admin, outsider, platform admin, and unauthenticated user.

Follow-up questions to practice:

- Where should ownership logic live?
- How would this change if organizations had multiple admin roles?
- What should happen if the organization no longer exists?

## Day 4: Serialization, Pagination, And API Shape

Focus: response contracts, JSON shape, includes, pagination metadata, avoiding accidental N+1 queries.

Read:

- `backend/app/serializers/engagement_opportunity_serializer.rb`
- `backend/app/serializers/organization_serializer.rb`
- `backend/app/controllers/api/v1/engagement_opportunities_controller.rb`

Drills:

- Add a serialized field to opportunities, such as `organization_name`.
- Add request specs that assert the field exists without over-specifying the whole payload.
- Explain why the controller uses `includes(:organization)` before serializing collections.
- Practice adding pagination defaults and maximum `per_page` behavior.

Real-value exercise:

- Improve opportunity listings:
  - Include organization summary data in each opportunity response.
  - Keep the existing pagination metadata.
  - Add request specs for response shape.
  - Explain whether this belongs in the serializer or controller.

What interviewers watch for:

- You treat JSON responses as public contracts.
- You avoid brittle tests that assert every field unless necessary.
- You consider query count when serializing associations.

## Day 5: Search, Filtering, And Matching

Focus: scopes, query params, service objects, product-driven matching behavior.

Read:

- `backend/app/models/organization.rb`
- `backend/app/controllers/api/v1/organizations_controller.rb`
- `backend/app/controllers/api/v1/matches_controller.rb`
- `backend/app/controllers/api/v1/intake_responses_controller.rb`

Drills:

- Trace how intake responses feed the matching endpoint.
- Add a simple filter to an existing index action.
- Practice normalizing query params safely, such as case-insensitive city/state filters.
- Explain why matching logic belongs in a service object instead of a controller.

Real-value exercise:

- Improve service matching:
  - Add a filter that only returns open upcoming opportunities.
  - Prefer opportunities whose type aligns with the user's `needs_categories`.
  - Keep the controller thin.
  - Add service-level specs if a service spec exists, or request specs around `GET /api/v1/matches`.

Follow-up questions to practice:

- How would you rank matches?
- How would you test matching without relying on external services?
- How would you handle no intake response?

## Day 6: Building A Small Feature End To End

Focus: migrations, models, routes, controllers, policies, serializers, request specs.

Choose one product feature from `docs/prioritized-features.md` and implement a small slice. Do not build the entire feature.

Recommended feature: service applications.

Minimal slice:

- A user can apply to an engagement opportunity.
- An opportunity has many applications.
- A user cannot apply to the same opportunity twice.
- The applicant can view their own applications.
- Organization admins can view applications for their opportunities.

Suggested model:

```ruby
ServiceApplication
  belongs_to :user
  belongs_to :engagement_opportunity
  enum :status, { submitted: 0, under_review: 1, accepted: 2, rejected: 3 }
```

Suggested endpoints:

```text
POST /api/v1/opportunities/:opportunity_id/applications
GET /api/v1/applications
GET /api/v1/opportunities/:opportunity_id/applications
PATCH /api/v1/applications/:id
```

Implementation order:

1. Write the migration and model.
2. Add associations and validations.
3. Add factories and model specs.
4. Add routes.
5. Add controller actions and strong params.
6. Add policy rules.
7. Add serializer.
8. Add request specs for happy path, duplicate application, unauthorized access, and status updates.

Interview simplification:

- If time is short, implement only `POST /api/v1/opportunities/:opportunity_id/applications` plus the model validation and request specs.
- Say what you would build next.

## Day 7: Mock Interviews And Polish

Focus: speed, communication, debugging, and finishing cleanly.

Run two mock sessions.

Session A, 35 minutes:

- Prompt: "Add filtering to `GET /api/v1/opportunities` so clients can request only remote opportunities and only upcoming opportunities."
- Expected work:
  - Add model scope or controller query.
  - Add request specs.
  - Preserve existing type/status filters.
  - Explain blank/missing param behavior.

Session B, 45 minutes:

- Prompt: "Users should be able to save organizations they are interested in and list their saved organizations."
- Expected work:
  - Add join model.
  - Add uniqueness validation.
  - Add routes and controller.
  - Add policy or ownership checks.
  - Add request specs.

Final review checklist:

- Can you explain each association in the app?
- Can you add a route and find it with `rails routes`?
- Can you write a request spec with authenticated headers?
- Can you add a validation and test both valid and invalid cases?
- Can you explain `401`, `403`, `404`, and `422` in this API?
- Can you keep a controller action small?
- Can you narrate tradeoffs while coding?

## Product Exercises

Use these exercises when you want more practice after the 7-day schedule.

### Exercise 1: Opportunity Filters

Build filters for opportunity listings:

- `remote`
- `upcoming`
- `type`
- `status`
- `organization_id`

Acceptance criteria:

- Filters compose correctly.
- Invalid enum values return a useful error or are handled consistently.
- Pagination metadata still reflects the filtered relation.
- Request specs cover combined filters.

Skills practiced:

- Scopes
- Query params
- Controller composition
- Request specs

### Exercise 2: Organization Member Management

Improve organization membership behavior:

- Admins can add members.
- Admins can remove members.
- Non-admin members cannot remove users.
- A user cannot be added twice.

Acceptance criteria:

- Model uniqueness exists at validation and database levels.
- Policy checks use existing `admin_of?` or membership helpers.
- Request specs cover admin, member, outsider, and unauthenticated access.

Skills practiced:

- Join models
- Authorization
- Database constraints
- Error responses

### Exercise 3: Individual Dashboard

Build a dashboard endpoint for signed-in individual users:

```text
GET /api/v1/dashboard
```

Response should include:

- The current user's profile summary.
- Their intake response status.
- Their matched organizations.
- Their matched opportunities.

Acceptance criteria:

- Requires authentication.
- Returns empty arrays when intake is missing.
- Reuses existing matching logic.
- Has request specs for user with and without intake.

Skills practiced:

- Controller orchestration
- Current user data
- Serializer reuse
- Service objects

### Exercise 4: Program Management Slice

The roadmap says programs should eventually be richer than engagement opportunities. Build a small version:

- `Program` belongs to `Organization`.
- `Program` has `title`, `description`, `capacity`, `starts_on`, `ends_on`, and `status`.
- Organization members can create and update programs.
- Organization admins can delete programs.

Acceptance criteria:

- Date validation prevents invalid ranges.
- Capacity must be positive if present.
- Index supports organization nesting.
- Request specs mirror the opportunity specs.

Skills practiced:

- Feature modeling
- CRUD reuse
- Policy reuse
- Test-driven API design

### Exercise 5: Partner Invitations

Build a basic partner invitation flow:

- An organization admin can invite another organization to partner.
- Invitations have `message`, `status`, `sender_organization`, and `recipient_organization`.
- Recipient org admins can accept or decline.

Acceptance criteria:

- Sender and recipient cannot be the same organization.
- Duplicate pending invitations are rejected.
- Only recipient admins can accept or decline.
- Request specs cover sender admin, recipient admin, outsider, and invalid duplicate.

Skills practiced:

- Multiple associations to the same model
- Custom policy methods
- State transitions
- Business rule testing

## Mock Prompt Bank

Use these as timed live-coding prompts.

### Prompt 1: Add Upcoming Opportunities

"Clients need a way to fetch only opportunities that start today or later."

Expected outline:

- Use or extend `EngagementOpportunity.upcoming`.
- Add a query param like `upcoming=true`.
- Add request specs.
- Keep existing filters working.

Follow-up questions:

- What should happen when `start_date` is null?
- Would this be better as a separate endpoint?
- How would you test dates without flaky specs?

### Prompt 2: Add Opportunity Ownership To Serializer

"Opportunity cards need to show the organization name and location."

Expected outline:

- Add serializer fields.
- Ensure index action eager-loads organization.
- Add response shape specs.
- Avoid exposing unnecessary organization fields.

Follow-up questions:

- What is the risk of changing response shape?
- How would you version this API?
- How do you avoid N+1 queries?

### Prompt 3: Add Intake Completion Rules

"Users should not see matches until their intake response has at least one need category."

Expected outline:

- Add validation or service guard.
- Update matches response for incomplete intake.
- Add request specs for missing intake, incomplete intake, and complete intake.

Follow-up questions:

- Is this a model validation or product rule?
- Should old incomplete records be allowed?
- What status code should the API return?

### Prompt 4: Add Admin-Only Organization Verification

"Platform admins need to verify organizations."

Expected outline:

- Add route such as `PATCH /api/v1/organizations/:id/verify`.
- Add policy rule requiring `platform_admin`.
- Update organization field.
- Add request specs.

Follow-up questions:

- Should verification be reversible?
- Should verification store who verified it?
- Should this be a state transition instead of a boolean?

### Prompt 5: Add Duplicate Application Protection

"A user should not be able to apply to the same opportunity twice."

Expected outline:

- Add model uniqueness validation.
- Add database unique index.
- Return `422` for duplicate submission.
- Add model and request specs.

Follow-up questions:

- Why do both model validation and database index matter?
- How would you handle race conditions?
- Should rejected users be allowed to reapply?

## Capstone Challenge

Build a small service application workflow.

Goal:

- Signed-in users can apply to opportunities.
- Applicants can list their own applications.
- Org admins can view applications for their opportunities.
- Org admins can update application status.

Timebox:

- 90 minutes for implementation.
- 30 minutes for cleanup and explanation.

Required behavior:

- Unauthenticated users receive `401`.
- Users can submit only one application per opportunity.
- Applicants cannot update their own status.
- Organization admins can update status.
- Outsiders cannot view or update applications.
- API responses use serializers.
- Tests cover model validations, successful submission, duplicate submission, applicant listing, admin listing, and unauthorized access.

Suggested file set:

- `backend/db/migrate/*_create_service_applications.rb`
- `backend/app/models/service_application.rb`
- `backend/app/controllers/api/v1/service_applications_controller.rb`
- `backend/app/policies/service_application_policy.rb`
- `backend/app/serializers/service_application_serializer.rb`
- `backend/spec/factories/service_applications.rb`
- `backend/spec/models/service_application_spec.rb`
- `backend/spec/requests/api/v1/service_applications_spec.rb`

How to explain your solution:

- Start with the domain relationship: users apply to opportunities, and opportunities belong to organizations.
- Explain the authorization boundary: applicants own their submissions, org admins manage review.
- Explain the data integrity boundary: uniqueness belongs in both validation and database index.
- Explain the API boundary: request specs prove status codes and response shape.

Stretch goals:

- Add an optional applicant note.
- Add timestamps for `reviewed_at`.
- Add a reviewer association to `User`.
- Add status transition rules.
- Add pagination to application listings.

## Live Coding Habits

Use this checklist during every practice round:

- Restate the requirement in one sentence.
- Identify the resource, owner, and permissions.
- Write the smallest failing spec if possible.
- Prefer model rules for data integrity.
- Prefer policies for permission checks.
- Keep controllers focused on loading, authorizing, saving, and rendering.
- Check response status codes deliberately.
- Run the narrowest useful test.
- Summarize what works and what remains.

Common mistakes to avoid:

- Building too much before the first test passes.
- Hiding business rules in controllers.
- Forgetting unauthenticated and unauthorized cases.
- Reordering enum values.
- Testing implementation details instead of behavior.
- Returning inconsistent error shapes.
- Ignoring duplicate records and database constraints.

## Quick Rails Refreshers

Strong params:

```ruby
params.require(:opportunity).permit(
  :title,
  :description,
  :opportunity_type,
  :status,
  :remote,
  :start_date,
  :end_date,
  :requirements,
  :contact_email
)
```

Policy shape:

```ruby
class EngagementOpportunityPolicy < ApplicationPolicy
  def create? = user.present? && user.member_of?(record.organization)
  def update? = user.present? && user.member_of?(record.organization)
  def destroy? = user.present? && (user.admin_of?(record.organization) || user.platform_admin?)
end
```

Request spec pattern:

```ruby
post "/api/v1/organizations/#{org.id}/opportunities",
  params: { opportunity: { title: "Summer Volunteer" } }.to_json,
  headers: auth_headers_for(member_user).merge("Content-Type" => "application/json")

expect(response).to have_http_status(:created)
expect(json[:opportunity][:title]).to eq("Summer Volunteer")
```

Model spec pattern:

```ruby
it { is_expected.to validate_presence_of(:title) }
it { is_expected.to belong_to(:organization) }
```

Scope pattern:

```ruby
scope :upcoming, -> { where("start_date >= ?", Date.current) }
```

Use these patterns until they feel automatic. In a live interview, fluency with the basics creates room to think about product behavior and edge cases.
