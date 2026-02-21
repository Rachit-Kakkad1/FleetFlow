// ─── FleetFlow Role-Based Access Control Configuration ─────────────────────
// Single source of truth for all role permissions, sidebar access, dashboard KPIs,
// and route access. To add a new role, add an entry here — no other files need changes.

export const ROLES = {
    MANAGER: 'Fleet Manager',
    DISPATCHER: 'Dispatcher',
    SAFETY_OFFICER: 'Safety Officer',
    DRIVER: 'Driver',
};

const roleConfig = {
    // ───────────────────────────────────────── Fleet Manager (full access)
    [ROLES.MANAGER]: {
        sidebarItems: [
            '/dashboard', '/vehicles', '/trips', '/maintenance', '/expenses', '/drivers', '/analytics', '/manager/users',
        ],
        readOnlyPages: [],
        routeAccess: ['/dashboard', '/vehicles', '/trips', '/maintenance', '/expenses', '/drivers', '/analytics', '/manager/users'],
        dashboardKPIs: ['activeFleet', 'maintenanceAlerts', 'utilizationRate', 'pendingCargo'],
        dashboardWidgets: ['liveFleetMap', 'fleetStatusChart', 'recentTrips', 'roiCard', 'costPerKmCard', 'suspiciousFuelActivity'],
        permissions: {
            canCreateVehicle: true,
            canEditVehicle: true,
            canDeleteVehicle: true,
            canRetireVehicle: true,
            canCreateTrip: true,
            canDispatchTrip: true,
            canCompleteTrip: true,
            canCancelTrip: true,
            canLogMaintenance: true,
            canCompleteMaintenance: true,
            canAddExpense: true,
            canAddDriver: true,
            canEditDriver: true,
            canToggleDriverStatus: true,
            canExportReports: true,
            canManageUsers: true,
        },
    },

    // ───────────────────────────────────────── Dispatcher
    [ROLES.DISPATCHER]: {
        sidebarItems: ['/dashboard', '/trips', '/vehicles'],
        readOnlyPages: ['/vehicles'],
        routeAccess: ['/dashboard', '/trips', '/vehicles'],
        dashboardKPIs: ['activeFleet', 'pendingCargo', 'vehiclesAvailable', 'vehiclesOnTrip'],
        dashboardWidgets: ['recentTripsActive'],
        permissions: {
            canCreateVehicle: false,
            canEditVehicle: false,
            canDeleteVehicle: false,
            canRetireVehicle: false,
            canCreateTrip: true,
            canDispatchTrip: true,
            canCompleteTrip: true,
            canCancelTrip: true,
            canLogMaintenance: false,
            canCompleteMaintenance: false,
            canAddExpense: false,
            canAddDriver: false,
            canEditDriver: false,
            canToggleDriverStatus: false,
            canExportReports: false,
            canManageUsers: false,
        },
    },

    // ───────────────────────────────────────── Safety Officer
    [ROLES.SAFETY_OFFICER]: {
        sidebarItems: ['/dashboard', '/safety/pending-trips', '/drivers', '/maintenance'],
        readOnlyPages: ['/maintenance'],
        routeAccess: ['/dashboard', '/safety/pending-trips', '/drivers', '/maintenance'],
        dashboardKPIs: ['driversOnDuty', 'licenseExpiryAlerts', 'suspendedDrivers', 'vehiclesInShop'],
        dashboardWidgets: ['complianceAlertPanel', 'safetyScoreChart'],
        permissions: {
            canCreateVehicle: false,
            canEditVehicle: false,
            canDeleteVehicle: false,
            canRetireVehicle: false,
            canCreateTrip: false,
            canDispatchTrip: false,
            canCompleteTrip: false,
            canCancelTrip: false,
            canLogMaintenance: false,
            canCompleteMaintenance: false,
            canAddExpense: false,
            canAddDriver: false,
            canEditDriver: false,
            canToggleDriverStatus: true,
            canExportReports: false,
            canManageUsers: false,
        },
    },

    // ───────────────────────────────────────── Driver
    [ROLES.DRIVER]: {
        sidebarItems: ['/driver/dashboard'],
        readOnlyPages: [],
        routeAccess: ['/driver/dashboard'],
        dashboardKPIs: [],
        dashboardWidgets: [],
        permissions: {
            canCreateVehicle: false,
            canEditVehicle: false,
            canDeleteVehicle: false,
            canRetireVehicle: false,
            canCreateTrip: false,
            canDispatchTrip: false,
            canCompleteTrip: false,
            canCancelTrip: false,
            canLogMaintenance: false,
            canCompleteMaintenance: false,
            canAddExpense: true,
            canAddDriver: false,
            canEditDriver: false,
            canToggleDriverStatus: false,
            canExportReports: false,
            canManageUsers: false,
        },
    },
};

/** Get config for a role. Falls back to empty permissions for unknown roles. */
export function getRoleConfig(role) {
    return roleConfig[role] || roleConfig[ROLES.MANAGER];
}

/** Check if a role has access to a specific route */
export function canAccessRoute(role, path) {
    const config = getRoleConfig(role);
    return config.routeAccess.includes(path);
}

/** Check if a page is read-only for this role */
export function isReadOnly(role, path) {
    const config = getRoleConfig(role);
    return config.readOnlyPages.includes(path);
}

/** Get permissions object for a role */
export function getPermissions(role) {
    return getRoleConfig(role).permissions;
}

export default roleConfig;
