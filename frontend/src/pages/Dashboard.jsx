import { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { calcUtilizationRate, calcCostPerKm, formatCurrency, formatDate } from '../utils/calculations';
import { getRoleConfig } from '../config/roleConfig';
import StatCard from '../components/ui/StatCard';
import StatusChip from '../components/ui/StatusChip';
import LiveFleetMap from '../components/map/LiveFleetMap';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Truck, Wrench, Activity, Package, CheckCircle2, Zap,
  Users, AlertTriangle, Ban, DollarSign, Fuel, BarChart3, Calendar,
} from 'lucide-react';

const CHART_COLORS = {
  Available: '#728156',
  'On Trip': '#5A7A8A',
  'In Shop': '#C8941A',
  Retired: '#6B7280',
};

export default function Dashboard() {
  const { vehicles, drivers, trips, maintenance, expenses, user } = useFleet();
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const config = getRoleConfig(user?.role);
  const kpis = config.dashboardKPIs;
  const widgets = config.dashboardWidgets;

  // KPI calculations
  const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
  const maintenanceAlerts = vehicles.filter(v => v.status === 'In Shop').length;
  const utilization = calcUtilizationRate(vehicles);
  const pendingCargo = trips.filter(t => t.status === 'Draft').length;
  const vehiclesAvailable = vehicles.filter(v => v.status === 'Available').length;
  const vehiclesOnTrip = vehicles.filter(v => v.status === 'On Trip').length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Duty').length;
  const suspendedDrivers = drivers.filter(d => d.status === 'Suspended').length;
  const vehiclesInShop = vehicles.filter(v => v.status === 'In Shop').length;

  const now = new Date();
  const licenseExpiryAlerts = drivers.filter(d => {
    const exp = new Date(d.licenseExpiry);
    return (exp - now) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  // Financial KPIs
  const totalOpsCost = expenses.reduce((s, e) => s + e.cost, 0) + maintenance.reduce((s, m) => s + m.cost, 0);
  const totalFuelExpenses = expenses.filter(e => e.type === 'Fuel');
  const totalLiters = totalFuelExpenses.reduce((s, e) => s + e.liters, 0);
  const completedTrips = trips.filter(t => t.status === 'Completed');
  const totalKm = completedTrips.reduce((s, t) => s + ((t.endOdometer || 0) - (t.startOdometer || 0)), 0);
  const avgFuelEff = totalLiters > 0 ? (totalKm / totalLiters).toFixed(1) : '0';
  const avgROI = vehicles.length > 0
    ? (vehicles.reduce((s, v) => {
      const cost = v.acquisitionCost || 1;
      const rev = completedTrips.filter(t => t.vehicleId === v.id).reduce((rs, t) => rs + t.cargoWeight * 2.5, 0);
      const ops = expenses.filter(e => e.vehicleId === v.id).reduce((es, e) => es + e.cost, 0) + maintenance.filter(m => m.vehicleId === v.id).reduce((ms, m) => ms + m.cost, 0);
      return s + ((rev - ops - cost) / cost) * 100;
    }, 0) / vehicles.length).toFixed(1)
    : '0';
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthlyExpense = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).reduce((s, e) => s + e.cost, 0)
    + maintenance.filter(m => { const d = new Date(m.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).reduce((s, m) => s + m.cost, 0);

  const filteredVehicles = vehicles.filter(v => {
    if (typeFilter !== 'All' && v.type !== typeFilter) return false;
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
    return true;
  });

  const recentTrips = [...trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const activeTrips = recentTrips.filter(t => t.status === 'Draft' || t.status === 'Dispatched');
  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]));
  const driverMap = Object.fromEntries(drivers.map(d => [d.id, d]));

  // Fleet status chart data
  const statusData = [
    { name: 'Available', value: vehiclesAvailable },
    { name: 'On Trip', value: vehiclesOnTrip },
    { name: 'In Shop', value: vehiclesInShop },
    { name: 'Retired', value: vehicles.filter(v => v.status === 'Retired').length },
  ].filter(d => d.value > 0);

  // KPI card definitions
  const kpiCards = {
    activeFleet: <StatCard key="af" icon={Truck} label="Active Fleet" value={activeFleet} sub={`${vehicles.filter(v => v.status !== 'Retired').length} total active`} />,
    maintenanceAlerts: <StatCard key="ma" icon={Wrench} label="Maintenance Alerts" value={maintenanceAlerts} sub={`${maintenance.filter(m => !m.completed).length} open logs`} />,
    utilizationRate: <StatCard key="ur" icon={Activity} label="Utilization Rate" value={`${utilization}%`} sub="Fleet assigned vs idle" />,
    pendingCargo: <StatCard key="pc" icon={Package} label="Pending Cargo" value={pendingCargo} sub="Awaiting dispatch" />,
    vehiclesAvailable: <StatCard key="va" icon={CheckCircle2} label="Available" value={vehiclesAvailable} sub="Ready for dispatch" />,
    vehiclesOnTrip: <StatCard key="vt" icon={Zap} label="On Trip" value={vehiclesOnTrip} sub="Currently in transit" />,
    driversOnDuty: <StatCard key="dd" icon={Users} label="Drivers On Duty" value={driversOnDuty} sub={`${drivers.length} total drivers`} />,
    licenseExpiryAlerts: <StatCard key="le" icon={AlertTriangle} label="License Alerts" value={licenseExpiryAlerts} sub="Expiring within 7 days" />,
    suspendedDrivers: <StatCard key="sd" icon={Ban} label="Suspended" value={suspendedDrivers} sub="Off-roster" />,
    vehiclesInShop: <StatCard key="vs" icon={Wrench} label="In Shop" value={vehiclesInShop} sub="Under maintenance" />,
    totalOpsCost: <StatCard key="to" icon={DollarSign} label="Total Ops Cost" value={formatCurrency(totalOpsCost)} sub="All-time spend" />,
    fuelEfficiency: <StatCard key="fe" icon={Fuel} label="Fuel Efficiency" value={`${avgFuelEff} km/L`} sub="Fleet average" />,
    vehicleROI: <StatCard key="vr" icon={BarChart3} label="Avg Vehicle ROI" value={`${avgROI}%`} sub="Return on investment" />,
    monthlyExpenseSummary: <StatCard key="me" icon={Calendar} label="Monthly Expenses" value={formatCurrency(monthlyExpense)} sub="This month's spend" />,
  };

  // Compliance data
  const complianceDrivers = drivers.filter(d => {
    const exp = new Date(d.licenseExpiry);
    return (exp - now) / (1000 * 60 * 60 * 24) <= 7;
  });

  // Safety score distribution
  const safetyBuckets = [
    { name: 'Excellent (80-100)', value: drivers.filter(d => d.safetyScore >= 80).length, fill: '#728156' },
    { name: 'Good (60-79)', value: drivers.filter(d => d.safetyScore >= 60 && d.safetyScore < 80).length, fill: '#C8941A' },
    { name: 'At Risk (<60)', value: drivers.filter(d => d.safetyScore < 60).length, fill: '#B85450' },
  ];

  // Cost breakdown for financial
  const totalFuel = expenses.filter(e => e.type === 'Fuel').reduce((s, e) => s + e.cost, 0);
  const totalToll = expenses.filter(e => e.type === 'Toll').reduce((s, e) => s + e.cost, 0);
  const totalOther = expenses.filter(e => e.type !== 'Fuel' && e.type !== 'Toll').reduce((s, e) => s + e.cost, 0);
  const totalMaint = maintenance.reduce((s, m) => s + m.cost, 0);
  const grandTotal = totalFuel + totalToll + totalOther + totalMaint || 1;
  const costBreakdown = [
    { name: 'Fuel', value: totalFuel, fill: '#5A7A8A' },
    { name: 'Maintenance', value: totalMaint, fill: '#C8941A' },
    { name: 'Toll', value: totalToll, fill: '#728156' },
    { name: 'Other', value: totalOther, fill: '#6B7280' },
  ].filter(c => c.value > 0);

  // ROI data
  const roiData = vehicles.map(v => {
    const rev = completedTrips.filter(t => t.vehicleId === v.id).reduce((rs, t) => rs + t.cargoWeight * 2.5, 0);
    const opsCost = expenses.filter(e => e.vehicleId === v.id).reduce((s, e) => s + e.cost, 0) + maintenance.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
    const roi = v.acquisitionCost > 0 ? (((rev - opsCost - v.acquisitionCost) / v.acquisitionCost) * 100).toFixed(1) : '0';
    const costPerKm = calcCostPerKm(v.id, trips, expenses, maintenance);
    return { ...v, revenue: rev, opsCost, roi, costPerKm };
  }).sort((a, b) => Number(b.roi) - Number(a.roi));

  return (
    <motion.div
      className="page-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1>Command Center</h1>
        <span style={{
          fontSize: '0.7rem', fontWeight: 600,
          padding: '4px 10px', borderRadius: 20,
          background: 'var(--status-success-bg)', color: 'var(--status-success)',
        }}>
          {user?.role}
        </span>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {kpis.map(k => kpiCards[k])}
      </div>

      {/* Live Fleet Map */}
      {widgets.includes('liveFleetMap') && (
        <LiveFleetMap trips={trips} vehicles={vehicles} drivers={drivers} />
      )}

      {/* Filters */}
      {(widgets.includes('fleetStatusChart') || widgets.includes('recentTripsActive')) && (
        <div className="filter-bar" style={{ marginTop: 16 }}>
          {['All', 'Truck', 'Van', 'Bike'].map(t => (
            <button key={t} className={`filter-chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
          ))}
          <span style={{ width: 1, height: 20, background: 'var(--border-color)', alignSelf: 'center' }} />
          {['All', 'Available', 'On Trip', 'In Shop', 'Retired'].map(s => (
            <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 16, marginTop: 4 }}>
        {/* Fleet Status Distribution */}
        {widgets.includes('fleetStatusChart') && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Fleet Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={CHART_COLORS[entry.name] || '#728156'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Trips */}
        {widgets.includes('recentTrips') && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Recent Trips</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentTrips.map(trip => (
                <div key={trip.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--border-color)',
                }}>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{trip.origin} → {trip.destination}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {vehicleMap[trip.vehicleId]?.name || trip.vehicleId} · {driverMap[trip.driverId]?.name || trip.driverId}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusChip status={trip.status} />
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(trip.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Trips (Dispatcher) */}
        {widgets.includes('recentTripsActive') && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: 16 }}>Active & Pending Trips</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeTrips.length > 0 ? activeTrips.map(trip => (
                <div key={trip.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--border-color)',
                }}>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{trip.origin} → {trip.destination}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {vehicleMap[trip.vehicleId]?.name || trip.vehicleId} · {driverMap[trip.driverId]?.name || trip.driverId}
                    </p>
                  </div>
                  <StatusChip status={trip.status} />
                </div>
              )) : (
                <p style={{ padding: 16, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>No active trips</p>
              )}
            </div>
          </div>
        )}

        {/* Compliance Alerts (Safety Officer) */}
        {widgets.includes('complianceAlertPanel') && (
          <div className="card">
            <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} color="var(--status-error)" />
              Compliance Alerts
            </h3>
            {complianceDrivers.length > 0 ? complianceDrivers.map(d => {
              const exp = new Date(d.licenseExpiry);
              const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
              const isExpired = days <= 0;
              return (
                <div key={d.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--border-color)',
                }}>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{d.name}</p>
                    <p className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.licenseNo}</p>
                  </div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    padding: '3px 8px', borderRadius: 12,
                    background: isExpired ? 'var(--status-error-bg)' : 'var(--status-warning-bg)',
                    color: isExpired ? 'var(--status-error)' : 'var(--status-warning)',
                  }}>
                    {isExpired ? `EXPIRED ${Math.abs(days)}d ago` : `Expires in ${days}d`}
                  </span>
                </div>
              );
            }) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All drivers compliant</p>}
          </div>
        )}

        {/* Safety Score Chart (Safety Officer) */}
        {widgets.includes('safetyScoreChart') && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Safety Score Overview</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={safetyBuckets} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {safetyBuckets.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Avg score: <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {drivers.length ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length) : 0}%
              </span>
            </p>
          </div>
        )}

        {/* Cost Breakdown Donut (Financial Analyst) */}
        {widgets.includes('costBreakdownDonut') && (
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Cost Breakdown</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={costBreakdown} dataKey="value" cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70} paddingAngle={2}
                  >
                    {costBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {costBreakdown.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.fill, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', minWidth: 80 }}>{c.name}</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{formatCurrency(c.value)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({((c.value / grandTotal) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ROI Table (Financial Analyst) */}
        {widgets.includes('roiTable') && (
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Vehicle ROI Snapshot</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Vehicle</th><th>Revenue</th><th>Ops Cost</th><th>Cost/km</th><th>ROI</th></tr>
                </thead>
                <tbody>
                  {roiData.slice(0, 5).map(v => (
                    <tr key={v.id}>
                      <td data-label="Vehicle" style={{ fontWeight: 600 }}>{v.name}</td>
                      <td data-label="Revenue" className="mono">{formatCurrency(v.revenue)}</td>
                      <td data-label="Ops Cost" className="mono">{formatCurrency(v.opsCost)}</td>
                      <td data-label="Cost/km" className="mono">{v.costPerKm !== '—' ? `₹${v.costPerKm}` : '—'}</td>
                      <td data-label="ROI">
                        <span className="mono" style={{ fontWeight: 700, color: Number(v.roi) >= 0 ? 'var(--status-success)' : 'var(--status-error)' }}>
                          {v.roi}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ROI & Cost/Km cards */}
      {(widgets.includes('roiCard') || widgets.includes('costPerKmCard')) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
          {widgets.includes('roiCard') && (
            <div className="card" style={{ padding: 18 }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Vehicle ROI</p>
              <p className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4, color: Number(avgROI) >= 0 ? 'var(--status-success)' : 'var(--status-error)' }}>{avgROI}%</p>
            </div>
          )}
          {widgets.includes('costPerKmCard') && (
            <div className="card" style={{ padding: 18 }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Cost per KM</p>
              <p className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 4, color: 'var(--brand-primary)' }}>
                {totalKm > 0 ? `₹${(totalOpsCost / totalKm).toFixed(2)}` : '—'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fleet Vehicles Table */}
      {widgets.includes('fleetStatusChart') && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Fleet Vehicles ({filteredVehicles.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th><th>Type</th><th>License Plate</th><th>Capacity</th><th>Odometer</th><th>Region</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map(v => (
                  <tr key={v.id}>
                    <td data-label="Vehicle">
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600 }}>{v.name}</span>
                        <br /><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{v.model}</span>
                      </div>
                    </td>
                    <td data-label="Type">{v.type}</td>
                    <td data-label="License Plate" className="mono" style={{ fontSize: '0.8rem' }}>{v.licensePlate}</td>
                    <td data-label="Capacity" className="mono">{v.maxCapacity.toLocaleString()} kg</td>
                    <td data-label="Odometer" className="mono">{v.odometer.toLocaleString()} km</td>
                    <td data-label="Region">{v.region}</td>
                    <td data-label="Status"><StatusChip status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
