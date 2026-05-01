# CommunityConnect — Backend

Rails 8 API serving the CommunityConnect platform.

## Stack

- **Ruby** 4.0 · **Rails** 8.1 · **PostgreSQL** 16
- **Auth:** Devise + devise-jwt (JWT in `Authorization` response header)
- **Authorization:** Pundit
- **Search:** pg_search (full-text), Geocoder (lat/lng)
- **Serialization:** jsonapi-serializer
- **Pagination:** Kaminari

## Setup

```bash
# Requires Homebrew Ruby 4.0 at /opt/homebrew/opt/ruby
export PATH="/opt/homebrew/opt/ruby/bin:/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH"

bundle install
rails db:create db:migrate
rails server -p 3001
```

Health check: `GET http://localhost:3001/up`

## API Reference

All routes are prefixed `/api/v1/`. Authenticated endpoints require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | — | Create account. Returns JWT in `Authorization` header. |
| `POST` | `/auth/login` | — | Sign in. Returns JWT in `Authorization` header. |
| `DELETE` | `/auth/logout` | ✓ | Revoke token. |
| `GET` | `/auth/me` | ✓ | Current user with organization memberships. |

**Register / Login body:**
```json
{
  "user": {
    "email": "jane@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "first_name": "Jane",
    "last_name": "Smith"
  }
}
```

### Organizations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/organizations` | — | List/search organizations. |
| `POST` | `/organizations` | ✓ | Create organization (creator becomes admin). |
| `GET` | `/organizations/:id` | — | Organization profile. |
| `PATCH` | `/organizations/:id` | ✓ org admin | Update organization. |
| `DELETE` | `/organizations/:id` | ✓ org admin | Delete organization. |
| `POST` | `/organizations/:id/members` | ✓ org admin | Invite member by email. |
| `DELETE` | `/organizations/:id/members/:user_id` | ✓ org admin | Remove member. |

**Search params:** `?q=food&category=food_bank&city=Oakland&state=CA&near=37.8,-122.2&radius=25&page=2`

**Categories:** `food_bank` `shelter` `healthcare` `education` `housing` `mental_health` `youth_services` `other`

### Engagement Opportunities

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/opportunities` | — | All opportunities. |
| `GET` | `/organizations/:org_id/opportunities` | — | Opportunities for one org. |
| `POST` | `/organizations/:org_id/opportunities` | ✓ org member | Create opportunity. |
| `GET` | `/opportunities/:id` | — | Opportunity detail. |
| `PATCH` | `/opportunities/:id` | ✓ org member | Update opportunity. |
| `DELETE` | `/opportunities/:id` | ✓ org admin | Delete opportunity. |

**Filter params:** `?type=volunteer&status=open`

**Types:** `volunteer` `partnership` `funding` `mentorship` `resource_sharing`

**Statuses:** `open` `closed` `filled`

## Models

```
User
  ├── has_many :organization_memberships
  └── has_many :organizations (through memberships)

Organization
  ├── has_many :organization_memberships
  ├── has_many :users (through memberships)
  └── has_many :engagement_opportunities

OrganizationMembership
  ├── belongs_to :user
  ├── belongs_to :organization
  └── role: admin | member

EngagementOpportunity
  └── belongs_to :organization
```

## Tests

```bash
bundle exec rspec
```
