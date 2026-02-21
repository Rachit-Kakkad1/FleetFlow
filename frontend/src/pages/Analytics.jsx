import { useFleet } from '../context/FleetContext';
import { calcVehicleROI, calcCostPerKm, calcTotalOperationalCost, formatCurrency, exportToCSV } from '../utils/calculations';
import { getPermissions } from '../config/roleConfig';
import StatCard from '../components/ui/StatCard';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { BarChart3, Download, Printer, Truck, Navigation, Users, DollarSign } from 'lucide-react';

export default function Analytics() {
  const { vehicles, drivers, trips, maintenance, expenses, user } = useFleet();
  const perms = getPermissions(user?.role);

  // Fuel efficiency per vehicle
  const fuelData = vehicles.filter(v => v.status !== 'Retired').map(v => {
    const vTrips = trips.filter(t => t.vehicleId === v.id && t.status === 'Completed');
    const totalKm = vTrips.reduce((s, t) => s + ((t.endOdometer || 0) - (t.startOdometer || 0)), 0);
    const totalLiters = expenses.filter(e => e.vehicleId === v.id && e.type === 'Fuel').reduce((s, e) => s + e.liters, 0);
    const efficiency = totalLiters > 0 ? Number((totalKm / totalLiters).toFixed(1)) : 0;
    return { name: v.name, efficiency, totalKm, totalLiters };
  }).filter(v => v.totalKm > 0).sort((a, b) => b.efficiency - a.efficiency);

  // ROI per vehicle
  const roiData = vehicles.map(v => {
    const roi = calcVehicleROI(v, trips, expenses, maintenance);
    const costPerKm = calcCostPerKm(v.id, trips, expenses, maintenance);
    const { total } = calcTotalOperationalCost(v.id, expenses, maintenance);
    return { ...v, ...roi, costPerKm, totalOps: total };
  }).sort((a, b) => Number(b.roi) - Number(a.roi));

  // Cost breakdown
  const totalFuel = expenses.filter(e => e.type === 'Fuel').reduce((s, e) => s + e.cost, 0);
  const totalToll = expenses.filter(e => e.type === 'Toll').reduce((s, e) => s + e.cost, 0);
  const totalOther = expenses.filter(e => e.type !== 'Fuel' && e.type !== 'Toll').reduce((s, e) => s + e.cost, 0);
  const totalMaint = maintenance.reduce((s, m) => s + m.cost, 0);
  const grandTotal = totalFuel + totalToll + totalOther + totalMaint;

  const costBreakdown = [
    { name: 'Fuel', value: totalFuel, fill: '#5A7A8A' },
    { name: 'Maintenance', value: totalMaint, fill: '#C8941A' },
    { name: 'Toll', value: totalToll, fill: '#728156' },
    { name: 'Other', value: totalOther, fill: '#6B7280' },
  ].filter(c => c.value > 0);

  // Trip volume over time
  const tripsByMonth = {};
  trips.forEach(t => {
    const d = new Date(t.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    tripsByMonth[key] = (tripsByMonth[key] || 0) + 1;
  });
  const timeSeriesData = Object.entries(tripsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, trips: count }));

  // Export handlers
  const handleExportVehicles = () => {
    exportToCSV(roiData.map(v => ({
      Vehicle: v.name, Model: v.model, Type: v.type, LicensePlate: v.licensePlate,
      Status: v.status, Revenue: v.totalRevenue, FuelCost: v.totalFuel,
      MaintenanceCost: v.totalMaint, ROI: v.roi + '%', CostPerKm: v.costPerKm,
    })), 'FleetFlow_Vehicle_Report');
  };
  const handleExportTrips = () => {
    exportToCSV(trips.map(t => ({
      TripID: t.id, Vehicle: t.vehicleId, Driver: t.driverId,
      Origin: t.origin, Destination: t.destination, CargoKg: t.cargoWeight,
      Status: t.status, Date: t.createdAt,
    })), 'FleetFlow_Trip_Report');
  };
  const handleExportExpenses = () => {
    exportToCSV(expenses.map(e => ({
      ID: e.id, Vehicle: e.vehicleId, Type: e.type,
      Liters: e.liters, Cost: e.cost, Date: e.date, Trip: e.tripId || '',
    })), 'FleetFlow_Expense_Report');
  };

  return (
    <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="page-header">
        <h1><BarChart3 size={24} /> Analytics & Reports</h1>
        {perms.canExportReports && (
          <div className="page-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleExportVehicles}><Download size={14} /> Vehicles CSV</button>
            <button className="btn btn-secondary btn-sm" onClick={handleExportTrips}><Download size={14} /> Trips CSV</button>
            <button className="btn btn-secondary btn-sm" onClick={handleExportExpenses}><Download size={14} /> Expenses CSV</button>
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}><Printer size={14} /> Print PDF</button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard icon={Truck} label="Total Vehicles" value={vehicles.length} />
        <StatCard icon={Navigation} label="Total Trips" value={trips.length} />
        <StatCard icon={Users} label="Total Drivers" value={drivers.length} />
        <StatCard icon={DollarSign} label="Grand Ops Cost" value={formatCurrency(grandTotal)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {/* Fuel Efficiency */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Fuel Efficiency (km/L)</h3>
          {fuelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fuelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }}
                  formatter={(val) => [`${val} km/L`, 'Efficiency']}
                />
                <Bar dataKey="efficiency" radius={[0, 4, 4, 0]} barSize={14}>
                  {fuelData.map((entry) => (
                    <Cell key={entry.name} fill={entry.efficiency > 8 ? '#728156' : entry.efficiency > 5 ? '#C8941A' : '#B85450'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No fuel data available</p>}
        </div>

        {/* Cost Breakdown Donut */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Cost Breakdown</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={costBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {costBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {costBreakdown.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.fill, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', minWidth: 70 }}>{c.name}</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{formatCurrency(c.value)}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({grandTotal > 0 ? ((c.value / grandTotal) * 100).toFixed(0) : 0}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trip Volume */}
        {timeSeriesData.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: 16 }}>Trip Volume Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timeSeriesData} margin={{ left: 0, right: 10 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="trips" stroke="#728156" fill="rgba(114, 129, 86, 0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Vehicle ROI Table */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Vehicle ROI Analysis</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Vehicle</th><th>Revenue</th><th>Fuel</th><th>Maint.</th><th>Acq. Cost</th><th>Cost/km</th><th>ROI</th></tr>
            </thead>
            <tbody>
              {roiData.map(v => (
                <tr key={v.id}>
                  <td data-label="Vehicle">
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 600 }}>{v.name}</span>
                      <br /><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{v.model}</span>
                    </div>
                  </td>
                  <td data-label="Revenue" className="mono">{formatCurrency(v.totalRevenue)}</td>
                  <td data-label="Fuel" className="mono">{formatCurrency(v.totalFuel)}</td>
                  <td data-label="Maint." className="mono">{formatCurrency(v.totalMaint)}</td>
                  <td data-label="Acq. Cost" className="mono">{formatCurrency(v.acquisitionCost)}</td>
                  <td data-label="Cost/km" className="mono">{v.costPerKm !== '—' ? `₹${v.costPerKm}` : '—'}</td>
                  <td data-label="ROI"><span className="mono" style={{ fontWeight: 700, color: Number(v.roi) >= 0 ? 'var(--status-success)' : 'var(--status-error)' }}>{v.roi}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
