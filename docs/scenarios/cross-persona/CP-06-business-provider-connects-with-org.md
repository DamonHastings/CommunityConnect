# Cross-Persona Scenario: CP-06 — Business Provider Connects with a Community Org

## Personas Involved
- **Business Service Provider: Atnap (Marcus-Adriel)** — [04-business-service-provider.md](../per-persona/04-business-service-provider.md)
- **Community Org: Better Youth (Keisha)** — [03-community-org.md](../per-persona/03-community-org.md)

## Context
Atnap's business development lead, Marcus-Adriel, has been browsing CommunityConnect and identified Better Youth as a potential client for their nonprofit branding services. He sends a partner connection request. Keisha reviews and accepts. After the acceptance, both orgs are formally connected — but there's no in-platform mechanism for them to move the relationship forward within CC. This scenario tests the partner connection workflow and surfaces the post-acceptance UX gap.

## Prerequisites
- Atnap is a registered organization with `org_type: :business`, Marcus-Adriel as admin.
- Better Youth is a registered organization with `org_type: :nonprofit`, Keisha as admin.
- No prior connection exists between the two orgs.

---

## Step-by-Step Narrative

**Marcus-Adriel (Atnap Admin):**
1. Marcus-Adriel browses `/organizations` → searches for nonprofits → finds Better Youth.
2. Navigates to `/organizations/:by_id` — Better Youth's public org profile.
3. Sees a "Connect" / "Request Partnership" button.
4. Clicks it → `POST /api/v1/organizations/:atnap_id/partner_connections` with `{ target_org_id: by_id }`.
5. `PartnerConnection` created: `requesting_org_id: Atnap`, `target_org_id: BY`, `status: :pending`.
6. Marcus-Adriel sees confirmation and can view the pending request in Atnap's Partners tab.

**Keisha (Better Youth Admin):**
7. Keisha's activity feed shows a `partner_request` item: "[Atnap Studio] wants to connect with Better Youth."
8. **The feed item's URL links to BY's manage page** (`/organizations/:by_id/manage`), which is correct for Keisha. However, if a non-admin BY member sees this item, the link takes them somewhere inaccessible (see FP-07).
9. Keisha clicks the feed item → lands on BY's manage page → Partners tab.
10. Sees Atnap's pending request with the requesting org's name and org type.
11. Keisha wants to review Atnap's profile before accepting. She clicks on Atnap's name → `/organizations/:atnap_id`.
12. Reviews Atnap's description and services offered.
13. Returns to the Partners tab → clicks "Accept."
14. `PartnerConnection.status` → `accepted` → `PATCH /api/v1/partner_connections/:id`.

**Both Parties:**
15. Atnap appears in BY's Partners tab as an active partner.
16. BY appears in Atnap's Partners tab as an active partner.
17. Atnap's announcements and new opportunities now appear at `partner` priority in BY's feed, and vice versa.

**Marcus-Adriel (Atnap Admin):**
18. Marcus-Adriel wants to send a message to Better Youth about a potential project. He navigates to BY's org profile at `/organizations/:by_id`.
19. **There is no "Message this org" or "Contact" button on the org profile** (see G-07). Marcus-Adriel cannot initiate org-to-org communication through the platform.
20. Marcus-Adriel must take the relationship off-platform to continue the conversation.

---

## System Events Triggered

| Step | Event | Model | State |
|------|-------|-------|-------|
| 4 | Partner connection created | `PartnerConnection` | `status: :pending` |
| 7 | Feed item created | — | `type: :partner_request`, visible to BY admin |
| 14 | Partner connection accepted | `PartnerConnection` | `status: :accepted` |

## Expected Outcomes — Per Actor

**Marcus-Adriel (Atnap):**
- Partners tab shows BY as an active partner after acceptance.
- Atnap's feed includes BY's new content at `partner` priority.
- No in-platform path to message BY as an org.

**Keisha (Better Youth):**
- Partners tab shows Atnap as an active partner.
- Feed item accurately links to the Partners tab.
- BY's feed includes Atnap's content at `partner` priority.

---

## Edge Cases

- **EC-01** Marcus-Adriel sends a second partner request to BY (e.g., navigates back to their profile) → should return a validation error; duplicate connections should be blocked.
- **EC-02** Keisha declines the request → `status: :declined`; Atnap sees no notification of the decline; the request disappears from both parties' Partners tabs.
- **EC-03** Marcus-Adriel cancels the pending request before Keisha responds → `DELETE /api/v1/partner_connections/:id`; the request is removed.
- **EC-04** The partner connection is later broken (one org wants to disconnect) → no "remove partner" action currently exists in the UI. The `DELETE` endpoint for partner connections may handle this but it's not exposed in the Partners tab.

---

## Gaps Surfaced by This Interaction

| Gap ID | Description |
|--------|-------------|
| G-07 | No org-to-org messaging. After the connection is accepted, there's no in-platform way for Marcus-Adriel to message Better Youth as an org. This is the most critical gap in the partner connection workflow — the connection is a handshake with no follow-up channel. A "Message this org" button should create a conversation between Marcus-Adriel and Keisha (or BY's admin). |

**Friction Points:**

| FP ID | Description |
|-------|-------------|
| FP-07 | Partner request feed item links to manage page. Non-admin members of BY would see a `partner_request` feed item but the link routes to an inaccessible manage page. The link should route to the requesting org's public profile for non-admins. |
