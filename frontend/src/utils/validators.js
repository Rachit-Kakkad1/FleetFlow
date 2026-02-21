// Validation functions for FleetFlow business rules

export function validateCargoWeight(cargoWeight, maxCapacity) {
    if (cargoWeight <= 0) return { valid: false, error: 'Cargo weight must be greater than 0' };
    if (cargoWeight > maxCapacity) return { valid: false, error: `Cargo weight (${cargoWeight}kg) exceeds vehicle max capacity (${maxCapacity}kg)` };
    return { valid: true, error: null };
}

export function validateDriverLicense(driver) {
    const expiry = new Date(driver.licenseExpiry);
    const now = new Date();
    if (expiry < now) return { valid: false, error: `Driver's license expired on ${driver.licenseExpiry}` };
    return { valid: true, error: null };
}

export function validateDriverAvailability(driver) {
    if (driver.status === 'Suspended') return { valid: false, error: 'Driver is currently suspended' };
    if (driver.status === 'On Trip') return { valid: false, error: 'Driver is already on a trip' };
    if (driver.status === 'Off Duty') return { valid: false, error: 'Driver is off duty' };
    return { valid: true, error: null };
}

export function validateVehicleAvailability(vehicle) {
    if (vehicle.status === 'In Shop') return { valid: false, error: 'Vehicle is currently in maintenance' };
    if (vehicle.status === 'Retired') return { valid: false, error: 'Vehicle has been retired' };
    if (vehicle.status === 'On Trip') return { valid: false, error: 'Vehicle is already on a trip' };
    return { valid: true, error: null };
}

export function validateDriverVehicleCategory(driver, vehicle) {
    const categoryMap = {
        'Truck': ['Truck'],
        'Van': ['Van', 'Truck'],
        'Bike': ['Bike'],
    };
    const allowed = categoryMap[vehicle.type] || [];
    if (!allowed.includes(driver.category)) {
        return { valid: false, error: `Driver (${driver.category} license) cannot operate a ${vehicle.type}` };
    }
    return { valid: true, error: null };
}
