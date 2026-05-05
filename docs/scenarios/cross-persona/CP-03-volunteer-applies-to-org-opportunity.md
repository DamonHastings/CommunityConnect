# Cross-Persona Scenario: CP-03 — Volunteer Applies to an Org Opportunity

## Personas Involved
- **Volunteer: DeShawn Carter** — [05-volunteer.md](../per-persona/05-volunteer.md)
- **Community Org: Better Youth (Keisha)** — [03-community-org.md](../per-persona/03-community-org.md)

## Context
DeShawn discovers Better Youth's "Youth Mentor Volunteer" opportunity while browsing the platform. He applies with a note about his social work background. Keisha reviews his application in the org manage page and approves it. This scenario tests the full application lifecycle from volunteer discovery through org approval.

## Prerequisites
- DeShawn is a registered `volunteer` with a completed profile (availability set, bio filled in).
- Better Youth's "Youth Mentor Volunteer" opportunity exists with `status: :open`, `opportunity_type: :volunteer`.
- Keisha is an admin of Better Youth.

---

## Step-by-Step Narrative

**DeShawn (Volunteer):**
1. DeShawn logs in → navigates to `/opportunities?type=volunteer`.
2. Browses the list — sees Better Youth's opportunity near the top (sorted by `created_at` descending).
3. Clicks the card → `/opportunities/:id` → reads full description: time commitment, location, expectations.
4. DeShawn clicks "Apply" → message input appears.
5. DeShawn types: "I'm a recent social work grad with experience in youth outreach. I completed a capstone placement at a housing nonprofit and am passionate about mentorship. Available weekends."
6. Submits → `POST /api/v1/opportunities/:id/applications`.
7. `ServiceApplication` created: `status: :pending`, `user_id: DeShawn`, `engagement_opportunity_id: opportunity`.
8. DeShawn sees confirmation → navigates to `/my-services` → sees application under "Active Applications."

**Keisha (Better Youth Admin):**
9. Keisha navigates to `/organizations/:by_id/manage` → Applications tab.
10. Sees DeShawn's application listed under the "Youth Mentor Volunteer" opportunity.
11. Clicks to expand the application → reads DeShawn's message.
12. Keisha wants to ask DeShawn a follow-up question before approving. **There is no messaging thread attached to the application** (see G-08). She must navigate to `/users/:deshawn_id` and initiate a separate conversation.
13. Keisha navigates to DeShawn's profile → clicks "Message" → creates a `Conversation` → asks her question.
14. DeShawn replies via `/messages`.
15. Satisfied, Keisha returns to the Applications tab → clicks "Approve."
16. `ServiceApplication.status` → `approved` → `PATCH /api/v1/applications/:id`.

**DeShawn (Volunteer):**
17. DeShawn's activity feed shows an `application_update` item: "Your application to Better Youth was approved."
18. DeShawn navigates to `/my-services` → application now shows "Approved."
19. DeShawn begins volunteering. **No in-platform mechanism exists to log hours or track the engagement** (see G-02).

---

## System Events Triggered

| Step | Event | Model | State |
|------|-------|-------|-------|
| 6 | Application created | `ServiceApplication` | `status: :pending` |
| 16 | Application approved | `ServiceApplication` | `status: :approved` |
| 17 | Feed item created | — | `type: :application_update`, visible to DeShawn |

## Expected Outcomes — Per Actor

**DeShawn:**
- `/my-services` shows application status transitions: Pending → Approved.
- Feed includes an `application_update` item on approval.
- No post-approval workflow exists for logging hours or confirming attendance.

**Keisha (Better Youth):**
- Applications tab shows DeShawn's application with all submitted content.
- After approval, application status updates in the manage page.
- No feed event when DeShawn later withdraws an application (see G-18).

---

## Edge Cases

- **EC-01** DeShawn withdraws his application after being approved (e.g., scheduling conflict) → `status: :withdrawn`. Keisha's Applications tab shows "Withdrawn" but **receives no feed notification** (see G-18). If she's not actively monitoring the tab, she won't know until she checks manually.
- **EC-02** Keisha rejects DeShawn before he withdraws → `status: :rejected`. DeShawn's feed shows the rejection. He moves the application to history. No reason for rejection is communicated in-platform.
- **EC-03** DeShawn applies to the same opportunity twice (e.g., navigates back to the opportunity after submitting) → a duplicate application attempt should be blocked. The Apply button should be hidden or disabled after submission.

---

## Gaps Surfaced by This Interaction

| Gap ID | Description |
|--------|-------------|
| G-02 | No volunteer hours tracking. After DeShawn is approved, the engagement ends from the platform's perspective. Neither DeShawn nor Better Youth can log, confirm, or view hours served. |
| G-08 | No messaging thread attached to applications. Keisha must separately navigate to DeShawn's profile to ask a question. The application and the conversation are completely decoupled, creating a context switch mid-review. |
| G-18 | No feed event on application withdrawal. If DeShawn withdraws after approval, Keisha has no notification. She may schedule DeShawn for a session without knowing he withdrew. |
