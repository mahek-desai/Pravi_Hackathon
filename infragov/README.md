# InfraGov

## Government Infrastructure Asset Lifecycle Management Platform

InfraGov is a full-stack prototype for government authorities to register, locate, inspect, maintain, govern, and retire public infrastructure assets across their complete lifecycle.

It is designed around one operational question:

> What is the current, accountable, evidence-backed state of every public asset?

The platform connects the asset register to location, department ownership, condition, criticality, risk, inspections, work orders, policies, alerts, lifecycle events, and audit history. It is intentionally focused on public infrastructure, not private-company inventory or commercial stock management.

**Prototype geography:** Ahmedabad, Gandhinagar, and nearby Gujarat-style urban areas.

**Data classification:** All seeded people, organizations, and asset records are synthetic demo data.

[Read the detailed architecture](ARCHITECTURE.md)

## Product Capabilities

### Operational control center

- Executive dashboard with total assets, operational assets, maintenance workload, critical assets, high-risk assets, overdue inspections, open work orders, and expiring policies.
- Department coverage and risk overview.
- Condition distribution and portfolio composition.
- Action queue for overdue inspections, warranty expiry, maintenance recommendations, and SLA risk.
- Recent audit activity.

### Asset register

- Paginated asset inventory.
- Search across codes, names, descriptions, serial numbers, manufacturers, localities, wards, and addresses.
- Category, department, criticality, condition, risk, lifecycle, and operational filters.
- Asset detail records with ownership, location, condition, risk, lifecycle, inspections, maintenance, policies, alerts, and audit-related information.
- Progressive asset creation wizard with category, type, basic information, location, technical metadata, policies, and review steps.
- Collision-safe asset-code generation such as `TS-AHM-0001` and `SL-AHM-0002`.

### GIS and spatial operations

- 2D Leaflet asset map with seeded Gujarat coordinates.
- Asset markers connected to inventory records.
- 3D regional spatial view using Three.js.
- Explicit handling for missing coordinates and loading states.

### Lifecycle operations

- Inspection records update asset condition.
- Explainable risk calculation separates condition from criticality.
- Work orders support assignment, priority, due dates, status progression, costs, and completion notes.
- Maintenance records and lifecycle events preserve operational history.
- Policies support warranty, AMC, inspection policy, SLA, safety, and regulatory records.
- Alerts provide a decision-support queue rather than irreversible automated replacement decisions.

### Governance and access

- Roles: `ADMIN`, `ASSET_MANAGER`, `FIELD_INSPECTOR`, `TECHNICIAN`, `VIEWER`.
- Password hashing with `bcryptjs`.
- Cookie-backed demo session handling.
- Server-side permission helpers.
- Append-only audit-log service for major mutations.
- Structured API error responses.

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4, custom CSS, Lucide React |
| Forms and validation | React Hook Form, Zod |
| Backend | Next.js route handlers and domain services |
| Database | MySQL / MariaDB |
| ORM | Prisma 7 with `@prisma/adapter-mariadb` |
| Maps | Leaflet, React Leaflet |
| Visualization | Recharts and Three.js |
| Authentication | Cookie session prototype, bcryptjs password hashing |

## Architecture

The application follows this boundary:

```text
Browser UI
  -> Next.js pages and client components
  -> API route handlers
  -> authentication and permission checks
  -> Zod/input validation
  -> domain services
  -> Prisma Client
  -> MySQL / MariaDB
```

The full architecture document includes the route map, service boundaries, ER diagram, lifecycle state machine, scoring rules, deployment guidance, and evolution plan:

- [ARCHITECTURE.md](ARCHITECTURE.md)

## Project Structure

```text
infragov/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── page.tsx                 # executive dashboard
│   │   ├── login/
│   │   ├── assets/
│   │   ├── map/
│   │   ├── inspections/
│   │   ├── maintenance/
│   │   ├── policies/
│   │   ├── lifecycle/
│   │   ├── reports/
│   │   ├── alerts/
│   │   ├── administration/
│   │   └── api/
│   ├── components/
│   │   ├── layout/
│   │   ├── assets/
│   │   ├── map/
│   │   └── ui/3d/
│   └── lib/
│       ├── db.ts
│       ├── auth.ts
│       ├── audit.ts
│       ├── validations.ts
│       ├── utils.ts
│       └── services/
├── ARCHITECTURE.md
└── README.md
```

## Database Model

The normalized Prisma model contains:

- Organization: `Role`, `User`, `Department`, `Division`.
- Configuration: `AssetCategory`, `AssetType`, `AssetTemplate`.
- Register: `Asset`, `Location`, `Vendor`.
- Operations: `Inspection`, `WorkOrder`, `MaintenanceRecord`.
- Lifecycle: `LifecycleEvent`.
- Governance: `Policy`, `Document`, `AuditLog`.
- Attention management: `Alert`, `Notification`.

Category-specific technical fields are stored in `Asset.technicalMetadataJson`; common fields remain normalized and queryable.

## MySQL Setup

### Prerequisites

- Node.js 20+ recommended.
- npm.
- MySQL 8+ or a compatible MariaDB server.

### Create the database

```sql
CREATE DATABASE infragov
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Configure the connection

Create or update `.env` in the project root:

```env
DATABASE_URL="mysql://root:password@localhost:3306/infragov"
```

Do not commit `.env` or credentials. Environment files are ignored by Git.

### Install, generate, validate, and seed

```bash
npm install
npm run db:generate
npm run db:validate
npm run db:push
npm run db:seed
```

`db:seed` resets the development database and creates approximately 198 synthetic public infrastructure assets, government departments, divisions, users, asset types, templates, locations, inspections, policies, alerts, work orders, lifecycle events, and audit records. Never run it against production data.

## Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The UI can render in clearly labeled demo mode when MySQL is unavailable. Live inventory and API operations require a reachable configured database.

## Demo Accounts

All seeded demo accounts use the password `Demo@123`.

| Role | Email | Purpose |
| --- | --- | --- |
| Admin | `admin@govdemo.local` | Full administration |
| Asset Manager | `manager@govdemo.local` | Portfolio and lifecycle management |
| Field Inspector | `inspector@govdemo.local` | Inspections and observations |
| Technician | `technician@govdemo.local` | Work-order execution |
| Viewer | `viewer@govdemo.local` | Read-only review |

## Routes

### UI routes

- `/` - executive operations dashboard.
- `/login` - demo login.
- `/assets` - central infrastructure register.
- `/assets/new` - progressive asset creation wizard.
- `/assets/[id]` - asset lifecycle profile.
- `/map` - 2D Leaflet and 3D spatial views.
- `/inspections` - inspection operations.
- `/maintenance` - maintenance and work-order operations.
- `/policies` - policy register.
- `/lifecycle` - lifecycle history.
- `/reports` - reports surface.
- `/alerts` - action and risk alerts.
- `/administration` - administration surface.

### API routes

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET, POST /api/assets`
- `GET, PATCH /api/assets/:id`
- `GET /api/categories`
- `GET /api/departments`
- `GET /api/dashboard`
- `GET, POST /api/inspections`
- `GET, POST /api/work-orders`
- `GET, PATCH /api/work-orders/:id`
- `GET /api/policies`
- `GET /api/lifecycle`
- `GET /api/alerts`
- `PATCH /api/alerts/:id`
- `GET /api/search`

## Domain Rules

### Condition

| Score | Label |
| ---: | --- |
| 86–100 | Excellent |
| 71–85 | Good |
| 51–70 | Fair |
| 31–50 | Poor |
| 0–30 | Critical |

Condition means the physical and operational health of an asset.

### Criticality

Criticality means the consequence if an asset fails:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

A decorative public bench can be low criticality while a major traffic signal can be critical, regardless of their current condition.

### Risk

```text
conditionRisk = 100 - conditionScore
riskScore = conditionRisk * 0.50
          + criticalityScore * 0.30
          + failureHistoryScore * 0.10
          + inspectionOverdueScore * 0.10
```

Risk labels are `Low` (0–30), `Medium` (31–60), `High` (61–80), and `Critical` (81–100). This is transparent prototype decision support, not an official government standard.

### Lifecycle

```text
PLANNED -> PROCURED -> INSTALLED -> COMMISSIONED -> OPERATIONAL
OPERATIONAL -> UNDER_MAINTENANCE -> REPAIRED -> OPERATIONAL
OPERATIONAL -> RENEWED -> OPERATIONAL
OPERATIONAL -> RETIRED -> DISPOSED
```

Warranty expiry is tracked independently from useful life, condition, lifecycle status, and replacement recommendations.

## Development Commands

```bash
npm run dev            # development server
npm run build          # production build
npm run start          # production server
npm run lint           # ESLint
npx tsc --noEmit       # TypeScript validation
npm run db:generate    # Prisma Client generation
npm run db:validate    # Prisma schema validation
npm run db:push        # apply schema to configured database
npm run db:seed        # reset and seed demo data
```

## Verification Checklist

Before a pull request or hackathon demo:

1. Confirm `.env` is not staged.
2. Run `npm run db:validate`.
3. Run `npm run db:generate`.
4. Run `npm run lint`.
5. Run `npx tsc --noEmit`.
6. Run `npm run build`.
7. Run `npm run db:push` and `npm run db:seed` against a development MySQL database.
8. Test login, dashboard, assets, map, inspections, maintenance, alerts, and reports.

The current production build and TypeScript validation pass. `npm run lint` currently reports a backlog of strict lint findings in the prototype UI and service layer, primarily explicit `any` types and React hook recommendations; these are tracked as hardening work rather than hidden by disabling lint.

## Current Limitations

- Authentication is a functional prototype and should be upgraded to signed, expiring sessions or a maintained identity provider before production.
- Some navigation surfaces and workflows are present as prototype pages while deeper mutation coverage continues to be hardened.
- The database seed is optimized for demonstration and resets the development database.
- Document storage is modeled but does not yet include production object storage.
- Automated unit and integration test suites should be expanded around services, permissions, lifecycle transitions, and alert rules.
- Production deployment still needs migrations, backups, observability, rate limiting, CSRF strategy, and HTTPS cookie configuration.

## Roadmap

### P0 hardening

- Complete route protection and redirect behavior.
- Add transactional inspection and work-order mutation flows.
- Add service-level tests for risk, lifecycle, alerts, permissions, and audit logging.
- Complete CSV reports and robust pagination/filter state.

### P1

- CSV bulk import with upload, parse, validate, preview, confirm, and summary stages.
- QR asset lookup.
- Document upload abstraction.
- Notification delivery adapters.

### P2

- Predictive maintenance.
- IoT telemetry.
- Citizen issue reporting.
- BIM and digital twin integrations.
- Government open-data connectors.

## License and Data Notice

This repository is a hackathon prototype. It contains synthetic demo data only and must not be used as a source of official government records.
