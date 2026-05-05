# Cross-Persona Scenario: CP-02 — Organization Refers a Seeker Directly

## Personas Involved
- **Community Org: Better Youth (Keisha)** — [03-community-org.md](../per-persona/03-community-org.md)
- **Individual Seeker: Jason** — [01-individual-seeker.md](../per-persona/01-individual-seeker.md)

## Context
Better Youth's program director, Keisha, has identified Jason as a strong candidate for their summer program after meeting him at a community event. She wants to proactively refer him through CommunityConnect so the invitation is tracked and Jason has a structured path to apply. This scenario tests the org-initiated referral flow without a navigator in the loop.

## Prerequisites
- Jason is a registered `individual_seeker` with a completed intake.
- Keisha is an admin of Better Youth on the platform.
- Better Youth's summer program exists with an open application window.
- Keisha has Jason's registered email address.

---

## Step-by-Step Narrative

**Keisha (Better Youth Admin):**
1. Keisha navigates to `/organizations/:by_id/manage` → Referrals tab.
2. Fills in the send form:
   - Email: Jason's registered email
   - Message: "Hi Jason — we'd love to invite you to apply to our Summer Mentorship Program. We think you'd be a great fit."
3. Submits → `POST /api/v1/organizations/:by_id/referrals`.
4. `Referral` created: `referring_org_id: BY`, `referred_user_id: Jason`, `target_type: nil`, `target_id: nil`, `status: :pending`.

*Note: Keisha wanted to link the referral directly to the Summer Mentorship Program, but the referral form only accepts email + message — **no target selector exists** (see G-03).*

**Jason (Individual Seeker):**
5. Jason's activity feed shows a `referral` item: "[Better Youth] referred you to a resource."
6. Jason navigates to `/my-services` → Referrals section → reads Keisha's message.
7. Jason recognizes "Better Youth" and manually navigates to their org page to find the program Keisha described.
8. Jason accepts the referral → `PATCH /api/v1/referrals/:id` → `status: :accepted`.
9. Jason applies to the program → `POST /api/v1/programs/:id/applications`.

**Keisha (Better Youth Admin):**
10. Referrals tab updates: Jason's referral shows "Accepted."
11. Keisha also sees Jason's program application in the Applications review area (once G-13 is resolved — currently program applications aren't in the Applications tab).

---

## System Events Triggered

| Step | Event | Model | State |
|------|-------|-------|-------|
| 3 | Referral created | `Referral` | `status: :pending` |
| 5 | Feed item created | — | `type: :referral`, visible to Jason |
| 8 | Referral accepted | `Referral` | `status: :accepted` |
| 9 | Program application created | `ProgramApplication` | `status: :pending` |

## Expected Outcomes — Per Actor

**Keisha:**
- Referrals tab shows Jason's referral transitioning from "Pending" to "Accepted."
- No additional notification when Jason applies to the program.

**Jason:**
- Activity feed includes the referral item.
- `/my-services` shows the referral status and Keisha's message.
- After applying, the program application appears in Program Applications.

---

## Edge Cases

- **EC-01** Keisha misremembers Jason's email and enters the wrong address → API returns "User not found." There is no name-based fallback search (see FP-01). Keisha must contact Jason outside the platform to get his exact registered email.
- **EC-02** Jason already has a `ProgramApplication` for this program (e.g., he discovered it independently through matching) → attempting to apply again should return a duplicate application error.
- **EC-03** Jason declines the referral → `status: :declined`. Keisha sees "Declined" in the Referrals tab with no explanation. There is no mechanism for Jason to provide a reason for declining.

---

## Gaps Surfaced by This Interaction

| Gap ID | Description |
|--------|-------------|
| G-03 | Referral target not settable via UI. Keisha knows exactly which program she wants to refer Jason to, but the form doesn't allow specifying a target. Jason must interpret Keisha's message and find the program manually. |
| G-13 | Program applications not in Applications tab. Once Jason applies, Keisha would expect to see the application in her org manage page — but `ProgramApplication` records are not surfaced in the Applications tab (which only covers `ServiceApplication`). |

**Friction Points:**

| FP ID | Description |
|-------|-------------|
| FP-01 | Referral requires exact email — no name fallback. Keisha met Jason in person and may not have his exact registered email. |
| FP-05 | No autocomplete on the referral email field. Even if Keisha has the right email, there is no type-ahead to confirm she's selecting the right person. |
