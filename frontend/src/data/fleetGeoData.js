// ─── Fleet Geo Data Layer ─────────────────────────────────────────────────────
// Pre-computed coordinates and route geometries for Gujarat cities.
// No routing API calls needed — all geometry is stored here.

export const cityCoords = {
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Surat': { lat: 21.1702, lng: 72.8311 },
    'Vadodara': { lat: 22.3072, lng: 73.1812 },
    'Rajkot': { lat: 22.3039, lng: 70.8022 },
    'Gandhinagar': { lat: 23.2156, lng: 72.6369 },
    'Bhavnagar': { lat: 21.7645, lng: 72.1519 },
    'Junagadh': { lat: 21.5222, lng: 70.4579 },
    'Jamnagar': { lat: 22.4707, lng: 70.0577 },
    'Anand': { lat: 22.5645, lng: 72.9289 },
    'Nadiad': { lat: 22.6916, lng: 72.8634 },
    'Mehsana': { lat: 23.5880, lng: 72.3693 },
    'Bharuch': { lat: 21.7051, lng: 72.9959 },
    'Kalol': { lat: 23.2440, lng: 72.5066 },
    'Navsari': { lat: 20.9467, lng: 72.9520 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
};

// Pre-computed route geometries as arrays of [lat, lng] waypoints
// These approximate real road routes through Gujarat
const routeGeometries = {
    'Ahmedabad-Surat': [
        [23.0225, 72.5714], [22.9500, 72.6000], [22.7500, 72.6500],
        [22.5500, 72.7000], [22.3072, 73.1812], [22.1000, 72.9000],
        [21.8000, 72.8500], [21.5000, 72.8300], [21.1702, 72.8311]
    ],
    'Rajkot-Vadodara': [
        [22.3039, 70.8022], [22.3500, 71.2000], [22.4000, 71.6000],
        [22.4000, 72.0000], [22.3500, 72.4000], [22.3200, 72.8000],
        [22.3072, 73.1812]
    ],
    'Gandhinagar-Anand': [
        [23.2156, 72.6369], [23.1000, 72.6500], [23.0225, 72.5714],
        [22.8000, 72.6500], [22.6500, 72.8000], [22.5645, 72.9289]
    ],
    'Bhavnagar-Junagadh': [
        [21.7645, 72.1519], [21.7000, 71.8000], [21.6000, 71.4000],
        [21.5500, 71.0000], [21.5222, 70.4579]
    ],
    'Surat-Mumbai': [
        [21.1702, 72.8311], [20.9000, 72.9000], [20.5000, 72.9500],
        [20.1000, 72.9800], [19.8000, 73.0000], [19.5000, 72.9500],
        [19.2000, 72.9200], [19.0760, 72.8777]
    ],
    'Ahmedabad-Mehsana': [
        [23.0225, 72.5714], [23.1500, 72.5500], [23.3000, 72.5000],
        [23.4500, 72.4200], [23.5880, 72.3693]
    ],
    'Vadodara-Bharuch': [
        [22.3072, 73.1812], [22.2000, 73.1500], [22.0500, 73.1000],
        [21.9000, 73.0500], [21.7051, 72.9959]
    ],
    'Ahmedabad-Rajkot': [
        [23.0225, 72.5714], [22.9500, 72.3000], [22.8000, 72.0000],
        [22.6500, 71.6000], [22.5000, 71.2000], [22.3039, 70.8022]
    ],
    'Gandhinagar-Kalol': [
        [23.2156, 72.6369], [23.2300, 72.5800], [23.2440, 72.5066]
    ],
    'Surat-Navsari': [
        [21.1702, 72.8311], [21.0500, 72.8800], [20.9467, 72.9520]
    ],
    'Rajkot-Jamnagar': [
        [22.3039, 70.8022], [22.3500, 70.6000], [22.4000, 70.3000],
        [22.4707, 70.0577]
    ],
    'Anand-Nadiad': [
        [22.5645, 72.9289], [22.6200, 72.9000], [22.6916, 72.8634]
    ],
};

/**
 * Get a route geometry between two city names.
 * Tries both directions (A-B and B-A). Falls back to straight line.
 */
function getRouteGeometry(origin, destination) {
    const key1 = `${origin}-${destination}`;
    const key2 = `${destination}-${origin}`;
    if (routeGeometries[key1]) return routeGeometries[key1];
    if (routeGeometries[key2]) return [...routeGeometries[key2]].reverse();
    // Fallback: straight line with midpoint
    const o = cityCoords[origin];
    const d = cityCoords[destination];
    if (!o || !d) return [];
    return [
        [o.lat, o.lng],
        [(o.lat + d.lat) / 2, (o.lng + d.lng) / 2],
        [d.lat, d.lng]
    ];
}

/**
 * Estimate distance between two cities (haversine approximation).
 */
function estimateDistance(originName, destName) {
    const o = cityCoords[originName];
    const d = cityCoords[destName];
    if (!o || !d) return 0;
    const R = 6371;
    const dLat = (d.lat - o.lat) * Math.PI / 180;
    const dLng = (d.lng - o.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(o.lat * Math.PI / 180) * Math.cos(d.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3); // 1.3x for road factor
}

/**
 * Build enriched fleet map data from app state.
 * Returns array of map-ready trip objects + "In Shop" vehicle entries.
 */
export function getFleetMapData(trips, vehicles, drivers) {
    const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));
    const driverMap = Object.fromEntries(drivers.map(d => [d.id, d]));

    const mapData = [];

    // Enrich each relevant trip
    for (const trip of trips) {
        if (trip.status === 'Cancelled' || trip.status === 'Draft') continue;
        const vehicle = vehicleMap[trip.vehicleId];
        const driver = driverMap[trip.driverId];
        if (!vehicle || !driver) continue;
        const originCoord = cityCoords[trip.origin];
        const destCoord = cityCoords[trip.destination];
        if (!originCoord || !destCoord) continue;

        mapData.push({
            id: trip.id,
            vehicle_name: vehicle.name,
            vehicle_type: vehicle.type,
            region: vehicle.region,
            driver_name: driver.name,
            status: trip.status === 'Dispatched' ? 'On Trip' : trip.status,
            origin_name: trip.origin,
            origin_lat: originCoord.lat,
            origin_lng: originCoord.lng,
            destination_name: trip.destination,
            destination_lat: destCoord.lat,
            destination_lng: destCoord.lng,
            estimated_distance_km: estimateDistance(trip.origin, trip.destination),
            route_geometry: {
                type: 'LineString',
                coordinates: getRouteGeometry(trip.origin, trip.destination),
            },
        });
    }

    // Add "In Shop" vehicles as standalone marker entries
    for (const v of vehicles) {
        if (v.status !== 'In Shop') continue;
        // Guess last city from region or fallback to Ahmedabad
        const regionCity = { West: 'Ahmedabad', North: 'Mehsana', South: 'Surat', East: 'Vadodara' };
        const cityName = regionCity[v.region] || 'Ahmedabad';
        const coord = cityCoords[cityName];
        mapData.push({
            id: `MAINT-${v.id}`,
            vehicle_name: v.name,
            vehicle_type: v.type,
            region: v.region,
            driver_name: '—',
            status: 'In Shop',
            origin_name: cityName,
            origin_lat: coord.lat,
            origin_lng: coord.lng,
            destination_name: cityName,
            destination_lat: coord.lat,
            destination_lng: coord.lng,
            estimated_distance_km: 0,
            route_geometry: null,
        });
    }

    return mapData;
}
