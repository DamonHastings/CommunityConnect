# Scenario: Individual Professional — Rachel Brown

## Character Profile

**Rachel Brown**, 44, is a licensed attorney based in Sacramento who devotes 20% of her practice to pro bono legal services. She focuses on housing law, tenant rights, and immigration cases for low-income clients. She learned about CommunityConnect from a colleague at a legal aid conference and sees it as a way to make herself discoverable without cold-emailing individual nonprofits.

## Persona Type
`individual_professional`

## Platform Entry Point
Professional network referral (colleague at a conference). Rachel accesses CC from a desktop browser and is comfortable with forms and digital tools.

---

## Scenario A: Happy Path — Profile Creation and Directory Visibility

### Context
Rachel registers, sets up her professional profile with her specialty and service details, and verifies that she appears in the professionals directory where orgs and individuals can find her.

### Step-by-Step Narrative

1. Rachel visits CommunityConnect → clicks "Sign up."
2. Completes Step 1: name, email, password → `POST /api/v1/auth/registration`.
3. Completes Step 2: selects "Professional offering services" → submits.
4. System creates `User` with `profile_type: :individual_professional` → redirects to `/profile`.
5. Rachel fills in her profile:
   - Specialty: "Legal"
   - Bio: "Licensed attorney specializing in housing law, tenant rights, and immigration. Available for pro bono consultations with qualifying individuals and nonprofits."
   - Services offered: ["Pro bono legal consultation", "Tenant rights advice"]
   - Communities served: ["Low-income individuals", "Immigrants", "Renters"]
   - Availability: "Weekday evenings and Saturday mornings"
   - City: Sacramento, State: CA
   - Website: her law firm URL
6. Saves profile → `PATCH /api/v1/auth/profile`.
7. Rachel navigates to `/professionals` → searches for "legal" → her card appears in results.
8. She clicks her own card → `/users/:id` → sees her public profile as others would see it.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Two-step registration | `/register` | `POST /api/v1/auth/registration` |
| Profile edit | `/profile` | `PATCH /api/v1/auth/profile` |
| Professionals directory | `/professionals` | `GET /api/v1/professionals` |
| Public user profile | `/users/:id` | `GET /api/v1/users/:id` |

### Expected Outcomes
- `User` record has `profile_type: :individual_professional`, `specialty: "Legal"`, `services_offered` array populated.
- Rachel appears in `/professionals` when searching "legal" or filtering by Legal specialty.
- Her public profile at `/users/:id` displays bio, specialty, services offered, communities served, availability, and city/state.
- Profile edit page shows the `individual_professional` dashboard card with a profile completeness progress bar.

### Edge Cases
- **EC-A1** Rachel sets no specialty → she should still appear in the professionals directory but will not surface in specialty-filtered searches.
- **EC-A2** Rachel sets her profile to a different profile type (e.g., `community_org`) via profile edit — **the dropdown currently only offers 4 of 6 types**; `individual_professional` is included, so this edge case is limited to switching away from professional. If she switches to `individual_seeker`, she would be forced to complete intake on next login. (This is relevant to G-06 for other personas.)
- **EC-A3** Another user navigates to Rachel's `/users/:id` page while not authenticated → the public profile should be visible (route is listed as public in `App.tsx`).

---

## Scenario B: Happy Path — Applying to a Partnership Opportunity

### Context
Rachel discovers that Better Youth has posted a "mentorship" or "partnership" type engagement opportunity looking for legal professionals to advise their youth clients. She applies through the platform.

### Step-by-Step Narrative

1. Rachel browses `/opportunities` → filters by type "mentorship" or searches for "legal."
2. Finds Better Youth's opportunity → clicks through to `/opportunities/:id`.
3. Reads the opportunity description, org info, application requirements.
4. Clicks "Apply" → submits an application message → `POST /api/v1/opportunities/:id/applications`.
5. System creates `ServiceApplication` with `status: :pending`.
6. Rachel sees confirmation and finds the application at `/my-services` under "Active Applications."
7. Better Youth admin sees Rachel's application in their OrganizationManagePage → Applications tab.
8. Admin approves → `PATCH /api/v1/applications/:id` with `{ status: "approved" }`.
9. Rachel's `/my-services` page updates to show status "Approved."

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| Opportunity discovery | `/opportunities` | `GET /api/v1/opportunities` |
| Opportunity detail | `/opportunities/:id` | `GET /api/v1/opportunities/:id` |
| Apply to opportunity | — | `POST /api/v1/opportunities/:id/applications` |
| My services tracking | `/my-services` | `GET /api/v1/my/applications` |
| Org application review | `/organizations/:id/manage` | `PATCH /api/v1/applications/:id` |

### Expected Outcomes
- `ServiceApplication` created with correct `user_id` and `engagement_opportunity_id`.
- Application appears in Better Youth's manage page Applications tab.
- After org approval, Rachel's `/my-services` shows "Approved."
- Activity feed shows an `application_update` item for Rachel when her status changes.

### Edge Cases
- **EC-B1** The opportunity has already been filled (`status: :closed`) → Apply button is absent; attempting to submit via API returns a validation error.
- **EC-B2** Rachel applies to a `volunteer` type opportunity even though her persona is `individual_professional` → no persona-type restriction currently exists; application is accepted. The org admin sees a professional applying to a volunteer role.

---

## Scenario C: Happy Path — Receiving a Message from an Organization

### Context
After Better Youth approves Rachel's application, their program director wants to discuss the engagement details. They initiate a direct message to Rachel.

### Step-by-Step Narrative

1. Better Youth's program director navigates to Rachel's public profile at `/users/:id` (found via the application detail or professionals directory).
2. Clicks a "Message" button → `POST /api/v1/conversations` with `{ recipient_id: Rachel.id }`.
3. System creates or finds an existing `Conversation` + `ConversationParticipant` records for both users.
4. Director is redirected to `/messages/:conversation_id` and types the first message.
5. Rachel receives an unread message indicator in her left sidebar.
6. Rachel navigates to `/messages` → sees the conversation with Better Youth's director.
7. Rachel opens the conversation → `GET /api/v1/conversations/:id/messages` → reads and replies.

### Platform Features Exercised
| Feature | Route | API Endpoint |
|---------|-------|-------------|
| User profile (as entry point) | `/users/:id` | — |
| Create/find conversation | `/messages` | `POST /api/v1/conversations` |
| Message thread | `/messages/:id` | `GET /api/v1/conversations/:id/messages`, `POST /api/v1/conversations/:id/messages` |
| Unread indicator | sidebar | `GET /api/v1/conversations` (unread count) |

### Expected Outcomes
- Conversation is created only once between the same two users (find-or-create logic).
- Rachel's sidebar shows an unread badge on the Messages nav item.
- `/messages` lists the conversation with the sender's name and last message preview.
- `last_read_at` updates when Rachel opens the thread, clearing the unread badge.

### Edge Cases
- **EC-C1** Rachel and the director already have an existing conversation → `POST /api/v1/conversations` returns the existing conversation rather than creating a duplicate.
- **EC-C2** Rachel is messaged by an unknown individual seeker who found her in the professionals directory → the same message flow applies; no persona-type restriction on who can initiate a conversation.

---

## Gap Analysis

### Confirmed Gaps

| Gap ID | Description | Affected Step | Proposed Feature |
|--------|-------------|---------------|-----------------|
| G-08 | No messaging thread attached to Rachel's application. When Rachel applies to Better Youth's opportunity, no conversation is created. The org contacts her by separately navigating to her profile. The application and the message thread are disconnected. | Scenario B → Scenario C transition | Auto-create `Conversation` on application submission, tagged with `application_id` |
| G-14 | No way for Rachel to follow an org and receive their announcements at higher feed priority. She can save Better Youth, but that's a bookmark — it doesn't affect what she sees in the activity feed. | Scenario B, Step 1 — discovery | `UserOrgFollow` model with feed priority boost for followed-org items |
| G-15 | Rachel has no way to search for other individual users (e.g., other professionals she might want to co-refer clients with). The professionals directory shows only `individual_professional` users; no cross-type user search exists. | General — collaboration gap | Minimal user search for authenticated users; or extend professionals directory to allow cross-type browsing |

### Friction Points

| FP ID | Description | Why it's friction | Improvement idea |
|-------|-------------|-------------------|-----------------|
| FP-06 | No confirmation dialog before application withdrawal. Rachel might accidentally withdraw from an approved engagement. | Same as seeker — loss of an active engagement | Confirmation modal with engagement name before calling withdraw endpoint |

---

## Cross-Persona Touchpoints

- **Community Org (Better Youth)** — reviews Rachel's application and messages her: [CP-04](../cross-persona/CP-04-professional-partners-with-org.md)

---

## Feature Requests Surfaced

1. **Application-linked conversation** — When `ServiceApplication` is created (or when it transitions to `approved`), auto-create a `Conversation` between the applicant and the org's admin, linking `application_id` on the conversation. Affects: `ServiceApplicationsController`, `Conversation` model.

2. **"Respond to application" messaging** — From the Applications tab in OrganizationManagePage, a "Message applicant" action that opens the application-linked conversation. Removes the need to separately navigate to the applicant's profile. Affects: `ApplicationsTab` component.

3. **Endorsed skills / portfolio link on profile** — Rachel currently has `services_offered` as a free-text array and `website` as a URL. A structured "areas of practice" field with predefined tags (beyond `specialty`) would improve search relevance. Affects: `User` model (new array field), `ProfessionalsPage` filter UI.

4. **Professionals directory — reach out button** — The `ProfessionalsPage` card should include a "Message" button that triggers `POST /api/v1/conversations` directly from the card, without requiring the viewer to navigate to the full profile first. Affects: `ProfessionalsPage.tsx`.
