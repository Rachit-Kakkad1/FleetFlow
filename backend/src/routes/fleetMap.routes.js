const router = require('express').Router();
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');
const prisma = require('../config/db');

router.use(authenticate);
router.use(authorize('MANAGER'));

/**
 * GET /api/fleet-map/data
 * Returns fleet map data with origin/destination coords for active trips
 * and In Shop vehicles.
 */
router.get('/data', async (_req, res, next) => {
    try {
        // Active trips (ON_TRIP) with vehicle + driver info
        const activeTrips = await prisma.trip.findMany({
            where: { status: 'ON_TRIP' },
            include: {
                vehicle: { select: { code: true, name: true, type: true, region: true } },
                driver: { select: { name: true } },
            },
        });

        // In Shop vehicles (not on trips but in maintenance)
        const inShopVehicles = await prisma.vehicle.findMany({
            where: { status: 'IN_SHOP' },
            select: { code: true, name: true, type: true, region: true },
        });

        // Map of Indian cities → approximate lat/lng
        const CITY_COORDS = {
            'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
            'Surat': { lat: 21.1702, lng: 72.8311 },
            'Mumbai': { lat: 19.0760, lng: 72.8777 },
            'Pune': { lat: 18.5204, lng: 73.8567 },
            'Delhi': { lat: 28.7041, lng: 77.1025 },
            'Jaipur': { lat: 26.9124, lng: 75.7873 },
            'Lucknow': { lat: 26.8467, lng: 80.9462 },
            'Bangalore': { lat: 12.9716, lng: 77.5946 },
            'Mysore': { lat: 12.2958, lng: 76.6394 },
            'Chennai': { lat: 13.0827, lng: 80.2707 },
            'Coimbatore': { lat: 11.0168, lng: 76.9558 },
            'Udaipur': { lat: 24.5854, lng: 73.7125 },
            'Rajkot': { lat: 22.3039, lng: 70.8022 },
            'Nashik': { lat: 20.0063, lng: 73.7902 },
            'Agra': { lat: 27.1767, lng: 78.0081 },
            'Gandhinagar': { lat: 23.2156, lng: 72.6369 },
            'Madurai': { lat: 9.9252, lng: 78.1198 },
            'Trichy': { lat: 10.7905, lng: 78.7047 },
        };

        const mapData = activeTrips.map((trip) => {
            const origin = CITY_COORDS[trip.origin] || { lat: 20.5937, lng: 78.9629 };
            const dest = CITY_COORDS[trip.destination] || { lat: 20.5937, lng: 78.9629 };

            return {
                id: trip.code,
                vehicle_name: trip.vehicle.name,
                vehicle_type: trip.vehicle.type,
                region: trip.vehicle.region,
                driver_name: trip.driver.name,
                status: 'On Trip',
                origin_name: trip.origin,
                origin_lat: origin.lat,
                origin_lng: origin.lng,
                destination_name: trip.destination,
                destination_lat: dest.lat,
                destination_lng: dest.lng,
                estimated_distance_km: Math.round(
                    Math.sqrt(Math.pow((dest.lat - origin.lat) * 111, 2) + Math.pow((dest.lng - origin.lng) * 85, 2))
                ),
                route_geometry: {
                    type: 'LineString',
                    coordinates: [[origin.lat, origin.lng], [dest.lat, dest.lng]],
                },
            };
        });

        // Add in-shop vehicles with null route
        for (const v of inShopVehicles) {
            mapData.push({
                id: v.code,
                vehicle_name: v.name,
                vehicle_type: v.type,
                region: v.region,
                driver_name: null,
                status: 'In Shop',
                origin_name: null,
                origin_lat: null,
                origin_lng: null,
                destination_name: null,
                destination_lat: null,
                destination_lng: null,
                estimated_distance_km: null,
                route_geometry: null,
            });
        }

        res.json({ success: true, data: mapData });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
