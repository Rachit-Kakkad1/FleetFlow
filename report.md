# 🚛 FleetFlow: Frontend-Backend Integration & Implementation Plan

This report details the comprehensive implementation plan for connecting the FleetFlow React frontend (currently using `localStorage`) to the Node.js/Prisma backend. Every frontend service, API route, and data model has been analyzed to ensure seamless compatibility.

## 1. Executive Summary

The backend is fully implemented and provides a robust Express/Prisma API covering all frontend features (Authentication, Vehicles, Drivers, Trips, Maintenance, Expenses, Analytics, and Dashboard functions). 
The primary tasks required for integration are:
1. Replacing `localStorage` functions in `frontend/src/api/services.js` with HTTP client (e.g., `axios`) calls to the backend endpoints.
2. Transforming data keys (DTO mapping) between the frontend's expected properties and the backend Prisma schema.
3. Hooking the frontend's `FleetContext` and `AuthContext` to use real API responses and `Authorization` headers.

---

## 2. Global Integration Strategy

### API Client Setup
Create an `axios` or native `fetch` client in `api/client.js`:
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('ff_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Authentication Token Handling
The backend `/api/auth/login` returns a JWT. The frontend must store this token (`ff_token`) instead of storing the raw user object in `localStorage`. 

---

## 3. Comprehensive Route & Compatibility Mapping

### 3.1 Authentication & User Management
**Backend Routes Implemented:**
- `POST /api/auth/login` 
- `GET /api/auth/me`
- `POST /api/users/`
- `GET /api/users/`

**Backend vs. Frontend Model:**
- **Frontend `User`:** `id`, `name`, `email`, `role`, `createdAt`
- **Backend `User`:** `id`, `name`, `email`, `role`, `createdAt`
- *Compatibility:* 100% matched. Replace `authService.login` to call `POST /api/auth/login` and store the token. Replace `userService.create` to call `POST /api/users`.

### 3.2 Vehicles
**Backend Routes Implemented:**
- `GET /api/vehicles` 
- `GET /api/vehicles/available`
- `GET /api/vehicles/:id`
- `POST /api/vehicles`
- `PUT /api/vehicles/:id`
- `PATCH /api/vehicles/:id/status`
- `PATCH /api/vehicles/:id/retire`
- `DELETE /api/vehicles/:id`

**Backend vs. Frontend Model Compatibility:**
- **Frontend properties:** `id`, `name`, `model`, `type`, `licensePlate`, `maxCapacity`, `odometer`, `status`, `region`, `acquisitionCost`
- **Backend Prisma Model:** `maxCapacityKg`, `odometerKm` (Backend uses specific units).
- *Action Required:* In `vehicleService`, map incoming data to match frontend expectations:
  ```javascript
  // Example Mapper
  const mapVehicle = (backendVeh) => ({
      ...backendVeh,
      maxCapacity: backendVeh.maxCapacityKg,
      odometer: backendVeh.odometerKm
  });
  ```
  And when creating/updating, map `maxCapacity` -> `maxCapacityKg` and `odometer` -> `odometerKm`.

### 3.3 Drivers
**Backend Routes Implemented:**
- `GET /api/drivers`
- `GET /api/drivers/available`
- `GET /api/drivers/:id`
- `POST /api/drivers`
- `PUT /api/drivers/:id`
- `PATCH /api/drivers/:id/status`
- `DELETE /api/drivers/:id`

**Backend vs. Frontend Model Compatibility:**
- **Frontend properties:** `id`, `name`, `licenseNo`, `licenseExpiry`, `category`, `phone`, `status`, `safetyScore`, `tripsCompleted`, `tripsAssigned`
- **Backend Prisma Model:** `licenseNumber`, `licenseCategories` (Array of Strings), `totalTrips`, `completedTrips`.
- *Action Required:* Add mapping logic:
  - `licenseNo` <-> `licenseNumber`
  - `category` <-> `licenseCategories[0]`
  - `tripsAssigned` <-> `totalTrips`
  - `tripsCompleted` <-> `completedTrips`

### 3.4 Trips
**Backend Routes Implemented:**
- `GET /api/trips`
- `GET /api/trips/pending`
- `GET /api/trips/:id`
- `POST /api/trips`
- `PATCH /api/trips/:id/dispatch`
- `PATCH /api/trips/:id/complete`
- `PATCH /api/trips/:id/cancel`

**Backend vs. Frontend Model Compatibility:**
- **Frontend properties:** `id`, `vehicleId`, `driverId`, `origin`, `destination`, `cargoWeight`, `status`, `startOdometer`, `endOdometer`, `description`
- **Backend Prisma Model:** `cargoWeightKg`, `cargoDescription`, `startOdometerKm`, `endOdometerKm`.
- *Action Required:* Map variables before sending payloads and upon receiving data:
  - `cargoWeight` <-> `cargoWeightKg`
  - `description` <-> `cargoDescription`
  - `startOdometer` <-> `startOdometerKm`
  - `endOdometer` <-> `endOdometerKm`

### 3.5 Maintenance
**Backend Routes Implemented:**
- `GET /api/maintenance`
- `GET /api/maintenance/vehicle/:vehicleId`
- `POST /api/maintenance`
- `PATCH /api/maintenance/:id/complete`

**Backend vs. Frontend Model Compatibility:**
- **Frontend properties:** `id`, `vehicleId`, `serviceType`, `cost`, `date`, `technician`, `notes`, `completed`
- **Backend Prisma Model:** `type` (Enum: PREVENTIVE, REACTIVE), `description` instead of `serviceType`, `startDate`, `endDate`.
- *Action Required:* 
  - Frontend `serviceType` should map to the backend's `description`.
  - Frontend should append an appropriate Enum `type` (`PREVENTIVE` or `REACTIVE`) based on dropdown selection.
  - `date` <-> `startDate`.

### 3.6 Expenses
**Backend Routes Implemented:**
- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/vehicle/:id/total`

**Backend vs. Frontend Model Compatibility:**
- **Frontend properties:** `id`, `vehicleId`, `type`, `liters`, `cost`, `date`, `tripId`
- **Backend Prisma Model:** `category` (Enum: FUEL, TOLL, OTHER) instead of `type`.
- *Action Required:* Map frontend `type` to backend `category` (ensure case consistency).

### 3.7 Analytics & Dashboard
**Backend Routes Implemented:**
- `GET /api/dashboard/kpis`
- `GET /api/dashboard/fleet-status`
- `GET /api/dashboard/safety-scores`
- `GET /api/dashboard/cost-breakdown`
- `GET /api/analytics/roi`
- `GET /api/reports/fuel-efficiency`
- `GET /api/reports/cost-per-km`
- `GET /api/reports/export/csv`

*Action Required:* 
The frontend currently calculates all KPIs locally in `analytics` and `dashboard` pages manually by reducing the localStorage arrays. This should be entirely refactored to fetch pre-calculated data directly from these backend endpoints. This will significantly improve performance and data accuracy.

### 3.8 Map Integration
**Backend Route:** `GET /api/fleet-map/data`
*Action Required:* Update `LiveFleetMap.jsx` to fetch real-time fleet coordinates directly from the backend rather than using local seed definitions.

---

## 4. Next Steps & Recommended Execution Phase
1. **API Client:** Create `frontend/src/api/client.js` with Axios configuration.
2. **Refactor Services:** Update `frontend/src/api/services.js` with asynchronous HTTP requests and DTO mapping layers.
3. **React Context:** Update `FleetContext.jsx` actions (`login`, `refreshAll`) to use `await` syntax since operations are now asynchronous.
4. **Remove Seed Data:** Deprecate `frontend/src/data/seedData.js` and rely entirely on the backend `prisma/seed.js` script.
5. **Start Servers & Test:** Ensure Node server is running on `PORT 5000` and `npm run dev` serves Vite on `5173`. Add automated test plans.

## Verification Plan
1. **Manual Verification:** Start both backend `npm run dev` and frontend `npm run dev`. Navigate to `/dashboard` and verify data renders. Perform CRUD operations on Vehicles, Drivers, and Trips to verify DB updates.
2. **Log Validation:** Inspect backend API logs (Morgan) to ensure no 500 or 400 validation format errors are occurring due to unmapped properties.
