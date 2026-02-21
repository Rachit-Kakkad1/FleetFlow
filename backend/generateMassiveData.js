const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CITIES = [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
    'Bhavnagar', 'Junagadh', 'Jamnagar', 'Anand', 'Nadiad',
    'Mehsana', 'Bharuch', 'Kalol', 'Navsari', 'Mumbai',
    'Pune', 'Delhi', 'Jaipur', 'Lucknow', 'Bangalore', 'Chennai'
];

function randomEl(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function saturateFleetMap() {
    console.log('🌍 Initializing Massive Fleet Geo-Saturation...');

    // Create extra drivers
    const drivers = [];
    for (let i = 10; i < 30; i++) {
        const d = await prisma.driver.create({
            data: {
                code: `DRV-MASS-${i}`,
                name: `Contractor ${i}`,
                email: `c${i}@fleet.com`,
                phone: `+91-999000${1000 + i}`,
                licenseNumber: `DL-TMP-${i}`,
                licenseExpiry: new Date('2028-01-01'),
                licenseCategories: ['TRUCK', 'VAN'],
                safetyScore: 85 + Math.floor(Math.random() * 15),
                status: 'ON_TRIP'
            }
        });
        drivers.push(d);
    }
    console.log(`✅ Generated ${drivers.length} synthetic drivers`);

    // Create extra vehicles
    const vehicles = [];
    for (let i = 20; i < 40; i++) {
        const v = await prisma.vehicle.create({
            data: {
                code: `VEH-MASS-${i}`,
                name: `Logistics Titan ${i}`,
                model: 'Heavy Duty 5000',
                licensePlate: `GJ-XX-${8000 + i}`,
                type: Math.random() > 0.3 ? 'TRUCK' : 'VAN',
                maxCapacityKg: 15000,
                odometerKm: 120000 + (Math.random() * 50000),
                region: 'National',
                acquisitionCost: 3000000,
                status: 'ON_TRIP'
            }
        });
        vehicles.push(v);
    }
    console.log(`✅ Generated ${vehicles.length} synthetic vehicles`);

    // Generate 20 concurrent active trips
    for (let i = 0; i < 20; i++) {
        let o = randomEl(CITIES);
        let d = randomEl(CITIES);
        while (o === d) d = randomEl(CITIES);

        await prisma.trip.create({
            data: {
                code: `TRP-MASS-${i}`,
                vehicleId: vehicles[i].id,
                driverId: drivers[i].id,
                origin: o,
                destination: d,
                cargoDescription: 'Bulk Logistics Cargo',
                cargoWeightKg: 8000 + Math.random() * 4000,
                status: 'ON_TRIP',
                startOdometerKm: vehicles[i].odometerKm,
                dispatchedAt: new Date(),
                revenue: 35000 + Math.floor(Math.random() * 25000)
            }
        });
    }
    console.log(`✅ Launched 20 simultaneous massive operations on the Live Fleet Map!`);

    console.log('🚀 DB Saturation Complete!');
}

saturateFleetMap()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
