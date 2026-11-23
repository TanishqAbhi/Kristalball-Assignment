# Military Asset Management System (Kristallball)

Enterprise-grade Military Asset Management System tracking critical military assets (vehicles, weapons, ammunition) across multiple military bases.

## Key Features
- **Real-Time Asset Visibility**: Opening balance, net movement (purchases + transfer in - transfer out), assigned, expended, and closing balance (`Closing Balance = Opening Balance + Net Movement - Assigned - Expended`).
- **Operational Accountability**: Cross-base asset transfers with atomic PostgreSQL transactions and audit trails.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Unrestricted access across all bases and endpoints.
  - `BASE_COMMANDER`: Scoped read/write access to their assigned base (`base_id`).
  - `LOGISTICS_OFFICER`: Restricted access primarily to Purchases and Transfers endpoints.
- **Auditability**: Automated logging of asset-changing operations (`PURCHASE`, `TRANSFER`, `ASSIGNMENT`, `EXPENDITURE`) to `audit_logs`.

## Setup Instructions
1. Create a PostgreSQL database and apply `database/schema.sql` (and optionally `database/seed.sql`).
2. Configure backend environment variables in `backend/.env` (see `backend/.env.example`).
3. Install dependencies and start backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. Install dependencies and start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
