# Cross-Persona Scenario: CP-05 — Joint Program with a Seeker Applicant

## Personas Involved
- **Community Org: Better Youth (Keisha)** — [03-community-org.md](../per-persona/03-community-org.md)
- **Community Org: Wild Wild West (WWW)** — second org, admin is **Darius**
- **Individual Seeker: Jason** — [01-individual-seeker.md](../per-persona/01-individual-seeker.md)

## Context
Better Youth and Wild Wild West are co-running their annual summer program. BY is the primary organizer; WWW provides the venue, staff, and enrichment curriculum. They create the program jointly on CommunityConnect, invite co-applicants, and both orgs share program management. Jason discovers the program through matching and applies. This scenario exercises multi-org program ownership and the shared application review workflow.

## Prerequisites
- Better Youth and Wild Wild West are both registered organizations on the platform.
- Keisha (BY admin) and Darius (WWW admin) are org admins respectively.
- Jason is a registered `individual_seeker` with completed intake (needs include `mentorship`, `education`).

---

## Step-by-Step Narrative

**Keisha (Better Youth Admin):**
1. Keisha navigates to Better Youth's manage page → Programs tab → "New Program."
2. Creates the program:
   - Name: "BY × WWW Summer Enrichment 2026"
   - Type: `summer_program`
   - Status: `draft`
   - Dates: July 1 – August 15, 2026
   - Application window: May 1 – June 15, 2026
   - Capacity: 40
3. Submits → `POST /api/v1/organizations/:by_id/programs`.
4. `Program` created; `ProgramOrganization` created with `role: :owner` for Better Youth.

**Keisha (Better Youth Admin):**
5. From the program's detail/edit page, Keisha adds Wild Wild West as a co-organizer.
6. Submits → `POST /api/v1/programs/:id/organizations` with `{ organization_id: www_id, role: "partner" }`.
7. `ProgramOrganization` created: `program_id`, `organization_id: WWW`, `role: :partner`.

**Keisha (Better Youth Admin):**
8. Keisha changes the program status to `published` → `PATCH /api/v1/programs/:id`.
9. Program appears at `/programs` and surfaces in the activity feed as `new_program`.

**Jason (Individual Seeker):**
10. Jason's dashboard "Matched for you" section may surface this program if matching logic covers program types aligned with his intake needs. **(Currently `MatchingService` matches orgs and opportunities, not programs — this is a gap.)** Jason discovers the program by browsing `/programs` directly.
11. Jason navigates to `/programs/:id` → reads the program detail, sees both Better Youth and Wild Wild West listed as organizers.
12. Application window is open → Jason clicks "Apply."
13. Submits application → `POST /api/v1/programs/:id/applications`.
14. `ProgramApplication` created: `status: :pending`, `user_id: Jason`, `program_id`.

**Keisha (Better Youth Admin):**
15. Keisha navigates to `/organizations/:by_id/manage` → **Applications tab** → does not see Jason's program application. **Program applications are not surfaced in the Applications tab, which only shows `ServiceApplication` records** (see G-13).
16. Keisha navigates to the **Programs tab** → selects the program → sees the applicant list from within the program detail view.
17. Keisha approves Jason → `PATCH /api/v1/program_applications/:id`.

**Darius (Wild Wild West Admin):**
18. Darius navigates to WWW's manage page → Programs tab → sees "BY × WWW Summer Enrichment 2026" listed (WWW is a partner org).
19. Darius can also view the program's applicant list. **There is no "who reviews this?" assignment — both org admins share the same application queue with no coordination layer.**
20. Darius sees Jason already approved by Keisha. The approval is already final — no dual-approval workflow exists.

**Jason (Individual Seeker):**
21. Jason's feed shows `application_update`: program application approved.
22. Jason navigates to `/my-services` → program application shows "Approved."

---

## System Events Triggered

| Step | Event | Model | State |
|------|-------|-------|-------|
| 3 | Program created | `Program` | `status: :draft` |
| 6 | Co-organizer added | `ProgramOrganization` | `role: :partner` |
| 8 | Program published | `Program` | `status: :published` |
| 9 | Feed item created | — | `type: :new_program` |
| 13 | Program application created | `ProgramApplication` | `status: :pending` |
| 17 | Program application approved | `ProgramApplication` | `status: :approved` |
| 21 | Feed item created | — | `type: :application_update`, visible to Jason |

## Expected Outcomes — Per Actor

**Keisha (Better Youth):**
- Program created with BY as owner, WWW as partner.
- Program appears in `/programs` after publishing.
- Program application approvals are accessible via Programs tab (not Applications tab).

**Darius (Wild Wild West):**
- WWW's manage page Programs tab shows the co-owned program.
- Both admins can view and act on applicants from their respective manage pages.
- No coordination mechanism between the two admins.

**Jason:**
- Discovers and applies to the program.
- Receives feed notification on approval.
- `/my-services` reflects program application status.

---

## Edge Cases

- **EC-01** Keisha and Darius both try to approve/reject the same applicant simultaneously → last write wins; no concurrent lock or dual-approval workflow.
- **EC-02** Keisha removes WWW as a partner mid-program (`DELETE /api/v1/programs/:id/organizations/:org_id`) → WWW's manage page no longer shows the program. Active applicants who applied during WWW's co-organizer period are unaffected.
- **EC-03** Jason applies when capacity (40) has been reached → backend `ProgramApplication` validation should prevent the application; frontend Apply button should be hidden.
- **EC-04** The program transitions to `active` (July 1) → Keisha manually changes status. No automated status transition based on start date exists.

---

## Gaps Surfaced by This Interaction

| Gap ID | Description |
|--------|-------------|
| G-12 | No funder-specific flow. BY and WWW are seeking sponsorship for this joint program. They could post a `funding` type opportunity, but the form lacks grant-specific fields (amount, eligibility, grant deadline). A proper funder flow would allow them to publish grant requirements and receive funding applications. |
| G-13 | Program applications not in Applications tab. Keisha expects to find Jason's application in the Applications tab alongside opportunity applications, but it's not there. She must use a less obvious path via the Programs tab. |
| G-20 | No impact/outcome reporting. After the program completes (August 15), BY and WWW have no mechanism to record how many students participated, what goals were met, or to share outcomes publicly. |

**Friction Points:**

| FP ID | Description |
|-------|-------------|
| FP-04 | Program application window enforcement is backend-only. Jason could see the Apply button after the June 15 deadline if the frontend doesn't read `applications_open` from the serializer. |
