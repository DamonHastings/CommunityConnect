# Cross-Persona Scenario: CP-01 — Navigator Refers a Seeker to a Program

## Personas Involved
- **Resource Navigator: Marcus Webb** — [06-resource-navigator.md](../per-persona/06-resource-navigator.md)
- **Individual Seeker: Jason** — [01-individual-seeker.md](../per-persona/01-individual-seeker.md)
- **Community Org: Better Youth** (passive role — their program is the referral target)

## Context
Marcus has a client, Jason, who has completed intake on CommunityConnect and is looking for structured mentorship support. Marcus has found Better Youth's summer mentorship program on the platform and wants to formally refer Jason to it. This is the platform's most complete multi-party workflow and exercises the referral, feed, and program application systems together.

## Prerequisites
- Marcus is a `resource_navigator` and a member of Pathways Outreach org.
- Jason is a registered `individual_seeker` with a completed intake questionnaire.
- Better Youth's summer mentorship program exists with `status: :published` and an open application window.
- Jason's email is known to Marcus.

---

## Step-by-Step Narrative

**Marcus (Resource Navigator):**
1. Marcus browses `/programs` and finds Better Youth's "BY Summer Mentorship 2026."
2. Reads the program detail page at `/programs/:id` — confirms it's a good fit for Jason.
3. Wants to refer Jason directly from this page. **There is no "Refer a client" button on the program detail page** (see G-17). Marcus must navigate separately.
4. Marcus navigates to `/organizations/:pathways_id/manage` → Referrals tab.
5. Marcus fills in the referral form: Jason's email, and a message: "This mentorship program looks like a strong fit for your goals — I've referred you here so you can apply."
6. Marcus does **not** set a target program — **the form only accepts email + message; `target_type`/`target_id` are not settable via the UI** (see G-03).
7. Submits → `POST /api/v1/organizations/:pathways_id/referrals`.
8. `Referral` record created: `referring_org_id: Pathways`, `referred_user_id: Jason`, `target_type: nil`, `target_id: nil`, `status: :pending`.

**Jason (Individual Seeker):**
9. Jason's activity feed shows a `referral` item: "[Pathways Outreach] referred you to a resource."
10. The feed item has no direct link to Better Youth's program because `target_id` was not set.
11. Jason navigates to `/my-services` → Referrals section → sees the referral with Marcus's message.
12. Jason reads the message, manually searches for "Better Youth" in `/programs` to find the program Marcus described.
13. Jason accepts the referral → `PATCH /api/v1/referrals/:id` with `{ status: "accepted" }`.
14. Jason applies to the program → `POST /api/v1/programs/:id/applications`.

**Marcus (Resource Navigator):**
15. Marcus checks the Referrals tab → sees Jason's referral status changed to "Accepted."
16. Marcus has **no way to know whether Jason followed through and applied** to the program. There is no `referral_accepted` or `referral_applied` feed event sent to Marcus (see G-04).

**Better Youth:**
17. Better Youth admin sees Jason's program application in their Programs tab.
18. Better Youth has no indication that this application was navigator-initiated (no referral-to-application link).

---

## System Events Triggered

| Step | Event | Model | State |
|------|-------|-------|-------|
| 7 | Referral created | `Referral` | `status: :pending` |
| 9 | Feed item created | — | `type: :referral`, visible to Jason |
| 13 | Referral accepted | `Referral` | `status: :accepted` |
| 14 | Program application created | `ProgramApplication` | `status: :pending` |

## Expected Outcomes — Per Actor

**Marcus:**
- Referrals tab shows the referral with "Accepted" status after Jason acts.
- Dashboard navigator section shows 0 pending, 1 accepted.
- No feed event or notification when Jason accepts or applies.

**Jason:**
- Feed contains a `referral` item.
- `/my-services` shows the referral with status → "Accepted" after he acts.
- Program application appears in the Program Applications section of `/my-services`.

**Better Youth:**
- Program application appears in their manage page.
- No indication the application originated from a navigator referral.

---

## Edge Cases

- **EC-01** Jason accepts the referral but the program's application window has since closed → Jason sees the program detail page with no Apply button. The referral is accepted but no application can be made. Marcus has no visibility into this outcome.
- **EC-02** Marcus's client is not yet registered on CommunityConnect → the referral cannot be sent (requires a valid email). No invite-by-email path exists.
- **EC-03** Marcus sends the referral using the wrong email → API returns "User not found." Marcus must re-enter the correct email with no autocomplete assistance.

---

## Gaps Surfaced by This Interaction

| Gap ID | Description |
|--------|-------------|
| G-03 | Referral target not settable via UI. Marcus cannot link the referral directly to Better Youth's program. Jason receives a generic referral with no program link — he must manually find the program from Marcus's message text. |
| G-04 | No feedback loop after referral acceptance. Marcus can see the "Accepted" status but has no way to know if Jason actually applied to the program. A `referral_accepted` feed event and an optional `referral_applied` event (when a `ProgramApplication` matches the referral's intended target) would close this loop. |
| G-17 | No "Refer a client" button on program detail pages. Marcus discovered the program on the program detail page but had to navigate to a completely different area of the app to send the referral. A "Refer a client to this program" action on `ProgramDetailPage` would allow pre-filling `target_type`/`target_id`. |

---

## Ideal Future State

With the gaps addressed:
- Marcus finds the program at `/programs/:id` → clicks "Refer a client to this program."
- A modal or slide-out form appears with the program pre-filled as the target.
- Marcus selects Jason from his client list (G-01 resolved) or enters his email.
- Jason's feed item includes a direct link to the program.
- After Jason accepts and applies, Marcus receives a `referral_applied` feed notification.
- Better Youth sees a "Referred by navigator (Pathways Outreach)" badge on Jason's application.
