# InfraGov Architecture

## 1. Product Boundary

InfraGov is a government/public infrastructure asset lifecycle platform. It is not a private inventory, warehouse, procurement, vendor-management, or sales system.

The system maintains a current operational state and a historical record for each public asset:

```text
Asset
  + ownership and department
  + location and GIS coordinates
  + condition and criticality
  + explainable risk
  + lifecycle state
  + inspections
  + work orders and maintenance
  + warranty / AMC / inspection policies
  + alerts and recommendations
  + documents
  + append-only audit history
```

The prototype geography is Ahmedabad, Gandhinagar, and nearby Gujarat-style urban areas. Seeded records are synthetic demo data.

## 2. System Context

```mermaid
flowchart LR
    Officer[Government officer / field user]
    Browser[Next.js browser UI]
    Routes[App Router pages]
    API[Route handlers / API]
    Services[Domain services]
    Validation[Zod and business validation]
    Prisma[Prisma Client 7]
    MySQL[(MySQL / MariaDB)]
    Maps[Leaflet / Three.js]

    Officer --> Browser
    Browser --> Routes
    Browser --> API
    Routes --> API
    API --> Validation
    Validation --> Services
    Services --> Prisma
    Prisma --> MySQL
    Routes --> Maps
```

### Runtime responsibilities

- **Browser UI:** navigation, forms, filters, tables, maps, charts, loading states, empty states, and user feedback.
- **Next.js App Router:** page composition and server/client component boundaries.
- **API route handlers:** HTTP boundary, input parsing, authentication, authorization, and structured responses.
- **Domain services:** asset creation, risk calculation, inspections, work orders, lifecycle transitions, policies, alerts, dashboard aggregation, and audit writes.
- **Prisma:** typed relational access and transaction boundary.
- **MySQL/MariaDB:** durable source of truth. No production core data is intended to live in client state.
- **Leaflet:** 2D asset map and marker interactions.
- **Three.js:** optional 3D regional/spatial visualization.

## 3. Repository Structure

```text
infragov/
├── prisma/
│   ├── schema.prisma             # relational domain model
│   └── seed.ts                   # synthetic authority and asset data
├── public/                       # static assets
├── src/
│   ├── app/
│   │   ├── page.tsx              # executive dashboard
│   │   ├── login/                # demo authentication UI
│   │   ├── assets/               # inventory, creation wizard, asset detail
│   │   ├── map/                  # GIS and 2D/3D view switcher
│   │   ├── inspections/          # inspection operations
│   │   ├── maintenance/          # work order operations
│   │   ├── policies/             # policy register
│   │   ├── lifecycle/            # lifecycle view
│   │   ├── alerts/               # action queue
│   │   ├── reports/              # operational reports
│   │   ├── administration/       # administration surface
│   │   └── api/                  # route handlers
│   │       ├── auth/             # login, logout, session
│   │       ├── assets/           # list, create, detail
│   │       ├── dashboard/        # executive metrics
│   │       ├── inspections/      # inspection operations
│   │       ├── work-orders/      # work order operations
│   │       ├── alerts/           # alert list and updates
│   │       ├── policies/         # policy list and creation
│   │       ├── lifecycle/        # lifecycle events
│   │       ├── map/               # map-facing data where needed
│   │       ├── search/           # global asset search
│   │       ├── categories/       # configurable categories
│   │       └── departments/      # organizational filters
│   ├── components/
│   │   ├── layout/               # MainLayout, Sidebar, Topbar
│   │   ├── assets/               # AssetCreationWizard and asset UI
│   │   ├── map/                  # GISMap and map adapters
│   │   └── ui/3d/                # Three.js visual components
│   └── lib/
│       ├── db.ts                 # singleton Prisma client and MySQL adapter
│       ├── auth.ts               # session and server-side permissions
│       ├── audit.ts              # append-only audit helper
│       ├── validations.ts        # shared validation definitions
│       ├── utils.ts              # labels, colors, IDs, risk helpers
│       └── services/              # domain service layer
└── docs/config                    # README and architecture documentation
```

## 4. Request and Mutation Flow

Every write should follow this path:

```text
HTTP request
  -> authenticate session
  -> authorize role and action
  -> parse and validate input
  -> domain service
  -> verify related records and business rules
  -> Prisma transaction where multiple records change
  -> lifecycle / audit / alert side effects
  -> structured JSON response
  -> UI success or user-friendly error state
```

The client must never be treated as the authority for user identity, permissions, IDs, status transitions, or score ranges.

A successful inspection, for example, must update the inspection record, asset condition, calculated risk, lifecycle history, audit history, and alert rules as one coordinated business operation.

## 5. Domain Model

The schema is normalized around the following relationships:

```mermaid
erDiagram
    ROLE ||--o{ USER : grants
    DEPARTMENT ||--o{ DIVISION : contains
    DEPARTMENT ||--o{ USER : owns
    DEPARTMENT ||--o{ ASSET : manages
    ASSET_CATEGORY ||--o{ ASSET_TYPE : groups
    ASSET_TYPE ||--o{ ASSET_TEMPLATE : configures
    ASSET_CATEGORY ||--o{ ASSET : classifies
    ASSET_TYPE ||--o{ ASSET : defines
    LOCATION ||--o{ ASSET : locates
    VENDOR ||--o{ ASSET : supports
    ASSET ||--o{ INSPECTION : receives
    ASSET ||--o{ WORK_ORDER : requires
    WORK_ORDER ||--o{ MAINTENANCE_RECORD : produces
    ASSET ||--o{ LIFECYCLE_EVENT : evolves
    ASSET ||--o{ POLICY : governs
    ASSET ||--o{ DOCUMENT : stores
    ASSET ||--o{ ALERT : raises
    USER ||--o{ AUDIT_LOG : performs
```

### Core entities

- **Organization:** `Role`, `User`, `Department`, `Division`.
- **Configuration:** `AssetCategory`, `AssetType`, `AssetTemplate`.
- **Register:** `Asset`, `Location`, `Vendor`.
- **Operations:** `Inspection`, `WorkOrder`, `MaintenanceRecord`.
- **Lifecycle:** `LifecycleEvent`.
- **Governance:** `Policy`, `Document`, `AuditLog`.
- **Attention management:** `Alert`, `Notification`.

Category-specific attributes remain in `technicalMetadataJson`, while common searchable and reportable fields remain first-class columns.

## 6. State and Scoring Rules

### Lifecycle

```text
PLANNED -> PROCURED -> INSTALLED -> COMMISSIONED -> OPERATIONAL
OPERATIONAL -> UNDER_MAINTENANCE -> REPAIRED -> OPERATIONAL
OPERATIONAL -> RENEWED -> OPERATIONAL
OPERATIONAL -> RETIRED -> DISPOSED
```

A disposed asset cannot return to operational status. Every transition records old status, new status, actor, timestamp, description, cost, and notes.

### Condition

Condition answers: “How healthy is the asset?”

| Score | Label |
| ---: | --- |
| 86–100 | Excellent |
| 71–85 | Good |
| 51–70 | Fair |
| 31–50 | Poor |
| 0–30 | Critical |

### Criticality

Criticality answers: “How important is the asset if it fails?” It is independent of condition and uses `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.

### Risk

Risk is explainable and separate from condition:

```text
conditionRisk = 100 - conditionScore
criticalityScore = LOW 25, MEDIUM 50, HIGH 75, CRITICAL 100
riskScore = conditionRisk * 0.50
           + criticalityScore * 0.30
           + failureHistoryScore * 0.10
           + inspectionOverdueScore * 0.10
```

Risk labels are `Low` (0–30), `Medium` (31–60), `High` (61–80), and `Critical` (81–100). The calculation is intended for decision support and is not presented as an official government standard.

## 7. Roles and Authorization

Authorization is enforced by server-side helpers in `src/lib/auth.ts` and must be applied in every protected mutation route.

| Role | Intended access |
| --- | --- |
| `ADMIN` | Full administration and configuration |
| `ASSET_MANAGER` | Assets, inspections, maintenance, lifecycle, policies, alerts, reports |
| `FIELD_INSPECTOR` | Assigned assets, inspections, observations, issue reporting |
| `TECHNICIAN` | Assigned work orders, maintenance updates, completion notes and costs |
| `VIEWER` | Read-only operational and report access |

The UI may hide actions for usability, but hiding a button is never the security control.

## 8. API Surface

Current route groups include:

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

Responses use the project’s `{ success, data }` and `{ success: false, error: { code, message } }` shape. Error messages should remain safe for end users and must not expose SQL, stack traces, secrets, or filesystem paths.

## 9. Database and Deployment

Prisma 7 uses `prisma7.config.ts` for the migration datasource URL. Runtime queries use `PrismaMariaDb` in `src/lib/db.ts`, which is compatible with MySQL deployments.

Required environment variable:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/infragov"
```

Local setup:

```bash
npm install
npm run db:generate
npm run db:validate
npm run db:push
npm run db:seed
npm run dev
```

For production, use a managed MySQL instance, a secret manager for `DATABASE_URL`, HTTPS-only cookies, a migration pipeline, database backups, and restricted database credentials. The included seed resets demo data and must not be run against production.

## 10. Observability and Failure Handling

- API handlers return structured errors and status codes.
- Pages use loading, empty, invalid-filter, and not-found states.
- Database failures are caught at the UI boundary for demo fallback where appropriate.
- Audit records are append-only from normal user flows.
- Mutations should be wrapped in transactions when they update the asset plus dependent operational history.
- Application logs should be extended with request IDs, actor IDs, route names, and duration before production deployment.

## 11. Testing Strategy

The minimum high-value automated coverage should include:

1. Asset creation and automatic asset-code uniqueness.
2. Asset-type/category and department/division validation.
3. Condition score and location validation.
4. Risk calculation component weights and labels.
5. Inspection submission updating condition, risk, lifecycle, alerts, and audit.
6. Invalid lifecycle transitions.
7. Work-order state transitions and completion requirements.
8. Warranty and overdue-inspection alert rules.
9. Server-side role authorization.
10. Audit append-only behavior.

The current repository is validated with `npx tsc --noEmit`, `npm run build`, `npm run db:generate`, and `npm run db:validate`. Strict ESLint currently reports a backlog of prototype findings, primarily explicit `any` types and React hook recommendations; that cleanup is intentionally listed as hardening work instead of being hidden by disabling lint.

## 12. Evolution Plan

### Next P0 hardening

- Add middleware-protected routes and login redirect behavior.
- Replace broad `any` types in client data fetching with shared response types.
- Add transactional inspection and work-order services to all write routes.
- Add full filter coverage, pagination controls, and CSV reports.
- Add automated tests for service and authorization rules.

### P1

- CSV upload with parse/validate/preview/confirm stages.
- QR code asset lookup.
- Document storage abstraction with size/type validation.
- Notification delivery adapters.

### P2

- Predictive maintenance, IoT telemetry, citizen issue reporting, BIM/digital twin integrations, and government open-data connectors.

The architecture intentionally keeps these as adapters around the core asset lifecycle instead of allowing them to become prerequisites for the P0 platform.
