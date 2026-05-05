# Cross-Persona Scenario: CP-04 — Individual Professional Partners with an Organization

## Personas Involved
- **Individual Professional: Rachel Brown** — [02-individual-professional.md](../per-persona/02-individual-professional.md)
- **Community Org: Better Youth (Keisha)** — [03-community-org.md](../per-persona/03-community-org.md)

## Context
Better Youth has posted a `mentorship` type engagement opportunity seeking a legal professional to advise their youth clients on tenant rights. Rachel discovers this opportunity through the professionals network, applies, and Better Youth's admin approves her. After approval, they need to coordinate on next steps — exposing the gap between an approved application and an in-platform communication channel.

## Prerequisites
- Rachel is a registered `individual_professional` with specialty "Legal" set on her profile.
- Better Youth has posted a `mentorship` type opportunity with `status: :open`.
- Keisha is an admin of Better Youth.

---

## Step-by-Step Narrative

**Rachel (Individual Professional):**
1. Rachel browses `/opportunities` → filters by type "mentorship."
2. Finds Better Youth's "Pro Bono Legal Advisor — Youth Clients" opportunity.
3. Navigates to `/opportunities/:id` → reads the full description.
4. Clicks "Apply" → submits with a note: "I'm a housing law attorney with 15 years of experience. I specialize in tenant rights and have worked with low-income youth populations. Happy to do initial consultations."
5. `ServiceApplication` created: `status: :pending`.
6. Rachel navigates to `/my-services` → sees the pending application.

**Keisha (Better Youth Admin):**
7. Keisha navigates to `/organizations/:by_id/manage` → Applications tab.
8. Sees Rachel's application under the legal advisor opportunity.
9. Clicks "Approve" → `PATCH /api/v1/applications/:id` → `status: :approved`.

**Rachel (Individual Professional):**
10. Rachel's feed shows an `application_update` item: "Your application to Better Youth was approved."
11. Rachel wants to discuss how to structure the sessions. She navigates to Better Youth's org profile at `/organizations/:by_id`.
12. **There is no "Contact" or "Message" button on the org profile page** (see G-19 / G-07). Rachel must find a member of Better Youth through another path.
13. Rachel navigates to the professionals directory hoping to find someone from Better Youth — this doesn't work; the directory shows individuals, not org members.
14. Keisha proactively navigates to Rachel's profile at `/users/:rachel_id` (found via the application in the manage page) and initiates a message.
15. Conversation created → both parties communicate via `/messages`.

---

## System Events Triggered

| Step | Event | Model | State |
|------|-------|-------|-------|
| 4 | Application created | `ServiceApplication` | `status: :pending` |
| 9 | Application approved | `ServiceApplication` | `status: :approved` |
| 10 | Feed item created | — | `type: :application_update`, visible to Rachel |
| 14 | Conversation created | `Conversation`, `ConversationParticipant` | — |

## Expected Outcomes — Per Actor

**Rachel:**
- Feed shows approval.
- `/my-services` reflects "Approved" status.
- No direct path to contact Better Youth from the org profile page.

**Keisha (Better Youth):**
- Applications tab shows Rachel's approved application.
- Must proactively navigate to Rachel's user profile to initiate contact.

---

## Edge Cases

- **EC-01** Multiple professionals apply to the same opportunity → Keisha reviews all applications in the same tab, approves or rejects each individually. There is no bulk action or comparison view.
- **EC-02** Rachel's application is approved but she is no longer available → Rachel wants to withdraw. **No confirmation dialog exists** before withdrawal (FP-06). After withdrawal, `status: :withdrawn`; Keisha's Applications tab updates with no notification.
- **EC-03** Better Youth approves Rachel and then later needs to "un-approve" (e.g., they found a conflict) → the admin can set `status: :rejected` after `approved`, which is a state regression. No undo or archive state exists.

---

## Gaps Surfaced by This Interaction

| Gap ID | Description |
|--------|-------------|
| G-07 | No org-to-org (or user-to-org) messaging. Rachel has no contact button on the org profile. Keisha must initiate contact by navigating to Rachel's profile after the approval. The relationship-initiation burden is asymmetrically placed on the org. |
| G-08 | No application-linked messaging thread. The application and the subsequent conversation are completely decoupled. The message thread has no reference to the opportunity they're discussing. |

**Friction Points:**

| FP ID | Description |
|-------|-------------|
| FP-06 | No withdrawal confirmation. Rachel can accidentally withdraw an approved partnership with a single unconfirmed click. |
