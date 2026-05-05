# Scenario: Individual Seeker — Jason

## Character Profile

**Jason**, 31, is experiencing homelessness and managing depression. He has sporadic employment history and very limited financial resources. A friend who recently found stable housing through a community program suggested Jason sign up for CommunityConnect as a starting point for getting his life back on track.

## Persona Type
`individual_seeker`

## Platform Entry Point
Word of mouth from a friend. Jason accesses CC from a phone browser. He's not tech-savvy but can navigate a simple form-based UI. He may have unreliable internet access.

---

## Scenario A: Happy Path — Registration, Intake, and Service Matching

### Context
Jason hears about CommunityConnect and decides to sign up. His immediate needs are shelter, food, and mental health support. He hopes the platform will surface organizations he can reach out to.

### Step-by-Step Narrative

1. Jason visits the CommunityConnect landing page → sees a "Sign up" CTA and clicks it.
2. Jason completes Step 1 of registration: first name, last name, email, password → submits → `POST /api/v1/auth/registration`.
3. Jason completes Step 2: selects "Individual seeking resources" as his profile type → submits.
4. System creates a `User` record with `profile_type: :individual_seeker`, `intake_completed: false` → redirects Jason to `/intake`.
5. `RequireAuth` guard intercepts all subsequent navigation attempts and hard-redirects back to `/intake` until intake is marked complete.
6. Jason completes the 3-step intake form:
   - Step 1: housing status = "Experiencing homelessness", employment status = "Unemployed"
   - Step 2: needs categories = [housing_shelter, food_nutrition, mental_health], urgency = "Urgent"
   - Step 3: goals = "Find stable housing and mental health support", barriers = "No income, no ID", preferred contact = "Email"
7. Jason submits the intake → `POST /api/v1/intake` → `UserIntakeResponse` record created → `user.intake_completed` set to `true`.
8. System redirects Jason to `/dashboard`.
9. Dashboard renders the **seeker section**: matched organizations (up to 6) + matched opportunities (up to 5) surfaced by `MatchingService`.
10. Jason sees organizations categorized as `shelter`, `food_bank`, and `mental_health` in his matched results.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Two-step registration | `/register` | `POST /api/v1/auth/registration` |
| Intake questionnaire | `/intake` | `POST /api/v1/intake` |
| Intake guard | (any protected route before completion) | — redirect only |
| Service matching | `/dashboard` | `GET /api/v1/matches` |
| Dashboard seeker section | `/dashboard` | — |

### Expected Outcomes
- After Step 2 of registration, Jason is redirected to `/intake`, not `/dashboard`.
- Attempting to navigate to `/dashboard` before completing intake redirects back to `/intake`.
- After submitting intake, `user.intake_completed` is `true` in the database.
- Dashboard displays at least one matched organization per stated need category (shelter, food_bank, mental_health).
- Matched opportunities belong to the same organizations surfaced in the match list.

### Edge Cases
- **EC-A1** Jason submits the intake form with only one needs category selected → system should still return matches; `MatchingService` should not error on a single-element array.
- **EC-A2** No organizations in the database match Jason's stated needs → dashboard renders a "No matches found" empty state rather than a blank section.
- **EC-A3** Jason abandons intake mid-form (closes browser) and returns the next day → he is still redirected to `/intake` and the form starts fresh (no draft saved).
- **EC-A4** Jason registers with an email already in use → registration step 1 should return a validation error; no partial `User` record created.

---

## Scenario B: Happy Path — Applying to an Engagement Opportunity

### Context
From the dashboard, Jason clicks on a matched opportunity at a local shelter that offers "basic needs services." He wants to apply directly through the platform.

### Step-by-Step Narrative

1. Jason clicks a matched opportunity card on his dashboard → navigates to `/opportunities/:id`.
2. Opportunity detail page loads: name, description, org info, opportunity type, status badge → `GET /api/v1/opportunities/:id`.
3. Jason clicks "Apply" → a modal or inline form appears requesting a brief message.
4. Jason types a short note explaining his situation → submits → `POST /api/v1/opportunities/:id/applications`.
5. System creates a `ServiceApplication` record: `status: :pending`, `user_id: Jason`, `engagement_opportunity_id: opportunity`.
6. Jason is redirected or shown confirmation: "Your application has been submitted."
7. Jason navigates to `/my-services` → sees his application listed under "Active Applications" with status "Pending."

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Opportunity detail | `/opportunities/:id` | `GET /api/v1/opportunities/:id` |
| Apply to opportunity | `/opportunities/:id` | `POST /api/v1/opportunities/:id/applications` |
| My services tracker | `/my-services` | `GET /api/v1/my/applications` |

### Expected Outcomes
- `ServiceApplication` record exists with `status: :pending`.
- `/my-services` shows the application under "Active Applications."
- Jason cannot apply to the same opportunity twice — a second "Apply" attempt returns an error or hides the Apply button.
- If the opportunity `status` is not `open`, the Apply button is not shown.

### Edge Cases
- **EC-B1** Jason applies to an opportunity and the org then rejects the application → `/my-services` shows status "Rejected" under "Application History."
- **EC-B2** Jason applies and then withdraws → status changes to `withdrawn`; the application moves to history. **No confirmation dialog currently exists** (see FP-06).
- **EC-B3** Jason tries to apply to a `volunteer` type opportunity even though he's a seeker — the system currently does not restrict by persona type, so the application is accepted. Consider whether persona-type gating is appropriate.

---

## Scenario C: Happy Path — Applying to a Program

### Context
Jason discovers a 6-week stability program run by a local nonprofit while browsing the Programs section. Applications are currently open.

### Step-by-Step Narrative

1. Jason navigates to `/programs` → program directory loads → `GET /api/v1/programs`.
2. Jason filters by type "workshop" or browses the list → clicks a program card → `/programs/:id`.
3. Program detail page shows: name, description, dates, capacity, application window, participating organizations.
4. The application window is currently open (`applications_open? == true`); Apply button is visible.
5. Jason submits a program application → `POST /api/v1/programs/:id/applications`.
6. System creates `ProgramApplication` record: `status: :pending`.
7. Jason navigates to `/my-services` → sees the program application under "Program Applications."

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Program directory | `/programs` | `GET /api/v1/programs` |
| Program detail | `/programs/:id` | `GET /api/v1/programs/:id` |
| Apply to program | `/programs/:id` | `POST /api/v1/programs/:id/applications` |
| My services — program applications | `/my-services` | `GET /api/v1/my/program_applications` |

### Expected Outcomes
- `ProgramApplication` exists with `status: :pending`.
- `/my-services` shows the program application separately from engagement opportunity applications.
- If the application window is closed, the Apply button is absent on the detail page.

### Edge Cases
- **EC-C1** Jason applies after the `application_deadline` has passed → the backend `Program#applications_open?` guard should reject the application with a validation error. The frontend should not show the Apply button after the deadline, but this relies on `applications_open` being returned in the API response and used in the component. **This is currently a friction point** (see FP-04).
- **EC-C2** Program has reached `capacity` → same behavior as closed window: Apply button hidden, submission rejected.

---

## Scenario D: Happy Path — Receiving and Accepting a Referral

### Context
A resource navigator who works with Jason has spotted a relevant housing program on CommunityConnect and sent him a referral through the platform.

### Step-by-Step Narrative

1. Jason receives a `referral` item in his activity feed → `GET /api/v1/feed`.
2. Feed item reads: "[Org Name] referred you to [Program Name]."
3. Jason clicks the feed item → navigates to a referral detail view or sees the referral listed in `/my-services` under "Referrals."
4. Referral record shows: referring org, target program name, message from navigator, status "Pending."
5. Jason clicks "Accept" → `PATCH /api/v1/referrals/:id` with `{ status: "accepted" }`.
6. Referral `status` updates to `accepted`.
7. Jason can now view the target program detail page and apply.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Activity feed — referral item | `/feed` or `/dashboard` | `GET /api/v1/feed` |
| My services — referrals section | `/my-services` | — |
| Accept referral | — | `PATCH /api/v1/referrals/:id` |

### Expected Outcomes
- Feed shows the referral item before Jason takes any action.
- `/my-services` lists the referral with status "Pending."
- After accepting, status updates to "Accepted" on the `/my-services` page.
- Declining a referral sets status to "Declined" and removes it from the active list.

### Edge Cases
- **EC-D1** The referral targets an Organization (not a Program) → Jason sees the org's profile page linked from the referral.
- **EC-D2** The program referenced in the referral is no longer accepting applications by the time Jason accepts → he can accept the referral but the Apply button on the program page will be absent.
- **EC-D3** Jason receives multiple referrals from different navigators for the same program → the system should allow it (no uniqueness constraint on referrals per user per target).

---

## Gap Analysis

### Confirmed Gaps

| Gap ID | Description | Affected Step | Proposed Feature |
|--------|-------------|---------------|-----------------|
| G-05 | Intake cannot be re-submitted after initial completion. `UserIntakeResponse` has a uniqueness constraint on `user_id`; the intake re-trigger path in the controller needs to be verified and wired to the frontend. | Post-Scenario A — needs change over time | Wire `PATCH /api/v1/intake` to update the existing `UserIntakeResponse`; add "Update my needs" flow that re-runs matching after save |
| G-08 | No messaging thread attached to applications. When Jason applies to an opportunity, neither he nor the org has an in-platform communication channel tied to that application. | Scenario B, Step 4 | Auto-create a `Conversation` between applicant and org admin upon application submission |
| G-09 | No "re-run matching" trigger. If Jason's situation changes after intake, there's no atomic "update needs and refresh matches" action. The intake re-trigger exists (as a dashboard link) but updating the intake doesn't automatically refresh the match results. | Scenario A, post-completion | "Update my needs" action that updates `UserIntakeResponse` + clears cached matches |
| G-14 | No "follow org" concept. Jason can save an organization but saving doesn't affect feed prioritization. Organizations he's applied to or been referred by get no preferential treatment in the activity feed. | Scenario A, dashboard | Followed-org feed preference separate from `SavedOrganization` |
| G-19 | Seeker cannot message an org directly. The `OrganizationProfilePage` has no contact or message button. Jason must be approved for a service before any communication channel exists. | Scenario B, Step 2 (before applying) | "Message this org" button on org profile page → creates `Conversation` with org admin |

### Friction Points

| FP ID | Description | Why it's friction | Improvement idea |
|-------|-------------|-------------------|-----------------|
| FP-04 | Program application window enforcement is backend-only | The frontend `ProgramDetailPage` doesn't read `applications_open` from the API response, so the Apply button may be visible when the window is closed. Jason clicks Apply, submits, and receives a backend validation error with no friendly message. | Add `applications_open` boolean to the `Program` serializer; read it in `ProgramDetailPage` to conditionally render the Apply button |
| FP-06 | No confirmation dialog before application withdrawal | Jason can accidentally click "Withdraw" on an approved application with no "are you sure?" prompt. Loss of an approved service application is a significant UX failure for a seeker. | Add a confirmation modal to `useWithdrawApplication` that summarizes what will be lost |

---

## Cross-Persona Touchpoints

- **Resource Navigator (Marcus)** — sends referrals to Jason: [CP-01](../cross-persona/CP-01-navigator-refers-seeker-to-program.md)
- **Community Org (Better Youth)** — Jason applies to their opportunities and programs: [CP-02](../cross-persona/CP-02-org-refers-seeker-directly.md)
- **Joint Program scenario** — Jason applies to a co-owned program: [CP-05](../cross-persona/CP-05-joint-program-with-seeker-applicant.md)

---

## Feature Requests Surfaced

1. **Intake update flow** — `PATCH /api/v1/intake` to update an existing `UserIntakeResponse` record, wired to the "Update my needs" dashboard link. After save, re-run `MatchingService` and return fresh results. Affects: `IntakeResponsesController`, `IntakeQuestionnairePage.tsx`, dashboard `SeekerSection`.

2. **"Message this org" contact button** — On `OrganizationProfilePage`, a "Contact" or "Message" button that creates a `Conversation` between the current user and the organization's admin user (first `OrganizationMembership` where `role: :admin`). Affects: `OrganizationProfilePage.tsx`, `ConversationsController`.

3. **Application-linked messaging** — When a `ServiceApplication` is created, auto-create a `Conversation` tagged with `application_id` so Jason and the org can communicate within the context of the application. Affects: `ServiceApplicationsController`, `Conversation` model (add optional `application_id` FK).

4. **Program application window front-end guard** — Return `applications_open: true/false` in the `ProgramSerializer` and use it in `ProgramDetailPage` to conditionally render the Apply button. Affects: `ProgramSerializer`, `ProgramDetailPage.tsx`.

5. **Withdrawal confirmation modal** — Before calling `useWithdrawApplication`, show a confirmation dialog summarizing the application being withdrawn. Affects: `MyServicesPage.tsx`.

6. **Follow organizations** — Introduce a "Follow" concept (distinct from "Save") that affects feed ranking. Followed org announcements and new opportunities appear at higher priority. Affects: new `UserOrgFollow` model, `FeedController` priority logic, `OrganizationProfilePage.tsx`.
