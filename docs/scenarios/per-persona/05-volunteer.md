# Scenario: Volunteer — DeShawn Carter

## Character Profile

**DeShawn Carter**, 24, recently graduated from Sacramento State with a degree in social work. He did a capstone placement with a local housing nonprofit and wants to stay connected to community work while he job searches. He's not looking for a paid role through the platform — he genuinely wants to give his time. He's available on weekends and weekday evenings. A friend mentioned CommunityConnect after seeing it shared in a local social work alumni group.

## Persona Type
`volunteer`

## Platform Entry Point
Social work alumni Facebook group post. DeShawn accesses CC from his phone and is comfortable with apps and digital tools.

---

## Scenario A: Happy Path — Registration and Profile Setup

### Context
DeShawn signs up as a volunteer and sets up his profile to communicate his skills and availability to organizations that might want him.

### Step-by-Step Narrative

1. DeShawn visits CommunityConnect → clicks "Sign up."
2. Completes Step 1: name, email, password → `POST /api/v1/auth/registration`.
3. Completes Step 2: selects "Volunteer" → submits.
4. System creates `User` with `profile_type: :volunteer` → redirects to `/profile`.
5. DeShawn fills in his profile:
   - Bio: "Recent social work grad. Experienced in case management, youth outreach, and community resource navigation."
   - City: Sacramento, State: CA
   - Availability: "Weekends and weekday evenings"
   - Services offered: ["Youth mentoring", "Case management support", "Community outreach"]
6. Saves → `PATCH /api/v1/auth/profile`.
7. DeShawn is redirected to `/dashboard`.
8. Dashboard renders the **volunteer section**: availability status card, application summary, open volunteer opportunities list.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Two-step registration | `/register` | `POST /api/v1/auth/registration` |
| Profile edit | `/profile` | `PATCH /api/v1/auth/profile` |
| Dashboard — volunteer section | `/dashboard` | — |

### Expected Outcomes
- `User` record has `profile_type: :volunteer`, `availability` and `services_offered` populated.
- Dashboard renders the `VolunteerSection` with availability status card, application summary, and opportunity list.
- No intake questionnaire is triggered for the volunteer persona.

### Edge Cases
- **EC-A1** DeShawn completes registration but skips profile setup (navigates directly to `/dashboard`) → the volunteer dashboard section renders, but availability and bio are empty. There is **no onboarding checklist or first-login prompt** guiding him to complete his profile (see G-16).
- **EC-A2** DeShawn tries to change his profile type to `resource_navigator` via the profile edit form → **`volunteer` and `resource_navigator` are not included in the profile type dropdown** (see G-06). He cannot switch types through the UI.

---

## Scenario B: Happy Path — Browsing and Applying to a Volunteer Opportunity

### Context
DeShawn wants to find a volunteer mentoring opportunity. He browses the available opportunities and submits an application.

### Step-by-Step Narrative

1. DeShawn navigates to `/opportunities?type=volunteer` — or clicks "View Opportunities" from the volunteer dashboard section.
2. Opportunity directory loads, filtered to `volunteer` type → `GET /api/v1/opportunities?opportunity_type=volunteer`.
3. DeShawn reads through the listings. He finds Better Youth's "Youth Mentor Volunteer" opportunity.
4. Clicks the card → `/opportunities/:id` → reads full description, requirements, org info.
5. Clicks "Apply" → message input appears → DeShawn types a brief note about his social work background.
6. Submits → `POST /api/v1/opportunities/:id/applications`.
7. `ServiceApplication` created: `status: :pending`.
8. DeShawn sees confirmation and navigates to `/my-services` → application listed under "Active Applications."
9. Dashboard volunteer section shows updated application stats (1 pending).

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Opportunity directory (volunteer filter) | `/opportunities?type=volunteer` | `GET /api/v1/opportunities?opportunity_type=volunteer` |
| Opportunity detail | `/opportunities/:id` | `GET /api/v1/opportunities/:id` |
| Apply to opportunity | — | `POST /api/v1/opportunities/:id/applications` |
| My services | `/my-services` | `GET /api/v1/my/applications` |

### Expected Outcomes
- `ServiceApplication` created with `status: :pending`.
- `/my-services` shows the application.
- Dashboard volunteer section application summary reflects the pending count.
- The opportunity list at `/dashboard` is not skills- or location-filtered — it shows the 5 most recent volunteer opportunities regardless of relevance to DeShawn (see G-11 and FP-03).

### Edge Cases
- **EC-B1** DeShawn applies to a non-volunteer type opportunity (e.g., `partnership`) → no persona-type restriction currently enforces volunteer-only access; the application is accepted.
- **EC-B2** The same opportunity has already been filled (`status: :closed`) → Apply button absent; API returns error on direct submission.
- **EC-B3** DeShawn withdraws an application → `status: :withdrawn`, no confirmation dialog shown (see FP-06). **No feed event is generated for the org** when a volunteer withdraws (see G-18).

---

## Scenario C: Happy Path — Application Approved and Engagement Begins

### Context
Better Youth's admin reviews DeShawn's application and approves it. DeShawn receives notification and can begin volunteering.

### Step-by-Step Narrative

1. Better Youth admin navigates to `/organizations/:id/manage` → Applications tab → sees DeShawn's pending application.
2. Admin clicks "Approve" → `PATCH /api/v1/applications/:id` with `{ status: "approved" }`.
3. `ServiceApplication.status` → `approved`.
4. DeShawn's activity feed shows an `application_update` item: "Your application to [Better Youth] was approved."
5. DeShawn navigates to `/my-services` → application now shows "Approved" status.
6. DeShawn volunteers. (**Gap: no in-platform mechanism for logging hours or tracking engagement outcomes.**)

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Org reviews application | `/organizations/:id/manage` | `PATCH /api/v1/applications/:id` |
| Activity feed — application_update | `/feed` | `GET /api/v1/feed` |
| My services — approved status | `/my-services` | — |

### Expected Outcomes
- `ServiceApplication.status` is `approved` in the database.
- DeShawn's feed includes an `application_update` item.
- `/my-services` shows "Approved" for the application.

### Edge Cases
- **EC-C1** Better Youth rejects DeShawn instead → `status: :rejected`; feed item shows rejection; application moves to history section in `/my-services`.
- **EC-C2** DeShawn is approved but then the org withdraws the approval (e.g., the program was cancelled) → org calls `PATCH` with `status: :rejected` after prior approval; this is a state regression with no current notification to DeShawn beyond the feed item.

---

## Gap Analysis

### Confirmed Gaps

| Gap ID | Description | Affected Step | Proposed Feature |
|--------|-------------|---------------|-----------------|
| G-02 | No volunteer hours tracking post-approval. After DeShawn is approved, there's no in-platform mechanism to log hours, confirm attendance, or track outcomes. The `ServiceApplication` status stops at `approved` — there's no post-approval workflow. | Scenario C, Step 6 | `VolunteerHoursLog` model with `application_id`, `hours_date`, `hours_logged`, `confirmed_by_org` boolean. Org admin confirms; volunteer can submit; history visible in `/my-services`. |
| G-06 | `volunteer` profile type excluded from profile type switch dropdown. DeShawn cannot change his profile type via the `/profile` edit form because the dropdown only includes 4 of 6 profile types. The `profile_type` validation in `ProfilePage.tsx` (line ~18) uses an enum that omits `volunteer` and `resource_navigator`. | Scenario A, EC-A2 | Update `ProfilePage.tsx` schema and dropdown to include all 6 profile types |
| G-11 | No volunteer-specific browse page with skill/location filters. The dashboard volunteer section shows the 5 most recent `volunteer` type opportunities with no filtering. DeShawn has no way to express what kind of volunteering he wants, where, or when. | Scenario B, Step 2 | Dedicated `/volunteer-opportunities` route with filter sidebar: cause area (org category), location/proximity, opportunity start date, time commitment; uses existing opportunity API with additional filter params |
| G-16 | No post-registration onboarding checklist for volunteer persona. After registration, DeShawn lands on `/profile` with no guidance on what to do next — no "complete your profile," "browse opportunities," or "set your availability" prompts. | Scenario A, Step 4 | First-login onboarding card per profile type: for volunteers, prompt to set availability + browse volunteer opportunities; tracked via a `onboarding_completed` flag on the user |
| G-18 | No feed event when a volunteer withdraws an application. When DeShawn withdraws, the `ServiceApplication` status changes but no `application_withdrawn` feed item is generated for the org admin. | Scenario B, EC-B3 | Add `application_withdrawn` feed event type in `FeedController`; surface it for the org's admin users |

### Friction Points

| FP ID | Description | Why it's friction | Improvement idea |
|-------|-------------|-------------------|-----------------|
| FP-03 | Volunteer opportunity list has no skills/location filter | The dashboard `VolunteerSection` loads the 5 most recent volunteer opportunities sorted by `created_at`. DeShawn has no way to find opportunities relevant to his background or location. Most will be irrelevant. | Sort opportunities by proximity to `user.city`/`user.state` + add cause-area tags to opportunities that match org category |
| FP-06 | No confirmation dialog before application withdrawal | DeShawn can accidentally click "Withdraw" with no confirmation. For an approved application, this terminates an active commitment. | Confirmation modal before calling `useWithdrawApplication`; include application title and org name in the confirmation text |

---

## Cross-Persona Touchpoints

- **Community Org (Better Youth)** — reviews DeShawn's application and approves: [CP-03](../cross-persona/CP-03-volunteer-applies-to-org-opportunity.md)

---

## Feature Requests Surfaced

1. **Volunteer hours tracking** — New `VolunteerHoursLog` model: `application_id` (FK), `volunteer_id` (FK), `org_id` (FK), `log_date`, `hours`, `confirmed` (boolean). Volunteer submits hours; org admin confirms. Visible in `/my-services` and on the org's manage page. Affects: new model + controller, `/my-services` display, ApplicationsTab.

2. **Volunteer-specific browse page** — `/volunteer-opportunities` route rendering a dedicated opportunities list with filter sidebar (org category, city/state proximity, date, time commitment type). Reuses `OpportunityCard` component with `opportunity_type=volunteer` pre-applied. Affects: new frontend route + page, `App.tsx`.

3. **Post-registration onboarding flow** — Detect first login (no activity, profile incomplete) and render an onboarding checklist card on the dashboard, tailored by persona type. For volunteers: (1) Complete your profile, (2) Set availability, (3) Browse volunteer opportunities. Tracked with `onboarding_dismissed_at` timestamp on User. Affects: `User` model, `DashboardPage.tsx`, per-type onboarding card components.

4. **Profile type dropdown — all 6 types** — Update the `profile_type` schema in `ProfilePage.tsx` (line ~18) to validate and display all 6 `profile_type` enum values. Affects: `ProfilePage.tsx`.

5. **Application withdrawal feed event** — In `ServiceApplicationsController#update`, when `status` transitions to `:withdrawn`, enqueue a feed item of type `application_withdrawn` targeting the org's admin users. Affects: `ServiceApplicationsController`, `FeedController`.

6. **Skills/availability matching for volunteer opportunities** — Match the volunteer's `services_offered` and `availability` against opportunity requirements when sorting the dashboard opportunity list. Analogous to `MatchingService` for seekers. Affects: new volunteer matching logic, `DashboardPage.tsx` volunteer section.
