# Scenario: Business Service Provider — Atnap

## Character Profile

**Atnap** is a Sacramento-based creative and business services studio that provides branding, communications, and operations consulting primarily to nonprofits and community organizations. Their business development lead, **Marcus-Adriel**, handles their CommunityConnect presence. Atnap wants to become discoverable to the organizations already on the platform — they see CC as a channel to find mission-aligned clients without cold outreach.

## Persona Type
`business_service_provider` (registered as an organization with `org_type: :business`)

## Platform Entry Point
Marcus-Adriel found CommunityConnect while researching how Sacramento nonprofits coordinate. He decides to register Atnap and create an org profile.

---

## Scenario A: Happy Path — Creating a Business Profile and Becoming Discoverable

### Context
Atnap creates their organizational profile on the platform, listing their services and making themselves searchable by community organizations.

### Step-by-Step Narrative

1. Marcus-Adriel registers as a new user: selects "Business / service provider" profile type → `POST /api/v1/auth/registration` → redirected to `/profile`.
2. Navigates to `/organizations/new` → fills in org details:
   - Name: "Atnap Studio"
   - Description: "Creative and operations studio for nonprofits and community organizations."
   - Org type: `business`
   - Category: `other` (no dedicated "business services" category exists)
   - Address: Sacramento, CA
   - Website and phone
3. Submits → `POST /api/v1/organizations` → `Organization` record created with `org_type: :business`.
4. System auto-creates `OrganizationMembership` for Marcus-Adriel with `role: :admin`.
5. Atnap's profile is now visible at `/organizations/:id` and searchable at `/organizations`.
6. Organizations browsing `/organizations` can filter by `org_type: business` to find service providers like Atnap.
7. Marcus-Adriel navigates to `/organizations/:id/manage` to configure Atnap's presence.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Org creation | `/organizations/new` | `POST /api/v1/organizations` |
| Org profile | `/organizations/:id` | `GET /api/v1/organizations/:id` |
| Org directory — type filter | `/organizations?type=business` | `GET /api/v1/organizations?org_type=business` |

### Expected Outcomes
- `Organization` record created with `org_type: :business`, geocoded.
- Atnap appears in `/organizations?type=business`.
- Marcus-Adriel has `role: :admin` in `organization_memberships`.
- Manage page shows all 6 tabs (Applications, Programs, Opportunities, Partners, Referrals, Announcements).

### Edge Cases
- **EC-A1** A community org browsing `/organizations` for a branding agency searches by keyword "branding" → pg_search looks across `name` (A), `description` (B), `mission` (C); if Atnap has "branding" in their description, they surface. The category filter (`other`) is too broad to be useful for this use case — there is no "business services" category (see feature request #1 below).
- **EC-A2** Marcus-Adriel tries to mark Atnap as `featured` → the `featured` flag is admin-only; only `platform_admin` users can set it.

---

## Scenario B: Happy Path — Posting a Partnership Opportunity

### Context
Atnap wants to offer a discounted branding package to one community org per quarter. They create a `partnership` type opportunity to make this offer discoverable.

### Step-by-Step Narrative

1. Marcus-Adriel navigates to the Opportunities tab in Atnap's manage page → "Add Opportunity."
2. Fills in:
   - Title: "Pro-Bono Branding Package — Q3 2026"
   - Type: `partnership`
   - Description: "Atnap is offering one nonprofit a full brand refresh at no cost this quarter."
   - Status: `open`
   - Application deadline
3. Submits → `POST /api/v1/organizations/:org_id/opportunities`.
4. Opportunity appears at `/opportunities?type=partnership`.
5. Community orgs browsing opportunities can discover and apply.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Create opportunity | `/organizations/:id/manage` | `POST /api/v1/organizations/:org_id/opportunities` |
| Opportunity directory | `/opportunities` | `GET /api/v1/opportunities` |

### Expected Outcomes
- `EngagementOpportunity` created with `opportunity_type: :partnership`, `status: :open`.
- Opportunity visible at `/opportunities?type=partnership`.
- Orgs (and individuals) can apply; Atnap admin reviews via Applications tab.

---

## Scenario C: Happy Path — Sending a Partner Connection Request to a Community Org

### Context
Marcus-Adriel has been browsing the platform and wants to formally connect with Better Youth as a potential ongoing client. He sends a partner connection request.

### Step-by-Step Narrative

1. Marcus-Adriel navigates to Better Youth's profile at `/organizations/:by_id`.
2. Clicks "Connect" / "Request Partnership" → `POST /api/v1/organizations/:atnap_id/partner_connections` with `{ target_org_id: by_id }`.
3. `PartnerConnection` created: `status: :pending`.
4. Better Youth's admin (Keisha) sees a `partner_request` feed item.
5. Keisha navigates to her Partners tab → reviews the request → accepts.
6. `PartnerConnection.status` → `accepted`.
7. Both orgs appear in each other's Partners tab.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Send partner request | `/organizations/:id` (org profile) | `POST /api/v1/organizations/:org_id/partner_connections` |
| Accept partner request | `/organizations/:id/manage` Partners tab | `PATCH /api/v1/partner_connections/:id` |

### Expected Outcomes
- `PartnerConnection` record exists with both org IDs and `status: :pending` initially.
- Keisha's feed shows the `partner_request` item.
- After acceptance, Atnap appears in BY's Partners tab and vice versa.

### Edge Cases
- **EC-C1** Keisha declines the request → `status: :declined`; neither party sees it in their Partners tab; the declined request is not retryable unless a new request is sent.
- **EC-C2** Atnap cancels the pending request before Keisha responds → `DELETE /api/v1/partner_connections/:id`; the record is removed.

---

## Gap Analysis

### Confirmed Gaps

| Gap ID | Description | Affected Step | Proposed Feature |
|--------|-------------|---------------|-----------------|
| G-07 | No org-to-org messaging. After the partner connection is accepted, Marcus-Adriel and Keisha have no in-platform communication channel as organizations. They must exchange personal messages via user-to-user DMs. | Scenario C, post-acceptance | "Message this org" action that creates a `Conversation` between the orgs' respective admin users |

### Friction Points

| FP ID | Description | Why it's friction | Improvement idea |
|-------|-------------|-------------------|-----------------|
| FP-07 | Partner request feed items link to the manage page, not the requesting org's profile | If a non-admin member of Better Youth sees Atnap's request in the feed, the link routes to a page they cannot access | Feed item URL should be the requesting org's profile page for non-admins |

---

## Cross-Persona Touchpoints

- **Community Org (Better Youth)** — receives Atnap's partner connection request: [CP-06](../cross-persona/CP-06-business-provider-connects-with-org.md)

---

## Feature Requests Surfaced

1. **"Business services" organization category** — The current 8 categories (food_bank, shelter, healthcare, education, housing, mental_health, youth_services, other) do not include a business services or professional services option. Atnap must use `other`. A `professional_services` or `business_services` category would make these orgs searchable by purpose rather than keyword. Affects: `Organization` `category` enum, org creation form, org directory filters.

2. **Services offered on org profile** — Business-type orgs like Atnap have no structured way to list the specific services they offer at the org level (analogous to `services_offered` on individual users). A `services_offered` array on `Organization` would let keyword search surface Atnap for queries like "branding" or "communications." Affects: `Organization` model, org profile display, pg_search scope.

3. **"Partner connection" context document** — When Atnap sends a partner request, there's no way to attach a proposal, capability statement, or any context beyond what's in their org profile. A `message` or `proposal` text field on `PartnerConnection` would allow meaningful first contact without a separate DM. Affects: `PartnerConnection` model, partner request send form.

4. **Business-type org landing page** — A dedicated `/service-providers` route analogous to `/professionals`, showing business and foundation orgs with filters for service category. This separates service providers from nonprofits in the browsing experience. Affects: new frontend route + page, reuses `OrganizationCard` component.
