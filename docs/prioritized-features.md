# CommunityConnect — Prioritized Feature List

Features are derived from the [use cases](use-cases.md) and prioritized by:

- **P0** — Foundational: blocks multiple use cases; platform can't function without it
- **P1** — Core value: directly enables the primary journeys for most actor types
- **P2** — Differentiating: improves experience and enables secondary journeys
- **P3** — Advanced / AI-powered: Phase 2 roadmap

Items marked ✅ are already built. Items without a mark need to be built.

---

## P0 — Foundational

| #   | Feature                                                                                                            | Use Cases        | Status | Notes                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| 1   | User registration and authentication                                                                               | All              | ✅     | Devise + JWT, fully implemented                                                                                    |
| 2   | Organization profiles (create, edit, discover)                                                                     | UC-2, UC-3, UC-6 | ✅     | CRUD, geocoding, full-text search                                                                                  |
| 3   | Organization discoverability (search + filter)                                                                     | UC-2, UC-3, UC-4 | ✅     | pg_search, category/location filters                                                                               |
| 4   | Individual user profiles (beyond auth — bio, services offered/needed, role type)                                   | UC-1, UC-5       | ✅     | profile_type enum, bio, phone, city/state, website, availability, services_offered/needed arrays; edit at /profile |
| 5   | Account/profile type system (individual seeker, individual professional, community org, business/service provider) | UC-1, UC-3, UC-5 | ✅     | 4-way enum on User; selected during registration (step 2); drives label display throughout app                     |

---

## P1 — Core Value

| #   | Feature                                               | Use Cases  | Status | Notes                                                                                                           |
| --- | ----------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| 6   | Intake questionnaire / needs assessment               | UC-1       | ✅     | Multi-step form on signup for individuals seeking resources; responses drive service matching                   |
| 7   | Need-based service and resource matching              | UC-1       | ✅     | Match questionnaire responses to available org services and opportunities                                       |
| 8   | Service application workflow                          | UC-1       | —      | Individuals apply to services/resources; orgs receive and manage applications                                   |
| 9   | Individual service management dashboard               | UC-1       | —      | Jason tracks which services he's applied to, connected with, and their status                                   |
| 10  | Program creation and management                       | UC-2, UC-6 | —      | Richer than current EngagementOpportunity; programs have phases, partners, capacity, dates, application windows |
| 11  | Application intake and processing for programs        | UC-2, UC-6 | —      | Orgs receive applications, review, approve/reject, communicate with applicants                                  |
| 12  | Individual professional profiles with service tagging | UC-5       | —      | Rachel-type profiles: specialty, service type, communities served, availability                                 |

---

## P2 — Differentiating

| #   | Feature                                   | Use Cases  | Status | Notes                                                                                              |
| --- | ----------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------------- |
| 13  | Partner discovery and connection tools    | UC-2       | —      | Orgs can search for and invite other orgs/individuals as program partners                          |
| 14  | Joint / multi-org program ownership       | UC-6       | —      | A program can have multiple owning orgs; co-admins manage shared application queue                 |
| 15  | In-platform messaging / contact mechanism | UC-1, UC-5 | —      | Jason contacts service providers; Rachel is contacted by orgs and individuals                      |
| 16  | Org visibility and outreach tools         | UC-2       | —      | Featured listings, suggested connections, announcement broadcasting                                |
| 17  | Business / service-provider profile type  | UC-3       | —      | Atnap-style profiles: commercial studio/agency targeting org clients; distinct from community orgs |
| 18  | Funding and grant application tooling     | UC-6       | —      | Joint programs can publish funding needs; funders or grant-makers can respond                      |
| 19  | Org-to-individual referrals               | UC-1, UC-4 | —      | Service providers can refer individuals to other relevant orgs or programs on the platform         |

---

## P3 — Advanced / AI-Powered (Phase 2)

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
| Individual profiles              |     ●      |                   |            |                     |      ●      |             |
| Profile type system              |     ●      |         ●         |     ●      |                     |      ●      |      ●      |
| Intake questionnaire             |     ●      |                   |            |                     |             |             |
| Service matching                 |     ●      |                   |            |          ●          |             |             |
| Service application workflow     |     ●      |                   |            |                     |             |             |
| Individual dashboard             |     ●      |                   |            |                     |             |             |
| Program creation                 |            |         ●         |            |                     |             |      ●      |
| Application intake               |            |         ●         |            |                     |             |      ●      |
| Individual professional profiles |            |                   |            |                     |      ●      |             |
| Partner discovery                |            |         ●         |            |                     |             |      ●      |
| Joint program ownership          |            |                   |            |                     |             |      ●      |
| In-platform messaging            |     ●      |                   |            |                     |      ●      |             |
| Org outreach tools               |            |         ●         |     ●      |                     |             |             |
| Business profile type            |            |                   |     ●      |                     |             |             |
| Funding tooling                  |            |                   |            |                     |             |      ●      |
| Org-to-individual referrals      |     ●      |                   |            |          ●          |             |             |
| AI: institutional profiling      |            |                   |            |          ●          |             |             |
| AI: smart matching               |     ●      |                   |            |          ●          |             |             |
| AI: outreach drafting            |            |         ●         |            |                     |             |             |
| AI: involvement proposals        |            |         ●         |            |                     |             |      ●      |
