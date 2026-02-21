const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding FleetFlow database...\n');

    // ─── Clean existing data ───
    await prisma.expense.deleteMany();
    await prisma.maintenanceLog.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // ─── Users (4 — one per role) ───
    const users = await Promise.all([
        prisma.user.create({ data: { email: 'manager@fleet.com', passwordHash: await bcrypt.hash('manager123', 12), name: 'Rajesh Kapoor', role: 'MANAGER' } }),
        prisma.user.create({ data: { email: 'dispatcher@fleet.com', passwordHash: await bcrypt.hash('dispatch123', 12), name: 'Priya Sharma', role: 'DISPATCHER' } }),
        prisma.user.create({ data: { email: 'safety@fleet.com', passwordHash: await bcrypt.hash('safety123', 12), name: 'Vikram Singh', role: 'SAFETY_OFFICER' } }),
        prisma.user.create({ data: { email: 'analyst@fleet.com', passwordHash: await bcrypt.hash('analyst123', 12), name: 'Neha Gupta', role: 'FINANCIAL_ANALYST' } }),
    ]);
    console.log('✅ 4 users created');

    // ─── Vehicles (10: V001–V010) ───
    const vehicles = await Promise.all([
        prisma.vehicle.create({ data: { code: 'V001', name: 'Cargo Master', model: 'Tata Prima 4928', licensePlate: 'GJ-01-AB-1234', type: 'TRUCK', maxCapacityKg: 10000, odometerKm: 45200, region: 'West', acquisitionCost: 2500000 } }),
        prisma.vehicle.create({ data: { code: 'V002', name: 'Highway King', model: 'Ashok Leyland 3520', licensePlate: 'MH-12-CD-5678', type: 'TRUCK', maxCapacityKg: 8000, odometerKm: 32100, region: 'North', acquisitionCost: 2200000 } }),
        prisma.vehicle.create({ data: { code: 'V003', name: 'Swift Carrier', model: 'BharatBenz 1617R', licensePlate: 'DL-05-EF-9012', type: 'TRUCK', maxCapacityKg: 12000, odometerKm: 51800, region: 'North', acquisitionCost: 2800000 } }),
        prisma.vehicle.create({ data: { code: 'V004', name: 'City Runner', model: 'Tata Ace Gold', licensePlate: 'GJ-03-GH-3456', type: 'VAN', maxCapacityKg: 500, odometerKm: 12500, region: 'West', acquisitionCost: 600000 } }),
        prisma.vehicle.create({ data: { code: 'V005', name: 'Metro Express', model: 'Mahindra Supro', licensePlate: 'MH-14-JK-7890', type: 'VAN', maxCapacityKg: 750, odometerKm: 8700, region: 'South', acquisitionCost: 700000 } }),
        prisma.vehicle.create({ data: { code: 'V006', name: 'Eco Van', model: 'Tata Ace Mega', licensePlate: 'KA-01-LM-2345', type: 'VAN', maxCapacityKg: 600, odometerKm: 15300, region: 'South', acquisitionCost: 650000 } }),
        prisma.vehicle.create({ data: { code: 'V007', name: 'Flash Rider', model: 'Honda CB Shine', licensePlate: 'GJ-01-NP-6789', type: 'BIKE', maxCapacityKg: 20, odometerKm: 5600, region: 'West', acquisitionCost: 80000 } }),
        prisma.vehicle.create({ data: { code: 'V008', name: 'Quick Dash', model: 'TVS Apache', licensePlate: 'MH-12-QR-0123', type: 'BIKE', maxCapacityKg: 15, odometerKm: 3200, region: 'West', acquisitionCost: 95000 } }),
        prisma.vehicle.create({ data: { code: 'V009', name: 'Road Titan', model: 'Eicher Pro 3019', licensePlate: 'RJ-14-ST-4567', type: 'TRUCK', maxCapacityKg: 9000, odometerKm: 27600, region: 'North', acquisitionCost: 2400000 } }),
        prisma.vehicle.create({ data: { code: 'V010', name: 'Urban Mover', model: 'Tata Intra V30', licensePlate: 'TN-07-UV-8901', type: 'VAN', maxCapacityKg: 800, odometerKm: 9100, region: 'South', acquisitionCost: 750000 } }),
    ]);
    console.log('✅ 10 vehicles created');

    // ─── Drivers (8: D001–D008) ───
    const futureDate = new Date('2027-12-31');
    const pastDate = new Date('2025-06-15'); // expired — for testing
    const drivers = await Promise.all([
        prisma.driver.create({ data: { code: 'D001', name: 'Priya Sharma', email: 'priya.d@fleet.com', phone: '+91-9876543210', licenseNumber: 'DL-GJ-2020-001', licenseExpiry: futureDate, licenseCategories: ['VAN', 'TRUCK'], safetyScore: 92, totalTrips: 8, completedTrips: 7 } }),
        prisma.driver.create({ data: { code: 'D002', name: 'Rahul Verma', email: 'rahul.v@fleet.com', phone: '+91-9876543211', licenseNumber: 'DL-MH-2021-002', licenseExpiry: futureDate, licenseCategories: ['TRUCK'], safetyScore: 88, totalTrips: 5, completedTrips: 5 } }),
        prisma.driver.create({ data: { code: 'D003', name: 'Suresh Patil', email: 'suresh.p@fleet.com', phone: '+91-9876543212', licenseNumber: 'DL-MH-2019-003', licenseExpiry: futureDate, licenseCategories: ['VAN', 'BIKE'], safetyScore: 95, totalTrips: 6, completedTrips: 6 } }),
        prisma.driver.create({ data: { code: 'D004', name: 'Amit Desai', email: 'amit.d@fleet.com', phone: '+91-9876543213', licenseNumber: 'DL-GJ-2022-004', licenseExpiry: futureDate, licenseCategories: ['TRUCK', 'VAN'], safetyScore: 78, totalTrips: 4, completedTrips: 3 } }),
        prisma.driver.create({ data: { code: 'D005', name: 'Kavita Nair', email: 'kavita.n@fleet.com', phone: '+91-9876543214', licenseNumber: 'DL-KA-2020-005', licenseExpiry: futureDate, licenseCategories: ['VAN'], safetyScore: 91, totalTrips: 3, completedTrips: 3 } }),
        prisma.driver.create({ data: { code: 'D006', name: 'Deepak Joshi', email: 'deepak.j@fleet.com', phone: '+91-9876543215', licenseNumber: 'DL-DL-2021-006', licenseExpiry: futureDate, licenseCategories: ['TRUCK'], safetyScore: 85, totalTrips: 2, completedTrips: 2 } }),
        prisma.driver.create({ data: { code: 'D007', name: 'Manoj Tiwari', email: 'manoj.t@fleet.com', phone: '+91-9876543216', licenseNumber: 'DL-RJ-2023-007', licenseExpiry: pastDate, licenseCategories: ['BIKE'], safetyScore: 60, totalTrips: 1, completedTrips: 0, status: 'SUSPENDED' } }),
        prisma.driver.create({ data: { code: 'D008', name: 'Anjali Mehta', email: 'anjali.m@fleet.com', phone: '+91-9876543217', licenseNumber: 'DL-TN-2022-008', licenseExpiry: futureDate, licenseCategories: ['VAN', 'TRUCK'], safetyScore: 97, totalTrips: 3, completedTrips: 3 } }),
    ]);
    console.log('✅ 8 drivers created');

    // ─── Trips (12: T001–T012) ───
    const trips = await Promise.all([
        // Completed trips
        prisma.trip.create({ data: { code: 'T001', vehicleId: vehicles[0].id, driverId: drivers[0].id, origin: 'Ahmedabad', destination: 'Surat', cargoDescription: 'Electronics - 200 boxes', cargoWeightKg: 5000, status: 'COMPLETED', startOdometerKm: 44000, endOdometerKm: 44300, dispatchedAt: new Date('2026-02-10T06:00:00Z'), completedAt: new Date('2026-02-10T12:00:00Z'), revenue: 45000 } }),
        prisma.trip.create({ data: { code: 'T002', vehicleId: vehicles[3].id, driverId: drivers[2].id, origin: 'Mumbai', destination: 'Pune', cargoDescription: 'Garments - 80 bundles', cargoWeightKg: 450, status: 'COMPLETED', startOdometerKm: 12000, endOdometerKm: 12300, dispatchedAt: new Date('2026-02-12T08:00:00Z'), completedAt: new Date('2026-02-12T14:00:00Z'), revenue: 15000 } }),
        prisma.trip.create({ data: { code: 'T003', vehicleId: vehicles[1].id, driverId: drivers[1].id, origin: 'Delhi', destination: 'Jaipur', cargoDescription: 'FMCG goods - 150 cartons', cargoWeightKg: 6000, status: 'COMPLETED', startOdometerKm: 31000, endOdometerKm: 31280, dispatchedAt: new Date('2026-02-14T05:00:00Z'), completedAt: new Date('2026-02-14T11:00:00Z'), revenue: 38000 } }),
        prisma.trip.create({ data: { code: 'T004', vehicleId: vehicles[4].id, driverId: drivers[4].id, origin: 'Bangalore', destination: 'Mysore', cargoDescription: 'Pharma supplies - 60 crates', cargoWeightKg: 500, status: 'COMPLETED', startOdometerKm: 8000, endOdometerKm: 8150, dispatchedAt: new Date('2026-02-15T07:00:00Z'), completedAt: new Date('2026-02-15T11:00:00Z'), revenue: 12000 } }),
        prisma.trip.create({ data: { code: 'T005', vehicleId: vehicles[2].id, driverId: drivers[5].id, origin: 'Delhi', destination: 'Lucknow', cargoDescription: 'Auto parts - 300 units', cargoWeightKg: 8000, status: 'COMPLETED', startOdometerKm: 50000, endOdometerKm: 50500, dispatchedAt: new Date('2026-02-16T04:00:00Z'), completedAt: new Date('2026-02-16T14:00:00Z'), revenue: 55000 } }),
        prisma.trip.create({ data: { code: 'T006', vehicleId: vehicles[5].id, driverId: drivers[7].id, origin: 'Chennai', destination: 'Coimbatore', cargoDescription: 'Textiles - 90 bales', cargoWeightKg: 550, status: 'COMPLETED', startOdometerKm: 14800, endOdometerKm: 15300, dispatchedAt: new Date('2026-02-17T06:00:00Z'), completedAt: new Date('2026-02-17T16:00:00Z'), revenue: 22000 } }),
        // Dispatched trips (active)
        prisma.trip.create({ data: { code: 'T007', vehicleId: vehicles[8].id, driverId: drivers[3].id, origin: 'Jaipur', destination: 'Udaipur', cargoDescription: 'Furniture - 40 pieces', cargoWeightKg: 7000, status: 'DISPATCHED', startOdometerKm: 27000, dispatchedAt: new Date('2026-02-20T06:00:00Z'), revenue: 42000 } }),
        prisma.trip.create({ data: { code: 'T008', vehicleId: vehicles[9].id, driverId: drivers[0].id, origin: 'Madurai', destination: 'Trichy', cargoDescription: 'Food packages - 200 boxes', cargoWeightKg: 600, status: 'DISPATCHED', startOdometerKm: 9000, dispatchedAt: new Date('2026-02-20T08:00:00Z'), revenue: 10000 } }),
        // Draft trips (pending)
        prisma.trip.create({ data: { code: 'T009', vehicleId: vehicles[0].id, driverId: drivers[1].id, origin: 'Ahmedabad', destination: 'Rajkot', cargoDescription: 'Steel rods - 100 bundles', cargoWeightKg: 9500, status: 'DRAFT', revenue: 50000 } }),
        prisma.trip.create({ data: { code: 'T010', vehicleId: vehicles[3].id, driverId: drivers[2].id, origin: 'Pune', destination: 'Nashik', cargoDescription: 'Agro products - 70 bags', cargoWeightKg: 400, status: 'DRAFT', revenue: 8000 } }),
        // Cancelled trips
        prisma.trip.create({ data: { code: 'T011', vehicleId: vehicles[1].id, driverId: drivers[5].id, origin: 'Delhi', destination: 'Agra', cargoDescription: 'Cancelled shipment', cargoWeightKg: 3000, status: 'CANCELLED' } }),
        prisma.trip.create({ data: { code: 'T012', vehicleId: vehicles[6].id, driverId: drivers[6].id, origin: 'Ahmedabad', destination: 'Gandhinagar', cargoDescription: 'Documents - 5 packets', cargoWeightKg: 5, status: 'CANCELLED' } }),
    ]);
    console.log('✅ 12 trips created');

    // Set dispatched vehicles/drivers to ON_TRIP
    await prisma.vehicle.updateMany({ where: { id: { in: [vehicles[8].id, vehicles[9].id] } }, data: { status: 'ON_TRIP' } });
    await prisma.driver.updateMany({ where: { id: { in: [drivers[3].id, drivers[0].id] } }, data: { status: 'ON_TRIP' } });

    // ─── Maintenance Logs (6: M001–M006) ───
    await Promise.all([
        prisma.maintenanceLog.create({ data: { code: 'M001', vehicleId: vehicles[4].id, type: 'PREVENTIVE', description: 'Oil Change + Filter Replacement', cost: 3500, technician: 'Ramesh K.', notes: 'Regular 10000km service', completed: true, startDate: new Date('2026-02-01'), endDate: new Date('2026-02-02') } }),
        prisma.maintenanceLog.create({ data: { code: 'M002', vehicleId: vehicles[0].id, type: 'REACTIVE', description: 'Brake Pad Replacement', cost: 8500, technician: 'Sunil M.', notes: 'Front brake pads worn out', completed: true, startDate: new Date('2026-02-05'), endDate: new Date('2026-02-06') } }),
        prisma.maintenanceLog.create({ data: { code: 'M003', vehicleId: vehicles[1].id, type: 'PREVENTIVE', description: 'Tyre Rotation + Alignment', cost: 4200, technician: 'Ramesh K.', completed: true, startDate: new Date('2026-02-08'), endDate: new Date('2026-02-08') } }),
        prisma.maintenanceLog.create({ data: { code: 'M004', vehicleId: vehicles[2].id, type: 'REACTIVE', description: 'Engine Coolant Leak Fix', cost: 12000, technician: 'Ajay P.', notes: 'Radiator hose replaced', completed: true, startDate: new Date('2026-02-10'), endDate: new Date('2026-02-12') } }),
        prisma.maintenanceLog.create({ data: { code: 'M005', vehicleId: vehicles[5].id, type: 'PREVENTIVE', description: 'AC Servicing', cost: 5000, technician: 'Sunil M.', completed: true, startDate: new Date('2026-02-14'), endDate: new Date('2026-02-14') } }),
        prisma.maintenanceLog.create({ data: { code: 'M006', vehicleId: vehicles[3].id, type: 'REACTIVE', description: 'Clutch Plate Replacement', cost: 9500, technician: 'Ajay P.', notes: 'Heavy wear from city driving', completed: false, startDate: new Date('2026-02-19') } }),
    ]);
    // M006 is active → vehicle V004 is in shop
    await prisma.vehicle.update({ where: { id: vehicles[3].id }, data: { status: 'IN_SHOP' } });
    console.log('✅ 6 maintenance logs created');

    // ─── Expenses (12: E001–E012) ───
    await prisma.expense.createMany({
        data: [
            { code: 'E001', vehicleId: vehicles[0].id, tripId: trips[0].id, category: 'FUEL', liters: 120, cost: 12000, date: new Date('2026-02-10') },
            { code: 'E002', vehicleId: vehicles[0].id, tripId: trips[0].id, category: 'TOLL', cost: 850, date: new Date('2026-02-10') },
            { code: 'E003', vehicleId: vehicles[3].id, tripId: trips[1].id, category: 'FUEL', liters: 25, cost: 2500, date: new Date('2026-02-12') },
            { code: 'E004', vehicleId: vehicles[3].id, tripId: trips[1].id, category: 'TOLL', cost: 350, date: new Date('2026-02-12') },
            { code: 'E005', vehicleId: vehicles[1].id, tripId: trips[2].id, category: 'FUEL', liters: 80, cost: 8000, date: new Date('2026-02-14') },
            { code: 'E006', vehicleId: vehicles[1].id, tripId: trips[2].id, category: 'TOLL', cost: 600, date: new Date('2026-02-14') },
            { code: 'E007', vehicleId: vehicles[4].id, tripId: trips[3].id, category: 'FUEL', liters: 18, cost: 1800, date: new Date('2026-02-15') },
            { code: 'E008', vehicleId: vehicles[2].id, tripId: trips[4].id, category: 'FUEL', liters: 150, cost: 15000, date: new Date('2026-02-16') },
            { code: 'E009', vehicleId: vehicles[2].id, tripId: trips[4].id, category: 'TOLL', cost: 1200, date: new Date('2026-02-16') },
            { code: 'E010', vehicleId: vehicles[5].id, tripId: trips[5].id, category: 'FUEL', liters: 45, cost: 4500, date: new Date('2026-02-17') },
            { code: 'E011', vehicleId: vehicles[6].id, category: 'FUEL', liters: 5, cost: 500, date: new Date('2026-02-18') },
            { code: 'E012', vehicleId: vehicles[8].id, category: 'OTHER', cost: 2000, date: new Date('2026-02-19'), notes: 'Parking charges for overnight halt' },
        ],
    });
    console.log('✅ 12 expenses created');

    console.log('\n🎉 Seed complete! Login credentials:');
    console.log('   Manager:    manager@fleet.com    / manager123');
    console.log('   Dispatcher: dispatcher@fleet.com / dispatch123');
    console.log('   Safety:     safety@fleet.com     / safety123');
    console.log('   Analyst:    analyst@fleet.com    / analyst123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
