# CommunityConnect

A platform for connecting community resource organizations. Representatives can create organization profiles, discover partners, and manage engagement opportunities.

## Structure

```
CommunityConnect/
├── backend/    # Rails 8 API
└── frontend/   # React 18 + TypeScript SPA
```

## Quick Start

**Prerequisites:** Ruby 4.0+ (Homebrew), Node 20+, PostgreSQL 16

```bash
# Start PostgreSQL
brew services start postgresql@16

# Terminal 1 — API
cd backend
bundle install
rails db:create db:migrate
rails server -p 3001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Roadmap

- [x] Organization profiles & directory
- [x] Engagement opportunities
- [x] Multi-user org membership with roles
- [ ] AI agent workflows (org finder, outreach drafting, involvement proposals)
