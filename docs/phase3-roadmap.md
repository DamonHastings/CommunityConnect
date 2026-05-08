# Phase 3 Roadmap

Derived from the **Ancchor Use Case Matrix v2** (Google Sheets). The sheet's 34 v2 stories define the next development phase; the 12 v3 stories feed into P3 AI features already listed in [prioritized-features.md](prioritized-features.md).

Work is organized into three tracks. Tracks A and B are prerequisites for most of Track C.

---

## Track A — Persona Expansion

The sheet defines 12 persona types. The codebase's `profile_type` enum currently covers 6 (INS, ISP, ORG, EMP, VOL, and resource_navigator as a rough CM proxy). Six new types need to be added.

### New `profile_type` values to add (Ancchor code → internal name)

| Ancchor Code | Ancchor Persona          | Internal `profile_type` value | Priority |
| ------------ | ------------------------ | ----------------------------- | -------- |
| FND          | Funder / Grantmaker      | `funder`                      | 🔴 High  |
| HCP          | Healthcare / BH Provider | `healthcare_provider`         | 🔴 High  |
| GOV          | Government Agency        | `government_agency`           | 🟡 Mid   |
| FBO          | Faith-Based Organization | `faith_based_org`             | 🟡 Mid   |
| EDU          | Educational Institution  | `educational_institution`     | 🟡 Mid   |
| RES          | Researcher / Evaluator   | `researcher`                  | 🟢 Low   |

FND and HCP unlock the most v2 stories (closed-loop referrals, grant portfolio, healthcare handoffs) so they ship first.

### Per-persona work required for each new type

Each new persona needs the same set of changes:

1. **Migration** — add value to `profile_type` enum on `users` table
2. **Registration flow** — include in the profile type selector on the register page
3. **Profile page** — add any persona-specific fields (e.g., FND: grant focus areas; HCP: license type, specialties)
4. **Pundit policies** — extend `UserPolicy`, `OrganizationPolicy`, `ReferralPolicy`, etc. to handle new type
5. **Serializer** — ensure `UserSerializer` returns correct `intake_completed` logic (currently `nil` for non-seekers — verify this is correct for new types)
6. **Dashboard** — create or adapt a dashboard view for the persona (reuse existing patterns from org admin / navigator dashboards)

---

## Track B — Role / Capability Layer

The sheet models 5 cross-cutting capabilities that overlay on top of persona type:

| Ancchor Code    | Capability              | Applies To              | Current codebase state |
| --------------- | ----------------------- | ----------------------- | ---------------------- |
| ADV             | Advocate                | Any individual user     | Not modeled            |
| PSS             | Peer Support Specialist | ISP / ORG staff         | Not modeled            |
| CM              | Case Manager            | ORG / GOV / HCP staff   | Partially — `resource_navigator` is a profile_type, not a capability |
| ORGADM          | Org Administrator       | Any org-tier account    | Modeled via `OrganizationMembership#role` (admin/member) |
| FUNDER_REVIEWER | Funder Reviewer         | FND staff               | Not modeled            |

### Recommended approach

The full capability system requires a `UserCapability` join model (`user_id`, `capability`, `granted_by_user_id`, `organization_id`). This is a design spike — defer to a dedicated session.

**Short-term (Phase 3 start):** Add `peer_support_specialist` as a boolean flag on `User` (similar to `platform_admin`), granted by org admins. This unblocks PSS-gated user stories without requiring the full capability model.

ORGADM is already covered by `OrganizationMembership#role = :admin` — no changes needed.

CM is currently conflated with `resource_navigator` profile type. Leave as-is until the capability layer is designed; new GOV/HCP personas that need CM capabilities will use `resource_navigator` as a stopgap.

---

## Track C — Workflow Deepening

V2 stories for both new and existing personas, prioritized by story count and cross-persona dependency. Implement after Track A personas are in place.

### C1 — Closed-Loop Referrals (6 stories, AN-030–AN-035)
**Personas:** HCP, GOV referring to ORG/ISP

Currently `Referral` is one-directional (org/navigator → individual). Closed-loop referrals add:
- HCP/GOV can initiate referrals to other orgs (not just to individuals)
- Receiving org can accept/decline and update status
- Referral status change triggers a notification back to the sender
- Outcome field on Referral: `outcome` enum (pending / connected / not_reached / declined)

Model changes: add `org_to_org` referral type; add `outcome` to `Referral`; new `ReferralStatus` notification type.

### C2 — Funder Grant Portfolio Management (5 stories, AN-040–AN-044)
**Persona:** FND

FND orgs need to track programs they've funded across the platform:
- FND org profile page shows "Funded Programs" tab
- FND can mark a `ServiceApplication` (funding type) as "in portfolio"
- Portfolio dashboard: funded program list with status, award amount, disbursed flag, outcome summary
- FND can add notes to funded applications

Builds directly on the G-12 foundation grant review UX already in place.

### C3 — Government Constituent Referral Flows (4 stories, AN-050–AN-053)
**Persona:** GOV

- GOV users can refer constituents (individuals) to orgs/programs (same Referral model, new initiator type)
- Bulk referral: GOV uploads a list of constituent emails → batch Referral records created
- Inter-agency handoff: GOV can transfer a referral to another GOV org
- Dashboard view: GOV case worker sees all open constituent referrals and their status

### C4 — Peer Support Specialist Credential (3 stories, AN-036–AN-038)
**Persona:** ISP / ORG staff with PSS flag

- ORG admin can mark an org member as a Peer Support Specialist
- PSS-flagged users appear with a badge on the People (/professionals) page
- PSS users can be directly assigned to caseloads by CM/navigator users

### C5 — Researcher / Evaluator Data Access (3 stories, AN-060–AN-062)
**Persona:** RES

- RES profile type can request access to aggregate (anonymized) outcome data
- New `DataAccessRequest` model: RES user → admin reviews → grants scoped read access
- Export endpoint: `GET /api/v1/reports/outcomes` returns anonymized program outcome summaries
- Data sensitivity: only Public and Restricted fields; no PII/PHI

### C6 — Faith-Based Org Profile + Service Listing (2 stories, AN-054–AN-055)
**Persona:** FBO

FBO is structurally similar to ORG (community_org). Main differentiators:
- Add `faith_based_org` to `org_type` enum (currently nonprofit/business/school/foundation)
- FBO org profiles show denomination/affiliation field
- FBO appears in org category filter on /organizations

### C7 — Employer / EDU Volunteer & Job Pipeline (3 stories, AN-056–AN-058)
**Personas:** EMP, EDU

- EMP can post volunteer/internship opportunities tagged as `employer_partnership` type
- EDU can sponsor student volunteer hours (links student user → VolunteerHour → EDU org)
- Both EMP and EDU appear as distinct categories in the /organizations filter

---

## Implementation Order Summary

```
Phase 3 start
  └─ Track A: Add FND + HCP profile types (migration, registration, profile, dashboard)
  └─ Track A: Add GOV + FBO + EDU profile types
  └─ Track B: PSS boolean flag on User; design spike for full capability layer
  └─ Track C1: Closed-loop referrals (unblocked once HCP + GOV exist)
  └─ Track C2: Funder portfolio (unblocked once FND exists)
  └─ Track C3: GOV constituent flows (unblocked once GOV exists)
  └─ Track C4: PSS credential UX (unblocked once Track B flag ships)
  └─ Track A: Add RES profile type
  └─ Track C5: Researcher data access
  └─ Track C6: FBO org listing details
  └─ Track C7: EMP/EDU pipeline

Phase 4 (AI — Ancchor v3)
  └─ See P3 features in prioritized-features.md (AN-063–AN-069 approx.)
```

---

## Ancchor Sheet Reference

- **Sheet:** Ancchor_UseCase_Matrix_v2
- **URL:** https://docs.google.com/spreadsheets/d/1q6it8Lxs1C_kPZ8IZyK9E9o-3Ykrj9I35YZQZ0azCd4/edit
- **Backlog tab:** AN-001 through AN-069 (23 MVP / 34 v2 / 12 v3)
- **v2 stories targeted here:** AN-030 through AN-062 (approximate — see sheet for exact IDs)
- **v3 stories (AI):** AN-063 through AN-069 (approximate)
