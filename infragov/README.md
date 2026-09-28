# InfraGov

Government infrastructure asset lifecycle management prototype for the university hiring hackathon. InfraGov is designed as a single source of truth for public assets across Ahmedabad and Gandhinagar: ownership, location, condition, criticality, risk, inspection, maintenance, lifecycle, policy, and audit history.

## Current Prototype

The first P0 slice is runnable and includes:

- Operations control-center dashboard with portfolio KPIs, category composition, condition distribution, department risk, alerts, and audit activity.
- Responsive government-style navigation for Dashboard, Assets, Map view, Inspections, Maintenance, Policies, Lifecycle, Reports, Alerts, and Administration.
- Searchable action queue with empty state.
- MySQL-ready Prisma schema covering users, roles, departments, divisions, categories, configurable asset types/templates, assets, locations, vendors, inspections, work orders, maintenance, lifecycle events, policies, documents, alerts, notifications, and audit logs.
- Prisma 7 MariaDB adapter configuration for MySQL-compatible runtime connections.
- Seed script for 198 realistic demo assets around Ahmedabad/Gandhinagar, including high-risk assets, inspections, policies, work orders, alerts, and lifecycle/audit history.
- Clearly labeled demo fallback when a local MySQL instance is not available.

## Stack

Next.js 16 App Router, React 19, TypeScript, Prisma 7, MySQL/MariaDB, Tailwind CSS 4, Lucide React, Zod, React Hook Form, Leaflet, Recharts.

## Run Locally

1. Create a MySQL database:

```sql
CREATE DATABASE infragov CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update `.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/infragov"
```

3. Install and generate:

```bash
npm install
npm run db:generate
npm run db:validate
npm run db:push
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

Open http://localhost:3000.

The dashboard also runs without MySQL in demo mode so the UI can be evaluated before database setup. Once the database is reachable and seeded, dashboard counts are queried from Prisma rather than hardcoded fallback values.

## Demo Credentials

All demo accounts use `Demo@123`:

| Role | Email |
| --- | --- |
| Admin | `admin@govdemo.local` |
| Asset Manager | `manager@govdemo.local` |
| Field Inspector | `inspector@govdemo.local` |
| Technician | `technician@govdemo.local` |
| Viewer | `viewer@govdemo.local` |

## Data Model

```text
Role -> User -> Department -> Division
AssetCategory -> AssetType -> AssetTemplate
Asset -> Location, Vendor, Department, User
Asset -> Inspection, WorkOrder -> MaintenanceRecord
Asset -> LifecycleEvent, Policy, Document, Alert
User -> AuditLog, Notification
```

Condition is scored from 0 to 100: Excellent 86+, Good 71-85, Fair 51-70, Poor 31-50, Critical 0-30. Risk is stored separately and is intended to combine condition, criticality, failure history, and inspection overdue state. Warranty expiry does not represent physical asset end-of-life.

## Commands

- `npm run dev` - local development server
- `npm run build` - production build
- `npm run lint` - ESLint
- `npx tsc --noEmit` - TypeScript check
- `npm run db:generate` - generate Prisma Client
- `npm run db:validate` - validate Prisma schema
- `npm run db:push` - apply schema to the configured MySQL database
- `npm run db:seed` - reset and seed demo data

## Next P0 Build Slice

The dashboard is the initial foundation. The next implementation slice should connect the navigation to real route modules in this order: `/assets` inventory and detail, `/inspections` submission flow with condition/risk recalculation, `/maintenance/work-orders` transitions and maintenance records, `/map` Leaflet asset markers, then policies, alerts, reports, and administration. Server-side permission checks already exist in `src/lib/auth.ts` and should guard each mutation as those modules are added.

## Known Limitations

- Login UI and route middleware are not yet wired to the dashboard shell.
- Navigation buttons are currently interaction-ready visual controls, not route modules.
- The seed is intentionally optimized for a hackathon demo and should be replaced by migrations plus a safer production seed strategy later.
- MySQL must be running for live records; the fallback is intentionally visible and does not pretend to be live data.
