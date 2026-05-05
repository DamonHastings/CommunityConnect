# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev Servers

Rails runs on **port 3001** (not 3000 — collision with another process). Frontend proxies `/api` → `localhost:3001`.

```bash
# PostgreSQL
brew services start postgresql@16

# Terminal 1 — Rails API (backend/)
PATH="/opt/homebrew/opt/ruby/bin:/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH" bundle exec rails server -p 3001

# Terminal 2 — Vite SPA (frontend/)
npm run dev   # http://localhost:5173
```

## Commands

```bash
# Backend
bundle exec rspec                          # all tests
bundle exec rspec spec/requests/foo_spec.rb  # single file
bundle exec rails db:migrate
bundle exec rails console

# Frontend
npm run build   # tsc -b && vite build
npm run lint    # eslint
```

## Architecture

### Backend — Rails 8 API (`backend/`)

All routes are under `/api/v1/`. Devise routes use path `api/v1/auth` with aliases `login`/`logout`/`register`.

**Auth:** Devise + devise-jwt. JWT is returned in the `Authorization: Bearer ...` **response header** on login/register — not in the body. The frontend stores it in `localStorage` and attaches it via an Axios interceptor. Session middleware (`ActionDispatch::Cookies` + `Session::CookieStore`) is added back to `application.rb` because Devise/Warden requires it even in API-only mode.

**Authorization:** Pundit. Every controller action that mutates data calls `authorize record`. Policies live in `app/policies/`. `ApplicationController` rescues `Pundit::NotAuthorizedError` → 403. The pattern for org-scoped checks is `user.admin_of?(org)` / `user.member_of?(org)` — methods on `User`.

**Serialization:** `jsonapi-serializer`. Serializers are in `app/serializers/`. Controllers instantiate serializers directly and call `.serializable_hash[:data][:attributes]` rather than using `render json: @resource`.

**Key models:**
- `User` — `profile_type` enum (individual_seeker/individual_professional/community_org/business_service_provider/volunteer/resource_navigator), `intake_completed` bool, JWT revocation via `JTIMatcher`
- `Organization` — `org_type` enum (nonprofit/business/school/foundation), `category` enum, geocoded lat/lng, pg_search scope on name/description/mission
- `EngagementOpportunity` — `opportunity_type` enum, `status` enum, belongs to org
- `Program` — multi-org via `ProgramOrganization` join (roles: owner/partner)
- `ServiceApplication` / `ProgramApplication` — status enum (pending/approved/rejected/withdrawn)
- `PartnerConnection` — org-to-org, status (pending/accepted/declined), `requester_org_id` + `target_org_id`
- `Referral` — org refers user to polymorphic target (Program or Organization); `referring_org_id`, `referred_user_id`, `target_type`/`target_id`
- `Conversation` + `ConversationParticipant` + `Message` — user-to-user DMs; unread count tracked via `ConversationParticipant#last_read_at`; `Conversation.between(user1, user2)` for find-or-create

**Feed** (`FeedController`): assembles a ranked list of heterogeneous items (new_opportunity, new_program, announcement, application_update, partner_request, referral) from a 30-day lookback. Priority tag: `yours > your_org > partner > nil`. Items are plain hashes, not model-backed — built inline in the controller.

**Background jobs:** `solid_queue` is in the Gemfile and available for async work.

**Tests:** RSpec + FactoryBot + Shoulda Matchers. `spec/support/request_helpers.rb` provides `RequestHelpers` included into request specs. Factories in `spec/factories/`.

### Frontend — React 18 SPA (`frontend/src/`)

**Data fetching:** TanStack Query v5. Every resource has a corresponding hook in `src/hooks/` (e.g. `useConversations`, `useFeed`, `useOrganizations`). Hooks accept an `enabled` flag to prevent unauthenticated fetches — always pass `!!user` from `useAuth()`.

**Auth state:** `AuthContext` holds `user`, `token`, and async helpers (`login`, `register`, `logout`, `updateProfile`, `submitIntake`). Token is stored in `localStorage`. The Axios instance in `src/lib/api.ts` attaches it on every request and redirects to `/login` on 401.

**Route guard:** `RequireAuth` in `App.tsx` wraps all protected routes. It also hard-redirects `individual_seeker` users with `intake_completed === false` to `/intake` from any protected route.

**Forms:** React Hook Form + Zod. Schema defined with `z.object(...)`, passed to `useForm({ resolver: zodResolver(schema) })`.

**Styling:** Tailwind CSS v4. Shared primitives in `src/components/ui/` (Button, Input, Select, Badge, Card). Lucide icons.

**Layout:** `Layout` renders `Navbar` (top) + `Sidebar` (left, `w-56`) + `<main>`. The Sidebar reads `useConversations(!!user)` to compute a total unread count badge for the Messages nav item. During intake (`isIntakeGated`), the Sidebar is hidden.

**Programmatic login in tests/scripts:** `react-hook-form` forms can't be driven by `preview_fill` alone. Use `fetch()` + `localStorage.setItem('auth_token', ...)` instead.

## Key Conventions

- New API resources follow the existing pattern: model → policy → serializer → controller → route entry in `config/routes.rb`.
- Intake responses use an upsert pattern (`post/patch` → `upsert` action) because `UserIntakeResponse` has a uniqueness constraint on `user_id`.
- The `profile_type` dropdown in `ProfilePage.tsx` currently includes only 4 of 6 types — `volunteer` and `resource_navigator` are omitted and need to be added.
- Feed items are plain hashes assembled in `FeedController#index`. To add a new item type, add a loop in that method and extend the `FeedItem` TypeScript type in `src/hooks/useFeed.ts`.
