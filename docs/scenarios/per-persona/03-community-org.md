# Scenario: Community Organization — Better Youth

## Character Profile

**Better Youth (BY)** is a Sacramento-based nonprofit that provides mentorship and enrichment programming for school-aged children, primarily in underserved neighborhoods. Their programs run year-round, often in partnership with schools, other nonprofits, and individual professionals. Their program director, **Keisha**, manages the org's CommunityConnect presence. Better Youth wants to increase their visibility, streamline program applications, and build partnerships with complementary organizations.

## Persona Type
`community_org` (registered as an organization with `org_type: :nonprofit`)

## Platform Entry Point
Keisha discovered CommunityConnect at a Sacramento nonprofit coalition meeting. She registers herself first as an individual user, then creates the organization.

---

## Scenario A: Happy Path — Organization Creation and Configuration

### Context
Keisha sets up Better Youth's organizational presence on the platform, making them discoverable to potential partners, volunteers, and participants.

### Step-by-Step Narrative

1. Keisha registers as a new user: selects `community_org` profile type → `POST /api/v1/auth/registration` → redirected to `/profile`.
2. Keisha navigates to `/organizations/new` → org creation form.
3. Fills in org details:
   - Name: "Better Youth"
   - Description and mission statement
   - Org type: `nonprofit`
   - Category: `youth_services`
   - Address: Sacramento, CA (geocoded to lat/lng)
   - Website
   - Phone
4. Submits → `POST /api/v1/organizations` → `Organization` record created.
5. System auto-creates an `OrganizationMembership` for Keisha with `role: :admin`.
6. Keisha is redirected to the org's profile page `/organizations/:id`.
7. Keisha navigates to `/organizations/:id/manage` → sees 6 tabs: Applications, Programs, Opportunities, Partners, Referrals, Announcements.
8. Better Youth now appears in the organizations directory at `/organizations`.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Org creation | `/organizations/new` | `POST /api/v1/organizations` |
| Org profile | `/organizations/:id` | `GET /api/v1/organizations/:id` |
| Org manage page | `/organizations/:id/manage` | — |
| Org directory | `/organizations` | `GET /api/v1/organizations` |

### Expected Outcomes
- `Organization` record created with correct `org_type: :nonprofit`, `category: :youth_services`, geocoded lat/lng.
- Keisha's `OrganizationMembership` has `role: :admin`.
- Better Youth appears in `/organizations` directory results.
- All 6 manage tabs are accessible to Keisha as admin.

### Edge Cases
- **EC-A1** Keisha submits the org form with an invalid address that cannot be geocoded → org is created but `latitude`/`longitude` are nil; proximity search will not surface this org.
- **EC-A2** A second user tries to create an org with the same name → no uniqueness constraint on `name` in the current schema; duplicate orgs can be created. Consider a uniqueness validation or duplicate-detection UI.
- **EC-A3** Keisha tries to access `/organizations/:id/manage` for an org she is NOT a member of → `OrganizationPolicy#manage?` should return false and render a 403 response.

---

## Scenario B: Happy Path — Posting an Engagement Opportunity

### Context
Better Youth wants to recruit volunteer mentors. Keisha creates a volunteer-type engagement opportunity through the manage page.

### Step-by-Step Narrative

1. Keisha navigates to `/organizations/:id/manage` → Opportunities tab → "Add Opportunity."
2. Fills in opportunity details:
   - Title: "Youth Mentor Volunteer"
   - Type: `volunteer`
   - Description, requirements
   - Status: `open`
   - Location, application deadline
3. Submits → `POST /api/v1/organizations/:org_id/opportunities`.
4. Opportunity appears in the Opportunities tab of the manage page.
5. Opportunity is now discoverable at `/opportunities` with type filter "volunteer."
6. The opportunity surfaces as a `new_opportunity` item in the platform-wide activity feed.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Create opportunity | `/organizations/:id/manage` | `POST /api/v1/organizations/:org_id/opportunities` |
| Opportunity directory | `/opportunities` | `GET /api/v1/opportunities` |
| Activity feed | `/feed` | `GET /api/v1/feed` |

### Expected Outcomes
- `EngagementOpportunity` record exists with correct `org_id`, `opportunity_type: :volunteer`, `status: :open`.
- Opportunity appears at `/opportunities?type=volunteer`.
- Activity feed includes a `new_opportunity` item for this opportunity within the 30-day lookback window.

### Edge Cases
- **EC-B1** Keisha sets the opportunity to `status: :closed` at creation → it will not appear in the default opportunity directory (which filters for open opportunities), but should still be visible in the org's manage page.
- **EC-B2** Keisha creates a `funding` type opportunity and wants to set `funding_amount` and `eligibility` → these fields exist on the model but the current opportunity creation form may not expose them. **Confirmed gap** for funder flow (G-12).

---

## Scenario C: Happy Path — Creating and Managing a Program

### Context
Better Youth is launching their annual summer mentorship program. Keisha creates the program, sets the application window, and begins receiving applications.

### Step-by-Step Narrative

1. Keisha navigates to the Programs tab in manage page → "New Program."
2. Fills in program details:
   - Name: "BY Summer Mentorship 2026"
   - Type: `mentorship`
   - Status: `draft` initially
   - Start/end dates
   - Application open/deadline dates
   - Capacity: 30 participants
   - Description and requirements
3. Submits → `POST /api/v1/organizations/:org_id/programs`.
4. System creates `Program` with `status: :draft`, auto-creates `ProgramOrganization` with `role: :owner`.
5. Keisha publishes the program: edits it → changes status to `published` → `PATCH /api/v1/programs/:id`.
6. Program now appears at `/programs` and surfaces in the activity feed as `new_program`.
7. Within the application window, individuals apply → `ProgramApplication` records created.
8. Keisha reviews applications: navigates to Programs tab → selects the program → sees applicants. (**Note:** this currently routes through `ProgramsTab` but program application review is not in the `ApplicationsTab` — see G-13.)

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Create program | `/organizations/:id/manage` Programs tab | `POST /api/v1/organizations/:org_id/programs` |
| Publish program | `/programs/:id/edit` | `PATCH /api/v1/programs/:id` |
| Program directory | `/programs` | `GET /api/v1/programs` |
| Program application review | — (gap) | `PATCH /api/v1/program_applications/:id` |

### Expected Outcomes
- `Program` created with `status: :draft` and an owner `ProgramOrganization`.
- After status update to `published`, the program appears in `/programs`.
- Activity feed contains a `new_program` item.
- Program detail page at `/programs/:id` shows the application window and an Apply button when `applications_open? == true`.

### Edge Cases
- **EC-C1** Keisha sets the program to `active` before publishing → `active` means the program is currently running, which bypasses the published state. The state machine should enforce transitions (draft → published → active).
- **EC-C2** Keisha tries to delete a program that has active `ProgramApplication` records → the system should prevent deletion or archive the program instead.

---

## Scenario D: Happy Path — Sending a Partner Connection Request

### Context
Better Youth wants to formally connect with Wild Wild West, another nonprofit they co-run programs with, so their content is prioritized in each other's feeds.

### Step-by-Step Narrative

1. Keisha navigates to `/organizations/:wwwest_id` — Wild Wild West's profile page.
2. Sees a "Connect" or "Send partner request" button.
3. Submits → `POST /api/v1/organizations/:by_id/partner_connections` with `{ target_org_id: wwwest_id }`.
4. `PartnerConnection` record created: `status: :pending`, `requesting_org_id: BY`, `target_org_id: WWWest`.
5. Wild Wild West's admin sees a `partner_request` feed item.
6. WWWest admin navigates to their manage page → Partners tab → sees the pending request → accepts.
7. `PartnerConnection.status` updated to `accepted`.
8. Better Youth and Wild Wild West now appear in each other's Partners tab.
9. Content from each org surfaces with `partner` feed priority for the other.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Send partner request | `/organizations/:id` | `POST /api/v1/organizations/:org_id/partner_connections` |
| Accept partner request | `/organizations/:id/manage` Partners tab | `PATCH /api/v1/partner_connections/:id` |
| Activity feed — partner_request | `/feed` | `GET /api/v1/feed` |

### Expected Outcomes
- `PartnerConnection` created with `status: :pending`.
- WWWest's feed contains a `partner_request` item.
- After acceptance, both orgs see each other in their Partners tabs.
- WWWest's new opportunities appear with `partner` priority in BY's feed.

### Edge Cases
- **EC-D1** BY sends a partner request to an org they are already connected with → should return a validation error (duplicate connection).
- **EC-D2** The target org declines → `status: :declined`; the requesting org sees no confirmation; the request disappears from the Partners tab for both parties.

---

## Scenario E: Happy Path — Sending a Referral to an Individual

### Context
A resource navigator (Marcus) has a client (Jason) who would benefit from Better Youth's summer program. But in this scenario, BY's admin Keisha proactively identifies Jason through his email and sends the referral directly.

### Step-by-Step Narrative

1. Keisha navigates to `/organizations/:id/manage` → Referrals tab.
2. Fills in the referral form: Jason's email, an optional message.
3. Submits → `POST /api/v1/organizations/:org_id/referrals` with `{ referred_user_email: "jason@example.com", message: "..." }`.
4. System looks up the user by email → creates `Referral` record: `referring_org_id: BY`, `referred_user_id: Jason`, `status: :pending`.
5. Jason sees a `referral` item in his activity feed.
6. Jason accepts → `PATCH /api/v1/referrals/:id` → `status: :accepted`.
7. Keisha sees the updated status in the Referrals tab.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Send referral | `/organizations/:id/manage` Referrals tab | `POST /api/v1/organizations/:org_id/referrals` |
| Accept referral (seeker side) | `/my-services` | `PATCH /api/v1/referrals/:id` |

### Expected Outcomes
- `Referral` created with correct `referring_org_id`, `referred_user_id`, `status: :pending`.
- Jason's feed includes the referral item.
- After Jason accepts, the Referrals tab shows "Accepted" for that referral.

### Edge Cases
- **EC-E1** Jason's email is not registered on the platform → the API should return a "User not found" error; Keisha sees a friendly message explaining the person needs to register first.
- **EC-E2** Keisha wants to refer Jason to a specific program (not just to the org) → **the UI only collects email + message; `target_type`/`target_id` are not exposed in the form** (see G-03).

---

## Scenario F: Happy Path — Posting an Announcement

### Context
Better Youth wants to broadcast a message to all platform users about their upcoming open house event.

### Step-by-Step Narrative

1. Keisha navigates to `/organizations/:id/manage` → Announcements tab.
2. Writes announcement title and body → submits → `POST /api/v1/organizations/:org_id/announcements`.
3. `Announcement` record created.
4. Announcement surfaces as an `announcement` feed item for all platform users in the activity feed.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Post announcement | `/organizations/:id/manage` Announcements tab | `POST /api/v1/organizations/:org_id/announcements` |
| Activity feed — announcement | `/feed` | `GET /api/v1/feed` |

### Expected Outcomes
- `Announcement` record created linked to Better Youth.
- Feed item of type `announcement` appears for all users within the 30-day lookback.
- Partner orgs see the announcement at higher `partner` feed priority.

---

## Gap Analysis

### Confirmed Gaps

| Gap ID | Description | Affected Step | Proposed Feature |
|--------|-------------|---------------|-----------------|
| G-03 | Referral target not settable via UI. The referral form collects only email + message; `target_type`/`target_id` (the polymorphic program/org target) are never set via the UI even though the API and model support them. | Scenario E, Step 3 | Add a program/org selector to the Referrals tab send form; pre-fill `target_type: "Program"` when navigating from a program detail page |
| G-07 | No org-to-org messaging. After a partner connection is accepted, BY and WWWest have no in-platform communication channel as organizations. All messages must be between individual users. | Scenario D, post-acceptance | "Message this org" action on org profile and Partners tab that routes to a conversation with the org's admin user |
| G-12 | Foundation org type has no funder flow. The `funding` opportunity type exists and `funding_amount`/`eligibility` fields are on the model, but the opportunity creation form does not expose them. Funders have no specialized UI. | Scenario B, Step 2 (for funding type) | Conditional form fields for funding-type opportunities; foundation-type org landing page with grant-specific UX |
| G-13 | Program applications not reviewable in OrganizationManagePage Applications tab. The Applications tab only covers `ServiceApplication` records for engagement opportunities; `ProgramApplication` records for programs have no dedicated review UI in the manage page. | Scenario C, Step 8 | Add a program applications panel to the Applications tab (or a new "Program Applications" subtab), with approve/reject actions calling `PATCH /api/v1/program_applications/:id` |
| G-14 | No "follow org" concept. Announcements reach all users equally in the feed — there's no way for users to subscribe to Better Youth specifically for prioritized delivery. | Scenario F | `UserOrgFollow` model; announcements from followed orgs surfaced at higher feed priority |
| G-15 | No user search for org admins. Keisha cannot search for volunteers or professionals by name to invite them or send them referrals. She can browse `/professionals` but cannot search across all user types. | Scenario E, Step 2 — finding a user | Minimal user search scoped to authenticated org admins; returns users by name/email with profile type indicator |
| G-20 | No impact/outcome reporting after programs complete. Once the summer mentorship program ends and Keisha sets `status: :completed`, there's no mechanism to record or report outcomes (participants served, goals met, etc.). | Scenario C, post-program | `ProgramOutcome` model; org-facing outcome entry form on the program detail page after status = completed |

### Friction Points

| FP ID | Description | Why it's friction | Improvement idea |
|-------|-------------|-------------------|-----------------|
| FP-05 | Referral form has no email autocomplete | Keisha must type the exact registered email. A caseworker or org admin who met a client in person may not have their email handy. | Add a name-based search with email confirmation before sending; or allow searching registered users by name |
| FP-07 | Partner request feed items link to the target org's manage page | `url: "/organizations/#{target_org_id}/manage"` — this only works for the target org's admin. If a non-admin member of the target org sees this feed item, the link takes them to a page they cannot access. | Feed item URL should link to the org profile page (`/organizations/:id`) for non-admin viewers, and the manage page only for admins |

---

## Cross-Persona Touchpoints

- **Individual Seeker (Jason)** — receives referrals and applies to programs: [CP-02](../cross-persona/CP-02-org-refers-seeker-directly.md)
- **Individual Professional (Rachel)** — applies to partnership opportunities: [CP-04](../cross-persona/CP-04-professional-partners-with-org.md)
- **Volunteer (DeShawn)** — applies to volunteer opportunities: [CP-03](../cross-persona/CP-03-volunteer-applies-to-org-opportunity.md)
- **Business Provider (Atnap)** — sends partner connection request to BY: [CP-06](../cross-persona/CP-06-business-provider-connects-with-org.md)
- **Joint program with Wild Wild West + Jason applying**: [CP-05](../cross-persona/CP-05-joint-program-with-seeker-applicant.md)

---

## Feature Requests Surfaced

1. **Program applications review panel** — Add a program applications sub-section to the Applications tab in OrganizationManagePage. Each program should be a collapsible group with its `ProgramApplication` list. Approve/reject actions call `PATCH /api/v1/program_applications/:id`. Affects: `ApplicationsTab` component, `OrganizationManagePage.tsx`.

2. **Referral send with target selector** — Extend the Referrals tab send form with a "Target Program or Organization" search field. When a target is selected, include `target_type` and `target_id` in the POST body. Pre-populate this field when "Refer to this program" is triggered from a program detail page. Affects: `ReferralsTab` component, referral creation form.

3. **Funding opportunity form fields** — Show `funding_amount`, `eligibility_criteria`, and `grant_deadline` fields when `opportunity_type === "funding"` in the opportunity creation form. Affects: opportunity creation form component in `OrganizationManagePage`.

4. **Org-to-org contact** — On `OrganizationProfilePage` and the Partners tab, add a "Send message" action that finds the target org's admin user and creates or opens a `Conversation`. Affects: `OrganizationProfilePage.tsx`, `PartnersTab` component.

5. **Outcome reporting** — After a program reaches `status: :completed`, show an "Add outcome report" CTA. Creates a `ProgramOutcome` record with fields: participants_served (integer), goals_met (text), notes. Displayed on the public program detail page. Affects: new model + controller, `ProgramDetailPage.tsx`.

6. **User search for org admins** — A minimal search endpoint `GET /api/v1/users/search?q=name` scoped to authenticated org admins, returning users by first/last name with profile type. Used in the referral send form. Affects: new `UsersController#search` action, `ReferralsTab`.
