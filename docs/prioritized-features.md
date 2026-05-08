# CommunityConnect — Prioritized Feature List

Features are derived from the [use cases](use-cases.md) and prioritized by:

- **P0** — Foundational: blocks multiple use cases; platform can't function without it
- **P1** — Core value: directly enables the primary journeys for most actor types
- **P2** — Differentiating: improves experience and enables secondary journeys
- **P3** — Advanced / AI-powered: maps to Ancchor sheet v3 phase

Items marked ✅ are already built.

---

## P0 — Foundational

| #   | Feature                                                                                                            | Use Cases        | Status | Notes                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| 1   | User registration and authentication                                                                               | All              | ✅     | Devise + JWT, fully implemented                                                                                    |
| 2   | Organization profiles (create, edit, discover)                                                                     | UC-2, UC-3, UC-6 | ✅     | CRUD, geocoding, full-text search                                                                                  |
| 3   | Organization discoverability (search + filter)                                                                     | UC-2, UC-3, UC-4 | ✅     | pg_search, category/location filters                                                                               |
| 4   | Individual user profiles (beyond auth — bio, services offered/needed, role type)                                   | UC-1, UC-5       | ✅     | profile_type enum, bio, phone, city/state, website, availability, services_offered/needed arrays; edit at /profile |
| 5   | Account/profile type system (individual seeker, individual professional, community org, business/service provider) | UC-1, UC-3, UC-5 | ✅     | 6-way enum on User: individual_seeker, individual_professional, community_org, business_service_provider, volunteer, resource_navigator |

---

## P1 — Core Value

| #   | Feature                                               | Use Cases  | Status | Notes                                                                                                           |
| --- | ----------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| 6   | Intake questionnaire / needs assessment               | UC-1       | ✅     | Multi-step form on signup for individual_seeker; responses drive service matching; upsert pattern on UserIntakeResponse |
| 7   | Need-based service and resource matching              | UC-1       | ✅     | Matches intake responses to org services and opportunities; /dashboard shows ranked results                     |
| 8   | Service application workflow                          | UC-1       | ✅     | ServiceApplication model (pending/approved/rejected/withdrawn); org manage page Applications tab; My Services seeker view |
| 9   | Individual service management dashboard               | UC-1       | ✅     | /my-services: active applications, approved services, volunteer hours log, saved orgs, program applications     |
| 10  | Program creation and management                       | UC-2, UC-6 | ✅     | Program model with phases, partners (ProgramOrganization join), capacity, dates, application windows; /programs and /organizations/:id/manage Programs tab |
| 11  | Application intake and processing for programs        | UC-2, UC-6 | ✅     | ProgramApplication model; org admins approve/reject from manage page; applicants see status in My Services      |
| 12  | Individual professional profiles with service tagging | UC-5       | ✅     | individual_professional profile_type; specialty, services_offered, communities_served; discoverable via /professionals People page |

---

## P2 — Differentiating

| #   | Feature                                   | Use Cases  | Status | Notes                                                                                              |
| --- | ----------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------------- |
| 13  | Partner discovery and connection tools    | UC-2       | ✅     | PartnerConnection model (pending/accepted/declined); Request Partnership button on org profiles; Partners tab in org manage page |
| 14  | Joint / multi-org program ownership       | UC-6       | ✅     | ProgramOrganization join table (owner/partner roles); co-org admins share application queue        |
| 15  | In-platform messaging / contact mechanism | UC-1, UC-5 | ✅     | Conversation + ConversationParticipant + Message models; unread badge in sidebar; message icons on partner/applicant cards |
| 16  | Org visibility and outreach tools         | UC-2       | ✅     | Announcement model; featured listings; org follow/unfollow (OrgFollower); activity feed (/feed)    |
| 17  | Business / service-provider profile type  | UC-3       | ✅     | business_service_provider profile_type; org_type enum (nonprofit/business/school/foundation)        |
| 18  | Funding and grant application tooling     | UC-6       | ✅     | funding opportunity_type on EngagementOpportunity; award_amount + disbursed on ServiceApplication; foundation-specific grant review UX |
| 19  | Org-to-individual referrals               | UC-1, UC-4 | ✅     | Referral model (referring_org → referred_user → target Program or Org); /caseload for navigator-driven referrals; referral feed items |

---

## P3 — Advanced / AI-Powered

Maps to **Ancchor sheet v3 phase** (12 stories). See also [phase3-roadmap.md](phase3-roadmap.md) for the full v2+v3 breakdown.

| #   | Feature                                 | Use Cases  | Status | Notes                                                                                                                           |
| --- | --------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 20  | AI agent: institutional / org profiling | UC-4       | —      | AI reads org or school profile and infers needs, demographics, and service gaps                                                 |
| 21  | AI agent: smart matching and referrals  | UC-1, UC-4 | —      | AI suggests relevant resources to individuals and orgs proactively; powers Jason's resource feed and Goings Academy's referrals |
| 22  | AI agent: outreach drafting             | UC-2       | —      | AI drafts partnership outreach messages for BY to send to schools and orgs                                                      |
| 23  | AI agent: involvement proposals         | UC-2, UC-6 | —      | AI suggests how orgs or individuals could partner with or participate in existing programs                                      |

---

## Feature → Use Case Coverage Matrix

| Feature                          | UC-1 Jason | UC-2 Better Youth | UC-3 Atnap | UC-4 Goings Academy | UC-5 Rachel | UC-6 BY+WWW |
| -------------------------------- | :--------: | :---------------: | :--------: | :-----------------: | :---------: | :---------: |
| Org profiles (✅)                |            |         ●         |     ●      |          ●          |             |      ●      |
| Org search/discovery (✅)        |            |         ●         |     ●      |          ●          |             |             |
| Auth (✅)                        |     ●      |         ●         |     ●      |                     |      ●      |      ●      |
| Individual profiles (✅)         |     ●      |                   |            |                     |      ●      |             |
| Profile type system (✅)         |     ●      |         ●         |     ●      |                     |      ●      |      ●      |
| Intake questionnaire (✅)        |     ●      |                   |            |                     |             |             |
| Service matching (✅)            |     ●      |                   |            |          ●          |             |             |
| Service application workflow (✅)|     ●      |                   |            |                     |             |             |
| Individual dashboard (✅)        |     ●      |                   |            |                     |             |             |
| Program creation (✅)            |            |         ●         |            |                     |             |      ●      |
| Application intake (✅)          |            |         ●         |            |                     |             |      ●      |
| Individual professional (✅)     |            |                   |            |                     |      ●      |             |
| Partner discovery (✅)           |            |         ●         |            |                     |             |      ●      |
| Joint program ownership (✅)     |            |                   |            |                     |             |      ●      |
| In-platform messaging (✅)       |     ●      |                   |            |                     |      ●      |             |
| Org outreach tools (✅)          |            |         ●         |     ●      |                     |             |             |
| Business profile type (✅)       |            |                   |     ●      |                     |             |             |
| Funding tooling (✅)             |            |                   |            |                     |             |      ●      |
| Org-to-individual referrals (✅) |     ●      |                   |            |          ●          |             |             |
| AI: institutional profiling      |            |                   |            |          ●          |             |             |
| AI: smart matching               |     ●      |                   |            |          ●          |             |             |
| AI: outreach drafting            |            |         ●         |            |                     |             |             |
| AI: involvement proposals        |            |         ●         |            |                     |             |      ●      |
