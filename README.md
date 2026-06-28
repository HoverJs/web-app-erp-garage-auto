# Garage Management System

Garage Management System is a garage and auto service operations platform designed to simulate the key workflows of a modern workshop. It brings together operational dashboards, repair tracking, appointment scheduling, customer CRM, vehicle records, workforce management, finance, inventory, and multi-branch analytics in one interface.

This project is a strong fit for:
- Garage ERP product demos
- Internal workshop operations prototypes
- Dashboard UI/UX experiments
- Learning projects built with React, Express, and a JSON-based datastore

## Highlights

- Modern admin interface with `dark/light mode`
- Workspace role switching for `Owner`, `Admin`, `Branch Manager`, `Service Advisor`, `Technician`, `Accountant`, and `Inventory Staff`
- Repair workflow management across real garage stages:
  `Check In`, `Inspection`, `Diagnosis`, `Waiting Parts`, `Repair`, `Quality Check`, `Ready Pickup`, `Delivered`
- Appointment scheduling with technician and service bay conflict checks
- Shift scheduling, attendance logging, and technician load heatmaps
- Vehicle health tracking through inspection reports
- Customer CRM with loyalty tiers and spending history
- Service bay monitoring with workshop floor status
- Inventory and supplier management with stock alerts
- Finance dashboards and branch-level profitability comparison
- Executive insights engine that generates operational alerts from live data

## Main Modules

- `Dashboard`: high-level operational KPIs
- `Garage Operations`: Kanban board for repair progress
- `Service Bay Monitor`: live bay occupancy and progress tracking
- `Vehicle Registry`: vehicle records, service history, inspections, and timeline
- `Inspection Reports`: diagnostic worksheets and health score updates
- `Appointments Board`: booking management and overlap detection
- `Customer CRM`: customer profiles and loyalty tracking
- `Workforce & Shifts`: scheduling, attendance, and technician workload
- `HR Directory`: employee records
- `Finance & Payroll`: revenue, expenses, and payroll data
- `Inventory Catalog` and `Suppliers & Orders`: parts and vendors
- `Multi-Branch Operations`: branch comparison and business performance
- `Smart Insights (CEO)`: strategic warnings and recommendations

## Architecture

The system has two main layers:

1. Frontend
- React 19
- TypeScript
- Vite
- Recharts for charts
- Lucide React for icons

2. Backend
- Express 5
- TypeScript
- Local JSON database stored at `server/src/db/data.json`

Current application flow:
- The frontend calls REST endpoints through `/api/...`
- The backend reads and writes directly to the JSON data file
- Several business rules are executed on the server, including:
  vehicle health score recalculation after inspections, revenue generation when a work order is completed, loyalty tier updates, and executive insights generation

## Project Structure

```text
.
|-- public/                  # static assets and branding files
|-- src/
|   |-- app/                 # app shell, layout, navigation
|   |-- context/             # global state and theme context
|   |-- features/            # business modules
|   |-- shared/types/        # shared TypeScript models
|   `-- index.css            # design tokens and global styles
|-- server/
|   `-- src/
|       |-- db/              # adapters and JSON datastore
|       |-- services/        # insights engine
|       |-- routes.ts        # REST API
|       `-- index.ts         # backend entry point
|-- package.json
`-- README.md
```

## Getting Started

Requirements:
- Node.js 18+
- npm

Install dependencies:

```bash
npm install
```

Run frontend and backend together in development:

```bash
npm run dev
```

Run only the backend:

```bash
npm run server
```

Run only the frontend:

```bash
npm run client
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Available API Areas

Main API groups:

- `/api/employees`
- `/api/shifts`
- `/api/attendance`
- `/api/vehicles`
- `/api/customers`
- `/api/appointments`
- `/api/service-bays`
- `/api/inspections`
- `/api/transactions`
- `/api/work-orders`
- `/api/parts`
- `/api/suppliers`
- `/api/ceo/insights`
- `/api/ceo/resolve-insight`

Health check:

```text
GET /health
```

## Seed Data

The project currently runs on sample data stored in:

```text
server/src/db/data.json
```

This file contains:
- employees
- shifts
- attendance logs
- customers
- vehicles
- appointments
- service bays
- inspection reports
- financial transactions
- work orders
- parts and suppliers

If you want to reset or customize demo data, this is the main file to update.

## Notable Business Logic

- Creating an inspection automatically recalculates the `vehicle health score`
- Moving a `work order` to `Delivered` automatically creates a revenue transaction
- CRM data automatically updates `totalSpending`, `lastVisit`, and `loyaltyTier`
- Workforce scheduling includes role-based restrictions for editing shifts
- Appointments include overlap warnings for technicians and service bays
- The insights engine can detect:
  high labor cost ratio, weak customer retention, risky vehicles, technician overload, high bay utilization, no-shows, inventory shortages, and branch profitability gaps

## Product Scope

This is more than a dashboard. It models a full garage operations flow from:

- customer intake
- appointment creation
- workshop check-in
- repair tracking
- technical inspection
- parts usage
- vehicle delivery
- revenue recognition
- management reporting and operational alerts

## Suggested Next Steps

- Replace the JSON datastore with PostgreSQL or MongoDB
- Add real authentication and authorization
- Support vehicle photos, attachments, and checklists
- Improve branch isolation for a multi-tenant setup
- Add audit logs
- Export invoices and inspection reports to PDF
- Build a real notification center beyond the current badge UI
- Add real-time updates with WebSocket or SSE

## Current Status

The project is currently a feature-rich business prototype and is well suited for:
- product demos
- MVP extension work
- workflow standardization for a garage ERP system

