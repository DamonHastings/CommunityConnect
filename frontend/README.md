# CommunityConnect — Frontend

React 18 SPA for the CommunityConnect platform.

## Stack

- **React** 18 · **TypeScript** · **Vite** 8
- **Routing:** React Router v6
- **Server state:** TanStack Query (React Query)
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios (with JWT interceptor)

## Setup

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build
```

The dev server proxies `/api` requests to `http://localhost:3001` (the Rails backend).

## Pages

| Path | Auth required | Description |
|------|--------------|-------------|
| `/` | — | Landing page |
| `/organizations` | — | Directory with search and filters |
| `/organizations/:id` | — | Organization profile and open opportunities |
| `/organizations/new` | ✓ | Create organization |
| `/organizations/:id/edit` | ✓ org admin | Edit organization |
| `/organizations/:id/opportunities/new` | ✓ org member | Post new opportunity |
| `/opportunities` | — | Opportunity feed |
| `/opportunities/:id` | — | Opportunity detail |
| `/dashboard` | ✓ | My organizations and recent opportunities |
| `/login` | — | Sign in |
| `/register` | — | Create account |

## Key Files

```
src/
├── lib/api.ts              # Axios instance with JWT interceptor
├── contexts/AuthContext.tsx # Auth state and token management
├── hooks/
│   ├── useOrganizations.ts # TanStack Query hooks for orgs
│   └── useOpportunities.ts # TanStack Query hooks for opportunities
├── types/index.ts          # Shared TypeScript interfaces
└── components/
    ├── ui/                 # Button, Input, Select, Badge, Card
    ├── layout/             # Navbar, Layout wrapper
    ├── organizations/      # OrganizationCard
    └── opportunities/      # OpportunityCard
```

## Auth Flow

1. User registers or logs in → Rails returns a JWT in the `Authorization: Bearer ...` response header
2. Frontend stores the token in `localStorage`
3. Axios interceptor attaches the token to every subsequent request
4. On 401, token is cleared and user is redirected to `/login`
