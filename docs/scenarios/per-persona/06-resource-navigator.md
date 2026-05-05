# Scenario: Resource Navigator — Marcus Webb

## Character Profile

**Marcus Webb**, 38, is a licensed social worker employed by Pathways Outreach, a small Sacramento nonprofit that helps formerly incarcerated individuals reintegrate into the community. Marcus manages a caseload of 15–20 clients at any given time, connecting them to housing, employment, mental health, and legal resources. A colleague who was already using CommunityConnect to find housing resources told Marcus about the platform. Marcus sees it as a tool to reduce the time he spends manually researching and connecting clients to resources.

## Persona Type
`resource_navigator`

## Platform Entry Point
Colleague referral (another social worker). Marcus accesses CC from a work desktop and is experienced with case management software.

---

## Scenario A: Happy Path — Registration and Joining an Organization

### Context
Marcus registers, sets up his profile, and joins Pathways Outreach on the platform so he can send referrals on behalf of the organization.

### Step-by-Step Narrative

1. Marcus visits CommunityConnect → clicks "Sign up."
2. Completes Step 1: name, email, password → `POST /api/v1/auth/registration`.
3. Completes Step 2: selects "Resource navigator / advocate" → submits.
4. System creates `User` with `profile_type: :resource_navigator` → redirects to `/profile`.
5. Marcus fills in his profile: bio, city (Sacramento), state (CA), phone, availability.
6. Saves → `PATCH /api/v1/auth/profile`.
7. Marcus navigates to `/dashboard` → sees the **navigator section**: referral stats cards (pending/accepted counts), "Find resources for a client" quick links, My Organizations section.
8. Marcus navigates to `/organizations` and searches for "Pathways Outreach."
9. He finds the org page → someone (the org's admin) has already created it. He cannot add himself as a member from the org's public profile — **there is no "Join this org" or "Request membership" button** (this is a gap — see G-01 related friction). He must be invited by the admin.
10. Pathways Outreach admin navigates to `/organizations/:id/manage` → adds Marcus as a member.
11. Marcus refreshes `/dashboard` → My Organizations section now shows Pathways Outreach.
12. Marcus navigates to `/organizations/:id/manage` → sees only the **Referrals tab** (not all 6 tabs — non-admin members of orgs only have access to referral-sending functionality per `OrganizationPolicy`).

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Two-step registration | `/register` | `POST /api/v1/auth/registration` |
| Profile edit | `/profile` | `PATCH /api/v1/auth/profile` |
| Dashboard — navigator section | `/dashboard` | — |
| Org directory search | `/organizations` | `GET /api/v1/organizations?q=pathways` |
| Add member (by admin) | `/organizations/:id/manage` | `POST /api/v1/organizations/:id/members` |

### Expected Outcomes
- `User` record has `profile_type: :resource_navigator`.
- Dashboard shows the navigator section with referral stats (0 pending, 0 accepted initially).
- After being added as a member, Marcus sees Pathways Outreach in his My Organizations section on the dashboard.
- Marcus's manage page access is limited to the Referrals tab.

### Edge Cases
- **EC-A1** No one has created Pathways Outreach on the platform yet → Marcus can create the organization himself. Any authenticated user can create an org, and the creator automatically becomes an admin member. **If Marcus creates the org, he becomes admin — which gives him all 6 manage tabs, not just Referrals.** This is a role inconsistency: a navigator who creates an org gets full admin access rather than navigator-appropriate member access.
- **EC-A2** Marcus tries to access the Applications or Programs tab after joining as a member → `OrganizationPolicy` should return 403; the tab should be hidden from non-admin members.
- **EC-A3** Marcus tries to switch his profile type to `individual_professional` via profile edit → **`resource_navigator` is not in the profile type dropdown** (see G-06).

---

## Scenario B: Happy Path — Sending a Referral to a Client

### Context
Marcus has a client, Jason (already registered on CommunityConnect), who needs to be referred to Better Youth's summer mentorship program. Marcus sends the referral through the platform.

### Step-by-Step Narrative

1. Marcus navigates to `/organizations/:pathways_id/manage` → Referrals tab.
2. Sees the referral send form: email input, message input.
3. Marcus types Jason's registered email and a message explaining the referral context.
4. Submits → `POST /api/v1/organizations/:pathways_id/referrals` with `{ referred_user_email: "jason@example.com", message: "..." }`.
5. System looks up Jason by email → creates `Referral`: `referring_org_id: Pathways`, `referred_user_id: Jason`, `status: :pending`.
6. Jason receives a `referral` feed item.
7. Marcus sees the referral in the Referrals tab with status "Pending."

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Send referral | `/organizations/:id/manage` Referrals tab | `POST /api/v1/organizations/:org_id/referrals` |
| Activity feed — referral (Jason side) | `/feed` | `GET /api/v1/feed` |
| Referral tracking | `/organizations/:id/manage` Referrals tab | — |

### Expected Outcomes
- `Referral` record created: `status: :pending`, `referring_org_id: Pathways`, `referred_user_id: Jason`.
- Jason's activity feed shows a `referral` item.
- Marcus sees the referral in the Referrals tab with the correct status.
- Marcus's dashboard navigator section shows 1 pending referral.

### Edge Cases
- **EC-B1** Jason's email is not registered → API returns "User not found"; Marcus sees a friendly error. **Marcus has no fallback to invite Jason to register** (no invite-by-email flow exists).
- **EC-B2** Marcus wants to refer Jason to a specific program, not just to Pathways Outreach → **the `target_type`/`target_id` polymorphic fields on `Referral` are not settable via the UI** (see G-03). The referral arrives without a target program context.
- **EC-B3** Marcus sends multiple referrals to different clients on the same day → the Referrals tab shows all referrals in chronological order with no grouping by client. As caseload grows, this becomes unwieldy (see G-01).

---

## Scenario C: Happy Path — Tracking Referral Outcomes

### Context
Marcus wants to check whether clients he referred have accepted the referrals and followed up with the organizations.

### Step-by-Step Narrative

1. Marcus navigates to `/dashboard` → navigator section shows: "2 Pending Referrals, 1 Accepted."
2. Marcus clicks through to `/organizations/:pathways_id/manage` → Referrals tab.
3. Referrals tab lists all referrals sent by Pathways Outreach with current statuses.
4. Marcus sees Jason's referral status changed from "Pending" to "Accepted."
5. Marcus has no way to see whether Jason then applied to the referenced program after accepting. (**Gap: no post-acceptance tracking**, see G-04.)

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Navigator dashboard stats | `/dashboard` | — |
| Referrals tab | `/organizations/:id/manage` | — |

### Expected Outcomes
- Dashboard stats reflect the current referral statuses accurately.
- Referrals tab lists all referrals with name, status, and date.

### Edge Cases
- **EC-C1** A client declines a referral → status shows "Declined" in the Referrals tab. Marcus has no follow-up action available — he cannot resend or modify the declined referral.
- **EC-C2** Marcus has sent 30+ referrals over several months → the Referrals tab has no pagination or filtering. Scrolling through a flat list becomes unmanageable (see G-01 — no client grouping).

---

## Scenario D: Finding Resources for a Client

### Context
A new client comes to Marcus asking for housing and employment resources. Marcus uses the platform to find relevant organizations and programs.

### Step-by-Step Narrative

1. Marcus navigates to `/dashboard` → navigator section → "Find resources for a client" — sees two quick-link buttons: "Browse Organizations" and "Browse Programs."
2. Clicks "Browse Organizations" → `/organizations` with no pre-applied context filters.
3. Marcus manually searches for housing organizations in Sacramento.
4. Finds several candidates, makes a note externally, then returns to the Referrals tab to send the referral.

**The disconnect:** Marcus must manually bridge between finding a resource and sending a referral for a specific client. There is no "refer this org/program to a client" action on the org/program detail page itself (see G-17).

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Navigator dashboard quick links | `/dashboard` | — |
| Org directory | `/organizations` | `GET /api/v1/organizations` |
| Program directory | `/programs` | `GET /api/v1/programs` |

### Expected Outcomes
- Quick links lead to general browse pages (current behavior).
- No client context is pre-applied to the search.

---

## Gap Analysis

### Confirmed Gaps

| Gap ID | Description | Affected Step | Proposed Feature |
|--------|-------------|---------------|-----------------|
| G-01 | No client/caseload management. Marcus has 15–20 clients but the platform has no concept of a client list attached to a navigator. Referrals are sent by email with no grouping. Over time, the Referrals tab becomes a flat, unsorted list with no way to see all activity for a single client. | Scenario B, Step 3; Scenario C, EC-C2 | `NavigatorClient` model: navigator saves a client by user ID; dashboard shows "My Clients" section with per-client referral history; referral send form allows selecting from the client list |
| G-03 | Referral target not settable via UI. Marcus cannot specify a target Program or Organization when sending a referral from the Referrals tab — the form only takes email + message. The `Referral` model has `target_type`/`target_id` polymorphic fields but the UI doesn't use them. | Scenario B, Step 3 | Add a target selector to the referral form; pre-fill when "Refer to this program" is triggered from a program detail page |
| G-04 | No feedback loop after referral accepted. Marcus sends a referral, Jason accepts it, but Marcus gets no notification or feed event. He must manually check the Referrals tab periodically. There's no signal when Jason takes the next step (e.g., applies to the targeted program). | Scenario C, Step 5 | Feed event type `referral_accepted` targeting the referring navigator; optional `referral_applied` event if referral target matches a subsequent `ProgramApplication` |
| G-06 | `resource_navigator` excluded from profile type switch dropdown. Marcus cannot change his profile type via the edit form. | Scenario A, EC-A3 | Add all 6 profile types to the `ProfilePage.tsx` schema and dropdown |
| G-10 | Navigator "Find resources" dashboard links are uncontextualized. The quick links in `NavigatorSection` point to general browse pages with no client context, no pre-applied filters, and no way to search on behalf of a specific client's needs. | Scenario D | "Search on behalf of client" flow: navigator selects a client (from client list), the system runs `MatchingService` with that client's `UserIntakeResponse` or manually entered needs, and returns matched resources |
| G-15 | No way to find users by name. Marcus cannot search for a client by name — he can only look them up by email in the referral form. If he doesn't have the exact email, he's blocked. | Scenario B, Step 3 | User search endpoint `GET /api/v1/users/search?q=name` scoped to authenticated navigators and org admins |
| G-16 | No post-registration onboarding for navigator persona. After registering, Marcus lands on `/profile` with no guidance on joining an org, finding resources, or understanding his role on the platform. | Scenario A, Step 4 | First-login onboarding card for navigators: (1) Join or create your organization, (2) Find a client on the platform, (3) Send your first referral |
| G-17 | Navigator can only send referrals from OrgManagePage. When Marcus is browsing a program detail page and thinks "this would help Jason," he must navigate separately to the org's manage page and re-enter the information. There is no "Refer a client to this program" button on resource discovery pages. | Scenario D | "Refer a client" button on `ProgramDetailPage` and `OrganizationProfilePage` that pre-fills `target_type`/`target_id` and navigates to the referral send form |

### Friction Points

| FP ID | Description | Why it's friction | Improvement idea |
|-------|-------------|-------------------|-----------------|
| FP-01 | Referral send requires exact registered email | Marcus must know the exact email his client used to register. If the client registered with a different email than the one Marcus has on file, the lookup fails with no helpful alternative. | Add name-based search with email confirmation; or allow navigators to invite unregistered clients via email |
| FP-02 | Navigator has no active-org context indicator on dashboard | If Marcus is a member of multiple organizations, the navigator dashboard stats (pending/accepted referrals) aggregate across all orgs with no indication of which org generated which stat. | Show org name/badge next to each stat card; allow filtering navigator stats by org |

---

## Cross-Persona Touchpoints

- **Individual Seeker (Jason)** — Marcus refers Jason to a program: [CP-01](../cross-persona/CP-01-navigator-refers-seeker-to-program.md)
- **Community Org (Pathways Outreach)** — Marcus acts as an org member: [CP-07](../cross-persona/CP-07-navigator-joins-org-sends-referrals.md)

---

## Feature Requests Surfaced

1. **Client/caseload management** — `NavigatorClient` model: `navigator_id` (FK → User), `client_id` (FK → User), `notes` (text), `created_at`. Navigator dashboard shows "My Clients" list. Referral send form allows selecting a client from this list (pre-fills email). Client detail view shows all referrals sent for that client. Affects: new model + controller, `NavigatorSection` in `DashboardPage.tsx`, `ReferralsTab`.

2. **Referral send with target selector** — Add a "Target resource (optional)" field to the referral form. Accepts a Program or Organization search result. Populates `target_type`/`target_id` in the POST body. Pre-filled when triggered from a resource detail page. Affects: `ReferralsTab`, referral creation form, `ProgramDetailPage.tsx`, `OrganizationProfilePage.tsx`.

3. **Referral accepted/applied feed events** — In `ReferralsController#update`, when `status` transitions to `accepted`, create a feed item of type `referral_accepted` visible to the referring navigator and the referring org's admin. Optionally, when a `ProgramApplication` is created that matches a referral's `target_id`, create a `referral_applied` event. Affects: `ReferralsController`, `FeedController`.

4. **"Refer a client" button on resource pages** — On `ProgramDetailPage.tsx` and `OrganizationProfilePage.tsx`, show a "Refer a client to this program/org" button for authenticated `resource_navigator` users. Clicking it navigates to the referral form with `target_type` and `target_id` pre-populated. Affects: both frontend pages, `ReferralsTab` or a new standalone referral-create page.

5. **Navigator client context search** — "Search for a client" mode on the navigator dashboard: navigator inputs a client's needs (or selects from their client list), system runs `MatchingService` and returns matched organizations + programs. Allows browsing on behalf of a client without navigating to general org/program directories. Affects: new frontend component in `NavigatorSection`, `MatchingService` (add a standalone call path not tied to the current user's intake).

6. **User search endpoint** — `GET /api/v1/users/search?q=name` accessible to authenticated `resource_navigator` and `community_org`/`business_service_provider` users. Returns paginated results with `id`, `first_name`, `last_name`, `email`, `profile_type`. Used in the referral send form autocomplete. Affects: new action in `UsersController`, `UserPolicy`.
