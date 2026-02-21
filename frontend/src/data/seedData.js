// FleetFlow Seed Data
export const seedVehicles = [
  { id: 'V001', name: 'Cargo Master', model: 'Tata 407', type: 'Truck', licensePlate: 'GJ-01-AB-1234', maxCapacity: 3000, odometer: 45230, status: 'Available', region: 'West', acquisitionCost: 1200000 },
  { id: 'V002', name: 'Swift Carrier', model: 'Mahindra Bolero Pickup', type: 'Truck', licensePlate: 'GJ-05-CD-5678', maxCapacity: 1500, odometer: 32100, status: 'On Trip', region: 'West', acquisitionCost: 850000 },
  { id: 'V003', name: 'City Express', model: 'Maruti Eeco Cargo', type: 'Van', licensePlate: 'GJ-03-EF-9012', maxCapacity: 500, odometer: 67890, status: 'Available', region: 'North', acquisitionCost: 450000 },
  { id: 'V004', name: 'Metro Runner', model: 'Tata Ace Gold', type: 'Van', licensePlate: 'GJ-06-GH-3456', maxCapacity: 750, odometer: 28400, status: 'In Shop', region: 'East', acquisitionCost: 550000 },
  { id: 'V005', name: 'Flash Delivery', model: 'Hero Xtreme 160R', type: 'Bike', licensePlate: 'GJ-01-JK-7890', maxCapacity: 20, odometer: 15600, status: 'Available', region: 'West', acquisitionCost: 120000 },
  { id: 'V006', name: 'Highway King', model: 'Ashok Leyland Dost', type: 'Truck', licensePlate: 'GJ-02-LM-1122', maxCapacity: 2500, odometer: 89200, status: 'Available', region: 'South', acquisitionCost: 780000 },
  { id: 'V007', name: 'Quick Ship', model: 'Force Traveller Delivery', type: 'Van', licensePlate: 'GJ-08-NP-3344', maxCapacity: 1000, odometer: 41500, status: 'On Trip', region: 'North', acquisitionCost: 680000 },
  { id: 'V008', name: 'Rapid Moto', model: 'Bajaj Pulsar 150', type: 'Bike', licensePlate: 'GJ-04-QR-5566', maxCapacity: 15, odometer: 22300, status: 'Available', region: 'East', acquisitionCost: 95000 },
  { id: 'V009', name: 'Heavy Hauler', model: 'Eicher Pro 2049', type: 'Truck', licensePlate: 'GJ-07-ST-7788', maxCapacity: 5000, odometer: 120500, status: 'Retired', region: 'South', acquisitionCost: 1800000 },
  { id: 'V010', name: 'Urban Sprint', model: 'Tata Intra V20', type: 'Van', licensePlate: 'GJ-09-UV-9900', maxCapacity: 600, odometer: 18750, status: 'Available', region: 'West', acquisitionCost: 620000 },
];

export const seedDrivers = [
  { id: 'D001', name: 'Alex Kumar', licenseNo: 'GJ0120210045678', licenseExpiry: '2027-06-15', category: 'Truck', phone: '9876543210', status: 'On Duty', safetyScore: 92, tripsCompleted: 145, tripsAssigned: 152 },
  { id: 'D002', name: 'Priya Sharma', licenseNo: 'GJ0520220067891', licenseExpiry: '2026-03-10', category: 'Van', phone: '9876543211', status: 'On Trip', safetyScore: 88, tripsCompleted: 98, tripsAssigned: 105 },
  { id: 'D003', name: 'Raj Patel', licenseNo: 'GJ0320210078912', licenseExpiry: '2025-12-01', category: 'Truck', phone: '9876543212', status: 'On Duty', safetyScore: 75, tripsCompleted: 201, tripsAssigned: 230 },
  { id: 'D004', name: 'Meera Joshi', licenseNo: 'GJ0120230089123', licenseExpiry: '2028-09-20', category: 'Bike', phone: '9876543213', status: 'Off Duty', safetyScore: 95, tripsCompleted: 67, tripsAssigned: 68 },
  { id: 'D005', name: 'Vikram Singh', licenseNo: 'GJ0620210090234', licenseExpiry: '2026-01-05', category: 'Truck', phone: '9876543214', status: 'On Duty', safetyScore: 82, tripsCompleted: 178, tripsAssigned: 200 },
  { id: 'D006', name: 'Anita Desai', licenseNo: 'GJ0420220001345', licenseExpiry: '2027-11-30', category: 'Van', phone: '9876543215', status: 'Suspended', safetyScore: 58, tripsCompleted: 45, tripsAssigned: 62 },
  { id: 'D007', name: 'Karan Mehta', licenseNo: 'GJ0820210012456', licenseExpiry: '2026-05-18', category: 'Bike', phone: '9876543216', status: 'On Trip', safetyScore: 90, tripsCompleted: 312, tripsAssigned: 325 },
  { id: 'D008', name: 'Sonal Trivedi', licenseNo: 'GJ0220230023567', licenseExpiry: '2028-02-28', category: 'Truck', phone: '9876543217', status: 'On Duty', safetyScore: 86, tripsCompleted: 56, tripsAssigned: 59 },
];

export const seedTrips = [
  { id: 'T001', vehicleId: 'V002', driverId: 'D002', origin: 'Ahmedabad', destination: 'Surat', cargoWeight: 1200, status: 'Dispatched', createdAt: '2026-02-18', startOdometer: 31800, endOdometer: null, description: 'Electronics shipment' },
  { id: 'T002', vehicleId: 'V007', driverId: 'D007', origin: 'Rajkot', destination: 'Vadodara', cargoWeight: 800, status: 'Dispatched', createdAt: '2026-02-19', startOdometer: 41200, endOdometer: null, description: 'Textile delivery' },
  { id: 'T003', vehicleId: 'V001', driverId: 'D001', origin: 'Gandhinagar', destination: 'Anand', cargoWeight: 2500, status: 'Completed', createdAt: '2026-02-15', startOdometer: 44200, endOdometer: 44530, description: 'Agricultural supplies' },
  { id: 'T004', vehicleId: 'V003', driverId: 'D003', origin: 'Bhavnagar', destination: 'Junagadh', cargoWeight: 400, status: 'Completed', createdAt: '2026-02-14', startOdometer: 67200, endOdometer: 67550, description: 'FMCG goods' },
  { id: 'T005', vehicleId: 'V006', driverId: 'D005', origin: 'Surat', destination: 'Mumbai', cargoWeight: 2200, status: 'Completed', createdAt: '2026-02-12', startOdometer: 88000, endOdometer: 88300, description: 'Industrial parts' },
  { id: 'T006', vehicleId: 'V005', driverId: 'D004', origin: 'Ahmedabad', destination: 'Mehsana', cargoWeight: 15, status: 'Completed', createdAt: '2026-02-10', startOdometer: 15200, endOdometer: 15310, description: 'Document courier' },
  { id: 'T007', vehicleId: 'V010', driverId: 'D008', origin: 'Vadodara', destination: 'Bharuch', cargoWeight: 450, status: 'Completed', createdAt: '2026-02-08', startOdometer: 18200, endOdometer: 18420, description: 'Pharma supplies' },
  { id: 'T008', vehicleId: 'V001', driverId: 'D003', origin: 'Ahmedabad', destination: 'Rajkot', cargoWeight: 2800, status: 'Completed', createdAt: '2026-02-05', startOdometer: 43800, endOdometer: 44200, description: 'Building materials' },
  { id: 'T009', vehicleId: 'V003', driverId: 'D002', origin: 'Gandhinagar', destination: 'Kalol', cargoWeight: 350, status: 'Cancelled', createdAt: '2026-02-04', startOdometer: null, endOdometer: null, description: 'Cancelled by customer' },
  { id: 'T010', vehicleId: 'V008', driverId: 'D007', origin: 'Surat', destination: 'Navsari', cargoWeight: 12, status: 'Completed', createdAt: '2026-02-03', startOdometer: 21900, endOdometer: 22050, description: 'Express parcel' },
  { id: 'T011', vehicleId: 'V006', driverId: 'D001', origin: 'Rajkot', destination: 'Jamnagar', cargoWeight: 1800, status: 'Completed', createdAt: '2026-02-01', startOdometer: 87500, endOdometer: 88000, description: 'Food grain delivery' },
  { id: 'T012', vehicleId: 'V002', driverId: 'D005', origin: 'Anand', destination: 'Nadiad', cargoWeight: 1100, status: 'Draft', createdAt: '2026-02-20', startOdometer: null, endOdometer: null, description: 'Dairy products' },
];

export const seedMaintenance = [
  { id: 'M001', vehicleId: 'V004', serviceType: 'Engine Repair', cost: 15000, date: '2026-02-19', technician: 'Ramesh Auto Works', notes: 'Engine overheating issue', completed: false },
  { id: 'M002', vehicleId: 'V001', serviceType: 'Oil Change', cost: 3500, date: '2026-02-16', technician: 'Quick Lube Center', notes: 'Routine 10K km service', completed: true },
  { id: 'M003', vehicleId: 'V006', serviceType: 'Tire Replacement', cost: 22000, date: '2026-02-13', technician: 'MRF Tire Shop', notes: 'All 4 tires replaced', completed: true },
  { id: 'M004', vehicleId: 'V003', serviceType: 'Brake Service', cost: 5500, date: '2026-02-11', technician: 'City Motors', notes: 'Front brake pads replaced', completed: true },
  { id: 'M005', vehicleId: 'V009', serviceType: 'Full Overhaul', cost: 85000, date: '2026-01-25', technician: 'Eicher Service Center', notes: 'Major engine overhaul before retirement', completed: true },
  { id: 'M006', vehicleId: 'V002', serviceType: 'AC Service', cost: 4500, date: '2026-02-07', technician: 'Cool Breeze AC', notes: 'Gas refill and filter change', completed: true },
];

export const seedExpenses = [
  { id: 'E001', vehicleId: 'V001', type: 'Fuel', liters: 60, cost: 6120, date: '2026-02-17', tripId: 'T003' },
  { id: 'E002', vehicleId: 'V002', type: 'Fuel', liters: 45, cost: 4590, date: '2026-02-18', tripId: 'T001' },
  { id: 'E003', vehicleId: 'V003', type: 'Fuel', liters: 25, cost: 2550, date: '2026-02-14', tripId: 'T004' },
  { id: 'E004', vehicleId: 'V006', type: 'Fuel', liters: 55, cost: 5610, date: '2026-02-13', tripId: 'T005' },
  { id: 'E005', vehicleId: 'V005', type: 'Fuel', liters: 5, cost: 510, date: '2026-02-10', tripId: 'T006' },
  { id: 'E006', vehicleId: 'V010', type: 'Fuel', liters: 30, cost: 3060, date: '2026-02-08', tripId: 'T007' },
  { id: 'E007', vehicleId: 'V001', type: 'Fuel', liters: 70, cost: 7140, date: '2026-02-06', tripId: 'T008' },
  { id: 'E008', vehicleId: 'V008', type: 'Fuel', liters: 4, cost: 408, date: '2026-02-03', tripId: 'T010' },
  { id: 'E009', vehicleId: 'V006', type: 'Fuel', liters: 80, cost: 8160, date: '2026-02-01', tripId: 'T011' },
  { id: 'E010', vehicleId: 'V001', type: 'Toll', liters: 0, cost: 450, date: '2026-02-15', tripId: 'T003' },
  { id: 'E011', vehicleId: 'V006', type: 'Toll', liters: 0, cost: 1200, date: '2026-02-12', tripId: 'T005' },
  { id: 'E012', vehicleId: 'V002', type: 'Toll', liters: 0, cost: 350, date: '2026-02-18', tripId: 'T001' },
];

export function initializeData() {
  if (!localStorage.getItem('ff_vehicles')) {
    localStorage.setItem('ff_vehicles', JSON.stringify(seedVehicles));
  }
  if (!localStorage.getItem('ff_drivers')) {
    localStorage.setItem('ff_drivers', JSON.stringify(seedDrivers));
  }
  if (!localStorage.getItem('ff_trips')) {
    localStorage.setItem('ff_trips', JSON.stringify(seedTrips));
  }
  if (!localStorage.getItem('ff_maintenance')) {
    localStorage.setItem('ff_maintenance', JSON.stringify(seedMaintenance));
  }
  if (!localStorage.getItem('ff_expenses')) {
    localStorage.setItem('ff_expenses', JSON.stringify(seedExpenses));
  }
  if (!localStorage.getItem('ff_users')) {
    localStorage.setItem('ff_users', JSON.stringify([
      { id: 'U001', name: 'Manager', email: 'manager@fleetflow.com', password: 'manager123', role: 'Fleet Manager', createdAt: '2026-01-01' },
    ]));
  }
}
