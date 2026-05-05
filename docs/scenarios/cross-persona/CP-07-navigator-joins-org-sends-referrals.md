# Cross-Persona Scenario: CP-07 — Navigator Joins an Org and Sends Referrals

## Personas Involved
- **Resource Navigator: Marcus Webb** — [06-resource-navigator.md](../per-persona/06-resource-navigator.md)
- **Pathways Outreach** — the organization Marcus works for (admin: **Tanya**, Pathways' executive director)

## Context
This scenario focuses specifically on the mechanics of a resource navigator joining an existing organization as a member and gaining referral-sending capability. It validates the `resource_navigator` + org member policy logic, documents the manage page access restrictions, and surfaces the gap between the wide referral-send UX Marcus needs and the narrow UI he gets. This is a tighter-scoped companion to CP-01 that isolates the org-join and referral-access workflow.

## Prerequisites
- Pathways Outreach is already created on the platform with Tanya as the admin member.
- Marcus is a newly registered `resource_navigator`.
- Marcus is NOT yet a member of any organization.

---

## Step-by-Step Narrative

**Marcus (Resource Navigator):**
1. Marcus registers and completes his profile.
2. Marcus navigates to `/dashboard` → sees the navigator section with "My Organizations" showing empty.
3. Marcus navigates to `/organizations` → searches for "Pathways Outreach" → finds the org.
4. Marcus views the org's public profile at `/organizations/:pathways_id`.
5. **There is no "Request to join" or "Join this org" button on the org profile page.** Marcus cannot self-enroll. He must ask Tanya to add him.
6. Marcus contacts Tanya outside the platform to request membership.

**Tanya (Pathways Outreach Admin):**
7. Tanya navigates to `/organizations/:pathways_id/manage`.
8. Navigates to the Members section (accessible to org admins).
9. Adds Marcus by email: `POST /api/v1/organizations/:pathways_id/members` with `{ user_id: marcus_id, role: "member" }`.
10. `OrganizationMembership` created: `user_id: Marcus`, `organization_id: Pathways`, `role: :member`.

**Marcus (Resource Navigator):**
11. Marcus refreshes `/dashboard` → My Organizations section now shows "Pathways Outreach."
12. Marcus clicks "Manage" → `/organizations/:pathways_id/manage`.
13. Marcus as a non-admin member sees **only the Referrals tab** — Applications, Programs, Opportunities, Partners, and Announcements tabs are not visible.
14. Marcus navigates to the Referrals tab → the referral send form is present.
15. Marcus enters a client's email and a message → submits → `POST /api/v1/organizations/:pathways_id/referrals`.
16. `ReferralPolicy#create?` checks: `user.resource_navigator? && user.member_of?(referring_org)` → passes.
17. `Referral` created successfully on behalf of Pathways Outreach.

---

## System Events Triggered

| Step | Event | Model | State |
|------|-------|-------|-------|
| 9 | Membership created | `OrganizationMembership` | `role: :member` |
| 15 | Referral created | `Referral` | `status: :pending`, `referring_org_id: Pathways` |

## Expected Outcomes — Per Actor

**Marcus:**
- My Organizations section on dashboard shows Pathways Outreach after being added.
- Manage page shows only the Referrals tab.
- Can successfully create referrals on behalf of Pathways.
- Cannot access Applications, Programs, Opportunities, Partners, or Announcements tabs.

**Tanya (Pathways Admin):**
- OrganizationMembership record exists for Marcus with `role: :member`.
- Tanya can remove Marcus from membership if needed.

---

## Edge Cases

- **EC-01** Marcus tries to create an org himself (e.g., Pathways doesn't exist yet on the platform) → any authenticated user can create an org. Marcus creates Pathways → he becomes admin with full 6-tab access. This bypasses the member-only restriction, giving a navigator admin powers they wouldn't normally have. This is an intentional design decision but worth documenting: **navigator-created orgs grant full admin access**.
- **EC-02** Tanya adds Marcus with `role: :admin` instead of `role: :member` → Marcus would have full admin access including Applications, Programs, etc. This is permissible but not the intended navigator workflow.
- **EC-03** Marcus is a member of two orgs (e.g., Pathways and a second org). He navigates to each org's manage page separately. The dashboard "My Organizations" section lists both. **There is no "active org" concept** — Marcus must manually navigate to the correct org's manage page for each referral (see FP-02).
- **EC-04** A non-navigator member (e.g., a `community_org` type user added as a member) tries to access the Referrals tab → `ReferralPolicy#create?` should fail; the Referrals tab should not be shown or should show an access denied message.

---

## Gaps Surfaced by This Interaction

| Gap ID | Description |
|--------|-------------|
| G-01 | No client list management. Marcus sends referrals from the Referrals tab but has no "My Clients" view. After sending 10+ referrals, the Referrals tab is a flat undifferentiated list with no grouping by client. He cannot see all referrals for a single client at a glance. |
| G-16 | No post-registration onboarding. After registering as a navigator, Marcus has no guidance toward the critical first step (joining an org). The dashboard My Organizations section is empty with no CTA. |
| G-17 | Referrals can only be sent from OrgManagePage. Marcus discovers good resources at `/programs` and `/organizations` but must context-switch to the manage page to send a referral. A "Refer a client" action directly on resource detail pages would dramatically reduce friction. |

**Friction Points:**

| FP ID | Description |
|-------|-------------|
| FP-01 | Referral requires exact registered email. Marcus must already have the client's exact CC-registered email. No name search or invite flow exists. |
| FP-02 | No active-org context indicator. If Marcus is a member of multiple orgs, the dashboard shows combined stats with no org labels. He must navigate separately to each org's manage page to know which org's referrals are which. |
