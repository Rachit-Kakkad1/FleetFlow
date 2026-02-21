// Calculation utilities for FleetFlow

export function calcUtilizationRate(vehicles) {
    if (vehicles.length === 0) return 0;
    const active = vehicles.filter(v => v.status === 'On Trip' || v.status === 'In Shop').length;
    const total = vehicles.filter(v => v.status !== 'Retired').length;
    return total > 0 ? Math.round((active / total) * 100) : 0;
}

export function calcFuelEfficiency(trip, expenses) {
    const tripExpenses = expenses.filter(e => e.tripId === trip.id && e.type === 'Fuel');
    const totalLiters = tripExpenses.reduce((sum, e) => sum + e.liters, 0);
    const distance = trip.endOdometer && trip.startOdometer ? trip.endOdometer - trip.startOdometer : 0;
    return totalLiters > 0 ? (distance / totalLiters).toFixed(1) : '—';
}

export function calcVehicleROI(vehicle, trips, expenses, maintenance) {
    const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id && t.status === 'Completed');
    // Estimate revenue as ₹15/kg/trip
    const totalRevenue = vehicleTrips.reduce((sum, t) => sum + (t.cargoWeight * 15), 0);
    const totalFuel = expenses.filter(e => e.vehicleId === vehicle.id).reduce((sum, e) => sum + e.cost, 0);
    const totalMaint = maintenance.filter(m => m.vehicleId === vehicle.id).reduce((sum, m) => sum + m.cost, 0);
    const roi = vehicle.acquisitionCost > 0
        ? (((totalRevenue - totalFuel - totalMaint) / vehicle.acquisitionCost) * 100).toFixed(1)
        : 0;
    return { totalRevenue, totalFuel, totalMaint, roi };
}

export function calcTotalOperationalCost(vehicleId, expenses, maintenance) {
    const fuelCost = expenses.filter(e => e.vehicleId === vehicleId).reduce((sum, e) => sum + e.cost, 0);
    const maintCost = maintenance.filter(m => m.vehicleId === vehicleId).reduce((sum, m) => sum + m.cost, 0);
    return { fuelCost, maintCost, total: fuelCost + maintCost };
}

export function calcCostPerKm(vehicleId, trips, expenses, maintenance) {
    const vehicleTrips = trips.filter(t => t.vehicleId === vehicleId && t.status === 'Completed');
    const totalKm = vehicleTrips.reduce((sum, t) => sum + (t.endOdometer - t.startOdometer), 0);
    const { total } = calcTotalOperationalCost(vehicleId, expenses, maintenance);
    return totalKm > 0 ? (total / totalKm).toFixed(2) : '—';
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function exportToCSV(data, filename) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
