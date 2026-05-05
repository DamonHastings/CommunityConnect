# CommunityConnect — Scenario Documentation

This directory contains comprehensive user flow scenarios for all six CommunityConnect persona types, plus cross-persona interaction scenarios. Each document serves two purposes: a **walkable test script** with explicit expected outcomes, and a **feature discovery tool** that surfaces gaps and friction points in the current platform.

---

## Per-Persona Files

| File | Character | Persona Type | Key Flows |
|------|-----------|-------------|-----------|
| [01-individual-seeker.md](per-persona/01-individual-seeker.md) | Jason | `individual_seeker` | Registration → intake → matching → apply → referral |
| [02-individual-professional.md](per-persona/02-individual-professional.md) | Rachel Brown | `individual_professional` | Profile → directory → apply to partnership opp → receive message |
| [03-community-org.md](per-persona/03-community-org.md) | Better Youth | `community_org` | Org creation → opportunities → programs → applications → partners → referrals |
| [04-business-service-provider.md](per-persona/04-business-service-provider.md) | Atnap | `business_service_provider` | Org profile → discoverability → partner connection → post opportunity |
| [05-volunteer.md](per-persona/05-volunteer.md) | DeShawn Carter | `volunteer` | Registration → browse opps → apply → approval → (gap: hours tracking) |
| [06-resource-navigator.md](per-persona/06-resource-navigator.md) | Marcus Webb | `resource_navigator` | Join org → send referrals → track status → (gap: no client list) |

---

## Cross-Persona Scenarios

| File | Actors | Core Interaction |
|------|--------|-----------------|
| [CP-01](cross-persona/CP-01-navigator-refers-seeker-to-program.md) | Marcus + Jason + Better Youth | Navigator finds program, refers seeker, seeker applies |
| [CP-02](cross-persona/CP-02-org-refers-seeker-directly.md) | Better Youth + Jason | Org sends referral directly to seeker by email |
| [CP-03](cross-persona/CP-03-volunteer-applies-to-org-opportunity.md) | DeShawn + Better Youth | Volunteer applies to opportunity, org reviews and approves |
| [CP-04](cross-persona/CP-04-professional-partners-with-org.md) | Rachel + Better Youth | Professional applies to partnership opportunity, org accepts |
| [CP-05](cross-persona/CP-05-joint-program-with-seeker-applicant.md) | Better Youth + Wild Wild West + Jason | Joint program created, seeker applies, both orgs review |
| [CP-06](cross-persona/CP-06-business-provider-connects-with-org.md) | Atnap + Better Youth | Business sends partner connection request, org accepts |
| [CP-07](cross-persona/CP-07-navigator-joins-org-sends-referrals.md) | Marcus + Pathways Outreach | Navigator joins org as member, accesses referral workflow |

---

## Consolidated Gap Index

All confirmed gaps surfaced across the scenario documents. Each entry links to the originating file.

| Gap ID | Description | Originating File |
|--------|-------------|-----------------|
| G-01 | No client/caseload management for navigators | [06](per-persona/06-resource-navigator.md), [CP-01](cross-persona/CP-01-navigator-refers-seeker-to-program.md) |
| G-02 | No volunteer hours tracking post-approval | [05](per-persona/05-volunteer.md), [CP-03](cross-persona/CP-03-volunteer-applies-to-org-opportunity.md) |
| G-03 | Referral target (Program/Org) not settable via UI — API supports it | [06](per-persona/06-resource-navigator.md), [CP-01](cross-persona/CP-01-navigator-refers-seeker-to-program.md) |
| G-04 | Navigator gets no feed event when referred user accepts/applies | [06](per-persona/06-resource-navigator.md), [CP-01](cross-persona/CP-01-navigator-refers-seeker-to-program.md) |
| G-05 | Intake cannot be re-submitted after initial completion (uniqueness constraint) | [01](per-persona/01-individual-seeker.md) |
| G-06 | `volunteer` and `resource_navigator` excluded from profile type switch dropdown | [05](per-persona/05-volunteer.md), [06](per-persona/06-resource-navigator.md) |
| G-07 | No org-to-org messaging — only user-to-user | [03](per-persona/03-community-org.md), [CP-06](cross-persona/CP-06-business-provider-connects-with-org.md) |
| G-08 | No messaging thread attached to applications | [01](per-persona/01-individual-seeker.md), [CP-03](cross-persona/CP-03-volunteer-applies-to-org-opportunity.md) |
| G-09 | No "re-run matching" trigger for seeker when needs change | [01](per-persona/01-individual-seeker.md) |
| G-10 | Navigator's "Find resources" dashboard links are uncontextualized | [06](per-persona/06-resource-navigator.md) |
| G-11 | No volunteer-specific browse page with skill/location filters | [05](per-persona/05-volunteer.md) |
| G-12 | Foundation org type has no funder flow or specialized opportunity form | [03](per-persona/03-community-org.md), [CP-05](cross-persona/CP-05-joint-program-with-seeker-applicant.md) |
| G-13 | Program applications not reviewable in OrganizationManagePage Applications tab | [03](per-persona/03-community-org.md), [CP-05](cross-persona/CP-05-joint-program-with-seeker-applicant.md) |
| G-14 | No "follow org" concept for prioritized announcement delivery | [01](per-persona/01-individual-seeker.md), [03](per-persona/03-community-org.md) |
| G-15 | No user search outside the professionals directory | [03](per-persona/03-community-org.md), [06](per-persona/06-resource-navigator.md) |
| G-16 | No post-registration onboarding checklist for non-seeker personas | [05](per-persona/05-volunteer.md), [06](per-persona/06-resource-navigator.md) |
| G-17 | Navigator can only send referrals from OrgManagePage — not from Program/Org detail pages | [06](per-persona/06-resource-navigator.md), [CP-07](cross-persona/CP-07-navigator-joins-org-sends-referrals.md) |
| G-18 | No feed event when a volunteer withdraws an application | [05](per-persona/05-volunteer.md), [CP-03](cross-persona/CP-03-volunteer-applies-to-org-opportunity.md) |
| G-19 | Seeker cannot message an org directly from org profile | [01](per-persona/01-individual-seeker.md) |
| G-20 | No impact/outcome reporting after programs complete | [03](per-persona/03-community-org.md), [CP-05](cross-persona/CP-05-joint-program-with-seeker-applicant.md) |

---

## Consolidated Friction Point Index

| FP ID | Description | Originating File |
|-------|-------------|-----------------|
| FP-01 | Referral send requires exact email — no name search fallback | [06](per-persona/06-resource-navigator.md), [CP-02](cross-persona/CP-02-org-refers-seeker-directly.md) |
| FP-02 | Navigator has no active-org context indicator on dashboard | [06](per-persona/06-resource-navigator.md) |
| FP-03 | Volunteer opportunity list has no skills/location filter | [05](per-persona/05-volunteer.md) |
| FP-04 | Program application window enforcement is backend-only (Apply button may show when window is closed) | [01](per-persona/01-individual-seeker.md), [CP-05](cross-persona/CP-05-joint-program-with-seeker-applicant.md) |
| FP-05 | Referral form has no email autocomplete for org admins | [03](per-persona/03-community-org.md), [CP-02](cross-persona/CP-02-org-refers-seeker-directly.md) |
| FP-06 | No confirmation dialog before application withdrawal | [01](per-persona/01-individual-seeker.md), [05](per-persona/05-volunteer.md) |
| FP-07 | Partner request feed items link to manage page (inaccessible to non-admin members) | [03](per-persona/03-community-org.md), [CP-06](cross-persona/CP-06-business-provider-connects-with-org.md) |

---

## Scenario × Gap Coverage Matrix

|       | G-01 | G-02 | G-03 | G-04 | G-05 | G-06 | G-07 | G-08 | G-09 | G-10 | G-11 | G-12 | G-13 | G-14 | G-15 | G-16 | G-17 | G-18 | G-19 | G-20 |
|-------|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|
| 01 Seeker |  |  |  |  | ● |  |  | ● | ● |  |  |  |  | ● |  |  |  |  | ● |  |
| 02 Professional |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 03 Org |  |  |  |  |  |  | ● |  |  |  |  | ● | ● | ● | ● |  |  |  |  | ● |
| 04 Business |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 05 Volunteer |  | ● |  |  |  | ● |  |  |  |  | ● |  |  |  |  | ● |  | ● |  |  |
| 06 Navigator | ● |  | ● | ● |  | ● |  |  |  | ● |  |  |  |  | ● | ● | ● |  |  |  |
| CP-01 | ● |  | ● | ● |  |  |  |  |  |  |  |  |  |  |  |  | ● |  |  |  |
| CP-02 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| CP-03 |  | ● |  |  |  |  |  | ● |  |  |  |  |  |  |  |  |  | ● |  |  |
| CP-04 |  |  |  |  |  |  |  | ● |  |  |  |  |  |  |  |  |  |  |  |  |
| CP-05 |  |  |  |  |  |  |  |  |  |  |  | ● | ● |  |  |  |  |  |  | ● |
| CP-06 |  |  |  |  |  |  | ● |  |  |  |  |  |  |  |  |  |  |  |  |  |
| CP-07 | ● |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ● |  |  |  |
