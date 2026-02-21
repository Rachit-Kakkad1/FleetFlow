const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function embedMapData() {
    console.log('🌐 Injecting Fleet Map & Fuel Anomaly data...');

    let trips = await prisma.trip.findMany();
    let vehicles = await prisma.vehicle.findMany();

    if (trips.length < 3) {
        console.log('Not enough trips. Reseeding might be needed.');
        return;
    }

    // Assign long distance origins/destinations for the map to look cool
    await prisma.trip.update({
        where: { id: trips[0].id },
        data: { status: 'ON_TRIP', origin: 'Mumbai', destination: 'Delhi' }
    });
    await prisma.trip.update({
        where: { id: trips[1].id },
        data: { status: 'ON_TRIP', origin: 'Bangalore', destination: 'Chennai' }
    });
    await prisma.trip.update({
        where: { id: trips[2].id },
        data: { status: 'ON_TRIP', origin: 'Ahmedabad', destination: 'Surat' }
    });

    for (let i = 0; i < 3; i++) {
        await prisma.vehicle.update({ where: { id: trips[i].vehicleId }, data: { status: 'ON_TRIP' } });
        await prisma.driver.update({ where: { id: trips[i].driverId }, data: { status: 'ON_TRIP' } });
    }

    const exCount = await prisma.fuelAnomaly.count();
    if (exCount === 0) {
        await prisma.fuelAnomaly.create({
            data: {
                vehicleId: trips[0].vehicleId,
                driverId: trips[0].driverId,
                tripId: trips[0].id,
                expectedFuel: 120,
                loggedFuel: 185.5,
                difference: 65.5,
                status: 'PENDING_REVIEW'
            }
        });
        await prisma.fuelAnomaly.create({
            data: {
                vehicleId: trips[1].vehicleId,
                driverId: trips[1].driverId,
                tripId: trips[1].id,
                expectedFuel: 55,
                loggedFuel: 88,
                difference: 33,
                status: 'PENDING_REVIEW'
            }
        });
        console.log('🚨 Added Suspicious Anomalies!');
    }

    console.log('✅ Complete!');
}

embedMapData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
