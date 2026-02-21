import { useRef, useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getFleetMapData } from '../../data/fleetGeoData';

// Status → color mapping
const STATUS_COLORS = {
    'On Trip': '#5A7A8A',
    'Completed': '#728156',
    'In Shop': '#C8941A',
};

function createPopupContent(item) {
    const statusClass = item.status.toLowerCase().replace(' ', '-');
    return `
        <div class="fleet-popup">
            <h4>${item.vehicle_name}</h4>
            <table>
                <tr><td>Driver</td><td><strong>${item.driver_name}</strong></td></tr>
                <tr><td>Route</td><td>${item.origin_name} → ${item.destination_name}</td></tr>
                <tr><td>Distance</td><td>${item.estimated_distance_km} km</td></tr>
                <tr><td>Type</td><td>${item.vehicle_type}</td></tr>
                <tr><td>Status</td><td><span class="status-tag ${statusClass}">${item.status}</span></td></tr>
            </table>
        </div>
    `;
}

function createMarkerIcon(status, isVehicle = false) {
    const color = STATUS_COLORS[status] || '#94a3b8';
    if (isVehicle) {
        return L.divIcon({
            className: 'fleet-marker',
            html: `<div class="fleet-vehicle-marker"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
        });
    }
    const cls = status.toLowerCase().replace(' ', '-');
    return L.divIcon({
        className: 'fleet-marker',
        html: `<div class="fleet-marker-inner ${cls}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

/**
 * Interpolate position along a polyline given progress (0..1).
 */
function interpolateRoute(coords, progress) {
    if (!coords || coords.length < 2) return coords?.[0] || [23.0, 72.5];
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // Calculate total length
    let totalDist = 0;
    const segDists = [];
    for (let i = 1; i < coords.length; i++) {
        const dx = coords[i][0] - coords[i - 1][0];
        const dy = coords[i][1] - coords[i - 1][1];
        const d = Math.sqrt(dx * dx + dy * dy);
        segDists.push(d);
        totalDist += d;
    }

    let targetDist = clampedProgress * totalDist;
    let cumDist = 0;
    for (let i = 0; i < segDists.length; i++) {
        if (cumDist + segDists[i] >= targetDist) {
            const segProgress = (targetDist - cumDist) / segDists[i];
            const lat = coords[i][0] + (coords[i + 1][0] - coords[i][0]) * segProgress;
            const lng = coords[i][1] + (coords[i + 1][1] - coords[i][1]) * segProgress;
            return [lat, lng];
        }
        cumDist += segDists[i];
    }
    return coords[coords.length - 1];
}

export default function LiveFleetMap({ trips, vehicles, drivers }) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const layersRef = useRef({});
    const animMarkersRef = useRef([]);
    const animIntervalRef = useRef(null);

    const [regionFilter, setRegionFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    // Build enriched map data
    const allMapData = useMemo(() =>
        getFleetMapData(trips, vehicles, drivers),
        [trips, vehicles, drivers]
    );

    // Apply filters
    const mapData = useMemo(() => {
        return allMapData.filter(item => {
            if (regionFilter !== 'All' && item.region !== regionFilter) return false;
            if (typeFilter !== 'All' && item.vehicle_type !== typeFilter) return false;
            return true;
        });
    }, [allMapData, regionFilter, typeFilter]);

    // Count by status
    const counts = useMemo(() => ({
        onTrip: mapData.filter(d => d.status === 'On Trip').length,
        completed: mapData.filter(d => d.status === 'Completed').length,
        inShop: mapData.filter(d => d.status === 'In Shop').length,
    }), [mapData]);

    // Unique filter values
    const regions = [...new Set(allMapData.map(d => d.region))].sort();
    const types = [...new Set(allMapData.map(d => d.vehicle_type))].sort();

    // ── Initialize map once ──
    useEffect(() => {
        if (mapInstanceRef.current || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [22.5, 72.0],
            zoom: 7,
            zoomControl: true,
            attributionControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;

        const handleResize = () => map.invalidateSize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animIntervalRef.current) clearInterval(animIntervalRef.current);
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // ── Update layers when data changes ──
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clean old layers
        Object.values(layersRef.current).forEach(lg => {
            map.removeLayer(lg);
        });
        if (animIntervalRef.current) {
            clearInterval(animIntervalRef.current);
            animIntervalRef.current = null;
        }
        animMarkersRef.current = [];

        // Create new layer groups
        const onTripLayer = L.layerGroup();
        const completedLayer = L.layerGroup();
        const inShopLayer = L.layerGroup();

        for (const item of mapData) {
            if (item.status === 'On Trip') {
                // Draw blue route polyline
                if (item.route_geometry?.coordinates?.length > 1) {
                    const polyline = L.polyline(item.route_geometry.coordinates, {
                        color: '#5A7A8A',
                        weight: 3,
                        opacity: 0.7,
                        dashArray: '8 4',
                    });
                    onTripLayer.addLayer(polyline);
                }

                // Origin marker
                const originMarker = L.marker([item.origin_lat, item.origin_lng], {
                    icon: createMarkerIcon('On Trip'),
                }).bindPopup(createPopupContent(item));
                onTripLayer.addLayer(originMarker);

                // Animated vehicle marker
                const startPos = item.route_geometry?.coordinates?.[0] || [item.origin_lat, item.origin_lng];
                const vehicleMarker = L.marker(startPos, {
                    icon: createMarkerIcon('On Trip', true),
                    zIndexOffset: 1000,
                }).bindPopup(createPopupContent(item));
                onTripLayer.addLayer(vehicleMarker);

                animMarkersRef.current.push({
                    marker: vehicleMarker,
                    coords: item.route_geometry?.coordinates || [],
                    progress: Math.random() * 0.6, // Random start position
                    speed: 0.008 + Math.random() * 0.01,
                });

            } else if (item.status === 'Completed') {
                // Faded green route
                if (item.route_geometry?.coordinates?.length > 1) {
                    const polyline = L.polyline(item.route_geometry.coordinates, {
                        color: '#728156',
                        weight: 2,
                        opacity: 0.3,
                    });
                    completedLayer.addLayer(polyline);
                }

                // Green marker at destination
                const destMarker = L.marker([item.destination_lat, item.destination_lng], {
                    icon: createMarkerIcon('Completed'),
                }).bindPopup(createPopupContent(item));
                completedLayer.addLayer(destMarker);

            } else if (item.status === 'In Shop') {
                // Yellow marker at last known location
                const shopMarker = L.marker([item.origin_lat, item.origin_lng], {
                    icon: createMarkerIcon('In Shop'),
                }).bindPopup(createPopupContent(item));
                inShopLayer.addLayer(shopMarker);
            }
        }

        // Add to map
        onTripLayer.addTo(map);
        completedLayer.addTo(map);
        inShopLayer.addTo(map);

        layersRef.current = { onTripLayer, completedLayer, inShopLayer };

        // Layer control
        const overlays = {
            '🔵 On Trip': onTripLayer,
            '🟢 Completed': completedLayer,
            '🟡 In Shop': inShopLayer,
        };

        // Remove old control if exists
        map.eachLayer(l => {
            if (l._controlLayers) map.removeControl(l._controlLayers);
        });

        const layerControl = L.control.layers(null, overlays, { position: 'topright', collapsed: false });
        layerControl.addTo(map);

        // Fit bounds
        const allCoords = mapData.flatMap(item => {
            const pts = [[item.origin_lat, item.origin_lng]];
            if (item.destination_lat !== item.origin_lat || item.destination_lng !== item.origin_lng) {
                pts.push([item.destination_lat, item.destination_lng]);
            }
            return pts;
        });
        if (allCoords.length > 0) {
            map.fitBounds(L.latLngBounds(allCoords), { padding: [30, 30], maxZoom: 10 });
        }

        // ── Animation loop ──
        if (animMarkersRef.current.length > 0) {
            animIntervalRef.current = setInterval(() => {
                for (const anim of animMarkersRef.current) {
                    anim.progress += anim.speed;
                    if (anim.progress > 1) anim.progress = 0; // loop
                    const pos = interpolateRoute(anim.coords, anim.progress);
                    anim.marker.setLatLng(pos);
                }
            }, 2500);
        }

        // Cleanup on next render
        return () => {
            if (animIntervalRef.current) {
                clearInterval(animIntervalRef.current);
                animIntervalRef.current = null;
            }
            // Remove layer control
            map.eachLayer(l => {
                if (l.remove && l !== map) {
                    // keep tile layer
                }
            });
            layerControl.remove();
            Object.values(layersRef.current).forEach(lg => map.removeLayer(lg));
        };
    }, [mapData]);

    return (
        <div className="fleet-map-card">
            <div className="fleet-map-header">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    Live Fleet Tracking
                    <span className="fleet-map-live-dot" />
                </h3>

                <div className="fleet-map-filters">
                    <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
                        <option value="All">All Regions</option>
                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="All">All Types</option>
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="fleet-map-container" style={{ position: 'relative' }}>
                <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
                <div className="fleet-map-legend">
                    <div className="fleet-map-legend-title">Legend</div>
                    <div className="fleet-map-legend-item">
                        <div className="fleet-map-legend-dot" style={{ background: '#5A7A8A' }} />
                        <span>On Trip</span>
                    </div>
                    <div className="fleet-map-legend-item">
                        <div className="fleet-map-legend-dot" style={{ background: '#728156' }} />
                        <span>Completed</span>
                    </div>
                    <div className="fleet-map-legend-item">
                        <div className="fleet-map-legend-dot" style={{ background: '#C8941A' }} />
                        <span>In Maintenance</span>
                    </div>
                </div>
            </div>

            <div className="fleet-map-stats">
                <div className="fleet-map-stat">
                    <div className="fleet-map-stat-dot" style={{ background: '#5A7A8A' }} />
                    <strong>{counts.onTrip}</strong> On Trip
                </div>
                <div className="fleet-map-stat">
                    <div className="fleet-map-stat-dot" style={{ background: '#728156' }} />
                    <strong>{counts.completed}</strong> Completed
                </div>
                <div className="fleet-map-stat">
                    <div className="fleet-map-stat-dot" style={{ background: '#C8941A' }} />
                    <strong>{counts.inShop}</strong> In Maintenance
                </div>
                <div className="fleet-map-stat" style={{ marginLeft: 'auto' }}>
                    <strong>{mapData.length}</strong> Total Entries
                </div>
            </div>
        </div>
    );
}
