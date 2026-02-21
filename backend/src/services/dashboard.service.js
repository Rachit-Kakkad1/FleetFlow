const prisma = require('../config/db');

/**
 * Dashboard KPIs — at-a-glance fleet oversight.
 */
const getKPIs = async () => {
    const [
        totalVehicles,
        activeFleet,
        maintenanceAlerts,
        retiredCount,
        pendingCargo,
        totalDrivers,
        driversOnTrip,
    ] = await Promise.all([
        prisma.vehicle.count(),
        prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
        prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
        prisma.vehicle.count({ where: { status: 'RETIRED' } }),
        prisma.trip.count({ where: { status: 'DRAFT' } }),
        prisma.driver.count(),
        prisma.driver.count({ where: { status: 'ON_TRIP' } }),
    ]);

    const operationalFleet = totalVehicles - retiredCount;
    const utilizationRate = operationalFleet > 0
        ? ((activeFleet / operationalFleet) * 100).toFixed(1)
        : '0.0';

    return {
        totalVehicles,
        activeFleet,
        maintenanceAlerts,
        retiredVehicles: retiredCount,
        utilizationRate: parseFloat(utilizationRate),
        pendingCargo,
        totalDrivers,
        driversOnTrip,
    };
};

/**
 * Fleet status breakdown by vehicle status.
 */
const getFleetStatus = async () => {
    const [available, onTrip, inShop, retired] = await Promise.all([
        prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
        prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
        prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
        prisma.vehicle.count({ where: { status: 'RETIRED' } }),
    ]);
    return { Available: available, OnTrip: onTrip, InShop: inShop, Retired: retired };
};

/**
 * Safety score distribution across drivers.
 */
const getSafetyScores = async () => {
    const drivers = await prisma.driver.findMany({ select: { safetyScore: true } });
    let excellent = 0, good = 0, atRisk = 0;
    for (const d of drivers) {
        if (d.safetyScore >= 90) excellent++;
        else if (d.safetyScore >= 70) good++;
        else atRisk++;
    }
    return { excellent, good, atRisk };
};

/**
 * Cost breakdown by expense category + maintenance.
 */
const getCostBreakdown = async () => {
    const [fuelAgg, tollAgg, otherAgg, maintAgg] = await Promise.all([
        prisma.expense.aggregate({ where: { category: 'FUEL' }, _sum: { cost: true } }),
        prisma.expense.aggregate({ where: { category: 'TOLL' }, _sum: { cost: true } }),
        prisma.expense.aggregate({ where: { category: 'OTHER' }, _sum: { cost: true } }),
        prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
    ]);
    const fuel = fuelAgg._sum.cost || 0;
    const toll = tollAgg._sum.cost || 0;
    const other = otherAgg._sum.cost || 0;
    const maintenance = maintAgg._sum.cost || 0;
    return { fuel, maintenance, toll, other, total: fuel + toll + other + maintenance };
};

module.exports = { getKPIs, getFleetStatus, getSafetyScores, getCostBreakdown };
