# DevIntel — AI-Powered Developer Intelligence Platform

A production-grade SaaS platform that connects to GitHub via OAuth, analyses developer activity, parses resumes with AI, computes a composite DevScore, and provides career intelligence — all wrapped in a modern React dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL 16 |
| **Cache / Queue** | Redis 7, BullMQ |
| **Auth** | JWT (access + refresh rotation), GitHub OAuth 2.0 |
| **Validation** | Zod |
| **Frontend** | React 18, Vite, TailwindCSS, Zustand |
| **UI** | All primitives hand-crafted (zero UI libraries) |
| **Charts** | Pure SVG (Radar, Line, Heatmap, Donut) |
| **Infra** | Docker, Docker Compose |

---

## Architecture

```
devintel/
├── backend/
│   └── src/
│       ├── config/          # env, database, redis, logger
│       ├── db/              # schema.sql, migrate, seed
│       ├── middleware/       # auth, error, rate-limit, activity
│       ├── modules/
│       │   ├── auth/        # register, login, JWT, GitHub OAuth
│       │   ├── users/       # profile, stats
│       │   ├── github/      # sync repos/commits/PRs, intelligence metrics
│       │   ├── resume/      # PDF upload, text extraction, skill parsing
│       │   └── analytics/   # DevScore, dashboard, career targets
│       ├── jobs/            # BullMQ workers (github-sync, resume, score)
│       └── server.ts        # Express entry point
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── primitives/  # 19 hand-crafted components
│       │   ├── charts/      # SVG RadarChart, LineChart, Heatmap, Donut
│       │   └── layout/      # Sidebar, Navbar, AppLayout, Guards
│       ├── pages/           # Login, Register, Dashboard, Repos, Resume, Profile, Settings
│       ├── services/        # API client, auth/data services
│       ├── context/         # Zustand stores (auth, theme)
│       ├── hooks/           # useAsync, useDebounce, useClickOutside, etc.
│       └── types/           # Shared TypeScript types
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL 16
- Redis 7
- GitHub OAuth App (for OAuth features)

### 1. Clone & Install

```bash
git clone <repo-url> devintel
cd devintel
npm install          # installs root + workspace deps
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database, Redis, GitHub OAuth credentials
```

Required environment variables:

| Variable | Description |
|----------|-----------|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GITHUB_CALLBACK_URL` | OAuth callback URL |
| `FRONTEND_URL` | Frontend origin for redirects |

### 3. Set Up Database

```bash
npm run migrate -w backend    # runs schema.sql
npm run seed -w backend       # inserts demo data
```

### 4. Start Development

```bash
# Terminal 1 — Backend
npm run dev -w backend

# Terminal 2 — Frontend
npm run dev -w frontend
```

The backend runs on `http://localhost:4000` and the frontend on `http://localhost:5173` (with proxy to backend).

### Docker (alternative)

```bash
docker compose up --build
```

Access the app at `http://localhost:4000`.

---

## DevScore Formula

The composite DevScore is calculated as:

$$
\text{DevScore} = 0.25C + 0.20T + 0.20B + 0.15S + 0.20G
$$

Where:
- **C** = Consistency Score (active days, streak, commit volume)
- **T** = Technical Depth (Shannon diversity index on languages)
- **B** = Collaboration Score (PR count, merge rate)
- **S** = Skill Relevance (match against career target)
- **G** = Growth Velocity (sigmoid-normalized 3-month trend)

---

## Primitive Components (All Hand-Crafted)

| Component | Features |
|-----------|---------|
| Button | 5 variants, 3 sizes, loading state, icons |
| Input | Label, error, hint, left/right addons, ARIA |
| Textarea | Resize control, label, error states |
| Select | Custom arrow, placeholder, error state |
| Checkbox / Radio | Labels, descriptions, controlled |
| Modal | Portal, overlay, escape dismiss, body scroll lock |
| Drawer | Left/right position, 3 sizes, portal |
| Tooltip | 4 positions, hover/focus triggers |
| Dropdown | Click outside, align options, danger items |
| Table | Generic columns, loading skeleton, empty state |
| Tabs | Line/pill variants, ARIA tablist |
| Accordion | Single/multiple mode, animated content |
| Badge | 6 color variants, 2 sizes |
| Avatar | Image/initials fallback, 4 sizes |
| Card | Padding options, hoverable variant |
| Spinner | SVG spinner, 3 sizes |
| Toast | Context provider, 4 variants, auto-dismiss, stacked |
| Skeleton | Configurable dimensions, rounded variants |

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Email/password login
- `POST /api/auth/refresh` — Refresh token rotation
- `POST /api/auth/logout` — Invalidate refresh token
- `GET /api/auth/github` — Initiate GitHub OAuth
- `GET /api/auth/github/callback` — OAuth callback

### Users
- `GET /api/users/me` — Get profile
- `PATCH /api/users/me` — Update profile
- `GET /api/users/me/stats` — Get user statistics

### GitHub Intelligence
- `POST /api/github/sync` — Sync all repos + commits + PRs
- `GET /api/github/repos` — List synced repositories
- `GET /api/github/metrics` — Compute intelligence metrics

### Resume
- `POST /api/resume/analyze` — Upload + analyze resume (multipart)
- `GET /api/resume` — List all analyses
- `GET /api/resume/:id` — Get single analysis

### Analytics
- `GET /api/analytics/dashboard` — Full dashboard data
- `POST /api/analytics/score/compute` — Recalculate DevScore
- `GET /api/analytics/score/trend` — Score history
- `GET /api/analytics/skills` — User skills
- `POST /api/analytics/targets` — Create career target
- `GET /api/analytics/targets` — List career targets

---

## License

MIT
