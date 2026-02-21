    <div align="center">

    # 🚛 FleetFlow: Next-Gen Logistics & Fleet Management

    <p align="center">
    A state-of-the-art, role-governed ecosystem designed to command, track, and analyze modern logistics operations in real-time.
    </p>

    [![Version](https://img.shields.io/badge/Version-2.0.0-blueviolet.svg?style=for-the-badge)](https://github.com/your-repo/fleetflow)
    [![React](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
    [![Node.js](https://img.shields.io/badge/Backend-Node.js-339933.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
    [![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1.svg?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
    [![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748.svg?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

    ---

    </div>

    ## 🌟 The Vision

    **FleetFlow** modernizes the way businesses track vehicles, handle complex delivery workflows, monitor volatile expenses, and command dispatching logic. With a completely custom-built architecture boasting live bidirectional web socket events, predictive AI fuel analytics, and a flawlessly segmented role-based UX, FleetFlow brings clarity to the chaos of the road.

    ---

    ## 🔥 Key Features

    ### 🛡️ 5-Tier Role-Based Access Control (RBAC)
    Secure, isolated operations with custom dashboards tailored to exactly what each employee needs to see:
    * 🧑‍💼 **Manager:** Executive KPI dashboard, user lifecycle control, macro financial reports, fuel anomaly clearance, and God-view live map.
    * 🎧 **Dispatcher:** High-velocity interface for dispatching assets, mapping trips, and manually verifying drivers' proofs of delivery.
    * 👷 **Safety Officer:** Workflow gatekeeper. Mandates specific vehicle compliance & driver vetting checkpoints before approving any trips for dispatch.
    * 🚚 **Driver:** A bespoke **Mobile-First** portal. Receive push-trips, capture E-Signatures, upload photographic proof of delivery, log route expenses instantly, and trigger one-touch SOS alerts.
    * 📈 **Financial Analyst:** Complete statistical visibility. Tracks granular ROI by vehicle, monitors maintenance spends, and exports operational cost data.

    ### 🧠 AI-Driven Suspicious Fuel Defense
    Every drop counts. FleetFlow calculates every vehicle's expected fuel consumption against its strict factory baseline `(Km/L)`. If a driver logs fuel that exceeds the mathematical expectation by **>15%**, the system throws a silent alarm, auto-generating a `FuelAnomaly` record and flashing a webhook priority alert exclusively to the Manager Dashboard for review.

    ### 📡 Real-Time Synchronicity (WebSockets)
    Say goodbye to the refresh button.
    * 🏎️ **Live Trip Toggles:** Watch a trip swap from `DRAFT` to `APPROVED` to `ON_TRIP` on your dispatch board the precise second a driver processes it.
    * 🚨 **SOS Overrides:** When a driver triggers an SOS, emergency broadcast sockets push live GPS coordinates across the entire Manager grid instantly.
    * 📦 **Delivery Verifications:** Dispatchers are pinged in real-time when a driver submits photographic proof and a client E-Signature.

    ### 📧 Zero-Touch User Onboarding
    Built-in `EmailJS` mechanics. The exact moment a Manager provisions a new staff member's account, the system auto-generates a secure, temporary password and inherently maps all routing variables, securely emailing the login dossier directly to the employee.

    ---

    ## 💻 Tech Stack Architecture

    > **Frontend Architecture:** React (Vite), Framer Motion (Fluid 60fps animations), Lucide React (Vectors), Recharts (SVG Analytics), Axios, Socket.IO-client.
    > 
    > **Backend Architecture:** Node.js, Express.js REST API, Socket.IO (Live PubSub events).
    > 
    > **Database & Structuring:** PostgreSQL, Prisma ORM (Type-safe migrations and seeding).
    > 
    > **Security Layers:** Bcrypt (Deep hashing), strict JSON Web Tokens (JWT), Custom Express Pipeline RBAC Middleware guards.

    ---

    ## ⚡ Quick Start Guide

    ### 1. Database Configuration
    Ensure a PostgreSQL instance is running on your machine. Create your `backend/.env` file:
    ```env
    PORT=5000
    DATABASE_URL="postgres://user:password@localhost:5432/fleetflow"
    JWT_SECRET="generate_a_strong_secret_key"
    ```

    ### 2. Booting the Backend
    ```bash
    cd backend
    npm install
    npx prisma generate
    npx prisma migrate dev

    # Generates the test schema + default users + base analytics:
    npm run seed  

    npm start
    ```

    ### 3. Launching the Frontend
    Create your `frontend/.env` variables (e.g. `VITE_API_URL=http://localhost:5000/api`).
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

    ---

    ## 🔑 Default Sandbox Credentials
    If you successfully executed the `npm run seed` command, your database is locked and loaded with active trips, varied vehicle classes, expense logs, and **4 core administrative accounts** perfect for verifying the RBAC systems.

    | Role | Login Email | Universal Access Password |
    | :--- | :--- | :--- |
    | **Manager** | `manager@fleet.com` | `manager123` |
    | **Dispatcher** | `dispatcher@fleet.com` | `dispatch123` |
    | **Safety Officer** | `safety@fleet.com` | `safety123` |
    | **Financial Analyst** | `analyst@fleet.com` | `analyst123` |

    *(💡 **Pro Tip:** Look for the active Driver entities established by the seed data if you wish to mock mobile-first endpoints on the frontend!)*

    ---

    <div align="center">
    <i>Engineered for the fast lane. Built to scale perfectly.</i>
    </div>
