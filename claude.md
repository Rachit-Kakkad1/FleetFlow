# FleetFlow System Architecture Documentation

This document provides a comprehensive technical overview of the FleetFlow system, covering the architectural patterns, directories, and specific implementations for both the frontend (React/Vite) and backend (Express/Prisma) applications.

---

## 1. Complete System Architecture

FleetFlow is a modular Fleet & Logistics Management System built on a modern JavaScript/TypeScript stack. It utilizes a decoupled client-server architecture.
- **Frontend**: React 19 SPA built with Vite, handling UI, client-side routing, and local state management.
- **Backend**: Express.js REST API relying on Prisma ORM for database interactions and Zod for strict payload validation.
- **Database**: PostgreSQL database.

---

##  2. Frontend Architecture & Directory Structure

**Base Directory**: `/frontend/src`
**Tech Stack**: React 19, Vite, React Router v7, Vanilla CSS, Leaflet (Maps)

### 2.1 Directory Layout
- `/api`: Contains service layers (`services.js`) that interact with the backend API or mock data, encapsulating Axios/fetch logic.
- `/assets`: Static resources like images, icons, and fonts.
- `/components`: Reusable UI components. Subdirectories like `Layout` contain structural components (`Sidebar.jsx`, `TopBar.jsx`).
- `/config`: Configuration files, notably `roleConfig.js` which manages strict Role-Based Access Control (RBAC).
- `/context`: Global state management files, utilizing React Context and Reducers (`FleetContext.jsx`).
- `/data`: Seed data or mock integrations used during local development or offline scenarios (`seedData.js`).
- `/pages`: Top-level view components mapping to specific routes (`Dashboard`, `Vehicles`, `Trips`, `Maintenance`, `Expenses`, `Drivers`, `Analytics`).
- `/utils`: Helper functions and shared client-side logic.

### 2.2 Visual Guidelines, UI/UX, & Theming
- **Styling**: Handled primarily via Vanilla CSS (`index.css` and `App.css`). Global variables define the theming system (colors, typography, spacing).
- **Layout Structure**: Implemented via a `ProtectedLayout` composed of a persistent `Sidebar` (navigation) and `TopBar` (user context/actions), encasing an `<Outlet />` for dynamic page rendering.
- **Components**: Adhere to a modular, stateless (where possible) design, receiving data via props to ensure reusability.
- **Interaction Behaviors**: Toast notifications driven by global context provide immediate user feedback for CRUD operations.

### 2.3 Routing Logic & Access Control
- **Router**: `react-router-dom` handles all client-side routing (`App.jsx`).
- **RBAC Logic**: Handled visually and functionally via `RoleRoute` components and `config/roleConfig.js`.
  - Roles: `FLEET_MANAGER` (Full), `DISPATCHER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`.
  - The configuration object acts as a single source of truth dictating accessible routes, read-only vs. read-write permissions, and dashboard KPIs relevant to the role.
- **Authentication Guards**: `LoginGuard` redirects authenticated users away from the login page, while `ProtectedLayout` enforces login requirements for internal routes.

### 2.4 State Management Patterns
- **Global State**: Managed via `FleetContext.jsx` using `useReducer` and the Context API.
- **Store Structure**: Contains collections for `vehicles`, `drivers`, `trips`, `maintenance`, `expenses`, `user` session, and UI states like `toast`.
- **Flow**: Components dispatch actions (e.g., `REFRESH_ALL`, `SET_USER`) mapped to API service callbacks to ensure UI consistency with backend data.

---

## 3. Backend Architecture & Directory Structure

**Base Directory**: `/backend/src`
**Tech Stack**: Express 5.x, Prisma ORM, PostgreSQL, Zod, JWT

### 3.1 Directory Layout
- `/config`: Environment and tertiary setup configurations.
- `/controllers`: Request handlers that format responses and pass data between the routing layer and the service layer.
- `/middlewares`: Express middleware for cross-cutting concerns (e.g., `errorHandler.js`, authentication guards).
- `/routes`: Definition of API endpoints, routing requests to specific controllers (`auth.routes.js`, `vehicle.routes.js`, etc.).
- `/services`: Business logic layer. Separates database interaction (via Prisma) from request handling.
- `/utils`: Shared backend utilities (e.g., `jwt.js` for token generation/verification).
- `/validators`: Zod schemas ensuring runtime type safety and payload integrity before reaching controllers.
- `/prisma`: Contains `schema.prisma` mapping out the database architecture, plus seed scripts.

### 3.2 Architectural Patterns
- **Layered Architecture (N-Tier)**: Strict separation of concerns defined by Routes → Validators → Controllers → Services → Database.
  - *Routes* map endpoints.
  - *Validators* ensure clean data input.
  - *Controllers* manage HTTP context (req/res).
  - *Services* execute core business logic and database queries.
- **Database Modeling**: Normalized relational models created via Prisma. Core entities: `User`, `Vehicle`, `Driver`, `Trip`, `MaintenanceLog`, `Expense`.
- **Validation Strategy**: Zod is used heavily to prevent malformed queries and injection attempts by validating `req.body` and `req.params`.

### 3.3 Core Flows & Implementation
- **Authentication Flow**: 
  - Login issues a signed JWT (`jsonwebtoken`) and verifies credentials using `bcryptjs`.
  - Protected routes utilize a JWT-verification middleware to append the `user` context to the request.
- **Global Middleware**: 
  - `cors` (Cross-Origin Resource Sharing based on ENV).
  - `helmet` (Security headers).
  - `morgan` (HTTP request logging).
- **Error Handling**: A centralized `errorHandler.js` intercepts thrown errors/exceptions across the app to return standardized JSON error responses, preventing server crashes and obscuring stack traces in production.

### 3.4 Shared Standards & Conventions
- **Naming Conventions**: 
  - *Frontend*: PascalCase for React components and files (`FleetContext.jsx`). camelCase for utilities/hooks.
  - *Backend*: camelCase for files and controllers (`vehicle.routes.js`).
- **Environment Management**: Managed via `.env` (structured per `.env.example`), keeping secrets localized and secure. 
- **Package Management**: NPM scripts are standardized across environments (`dev`, `start`, `db:generate`, `db:push`).
