import React from 'react';
import { 
  AlertOctagon, 
  Clock, 
  FileCheck2, 
  AlertTriangle, 
  Car, 
  MapPin, 
  Receipt, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldAlert,
  ChevronRight,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { StatusBadge, SeverityBadge } from '../common/StatusBadge';
import { formatINR } from '../../utils/formatters';

export const DashboardView: React.FC = () => {
  const { 
    violations, 
    zones, 
    getAllVehicleProfiles, 
    setActiveTab, 
    setSelectedViolationId, 
    setSelectedVehiclePlate,
    exportViolationsCSV
  } = useParking();

  const vehicleProfiles = getAllVehicleProfiles();
  const totalViolations = violations.length;
  const pendingCases = violations.filter(v => ['Reported', 'Under Review'].includes(v.status)).length;
  const repeatOffenders = vehicleProfiles.filter(p => p.isRepeatOffender).length;
  const bootTowEligibleCount = vehicleProfiles.filter(p => p.bootTowEligible).length;
  
  const unresolvedPenalties = violations
    .filter(v => ['Confirmed', 'Fine Pending', 'Reported', 'Under Review'].includes(v.status))
    .reduce((sum, v) => sum + v.fineAmount, 0);

  const totalCollected = violations
    .filter(v => v.status === 'Paid')
    .reduce((sum, v) => sum + v.fineAmount, 0);

  // Violations by zone
  const zoneStats = zones.map(z => {
    const count = violations.filter(v => v.zoneId === z.id).length;
    const unpaid = violations
      .filter(v => v.zoneId === z.id && ['Confirmed', 'Fine Pending'].includes(v.status))
      .reduce((sum, v) => sum + v.fineAmount, 0);
    return {
      ...z,
      violationCount: count,
      unpaidAmount: unpaid,
      utilizationPercent: Math.round((z.currentOccupancy / z.capacity) * 100),
    };
  }).sort((a, b) => b.violationCount - a.violationCount);

  // Common categories
  const categoryCounts: Record<string, number> = {};
  violations.forEach(v => {
    categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Status breakdown
  const statusCounts = {
    Reported: violations.filter(v => v.status === 'Reported').length,
    'Under Review': violations.filter(v => v.status === 'Under Review').length,
    Confirmed: violations.filter(v => v.status === 'Confirmed').length,
    'Fine Pending': violations.filter(v => v.status === 'Fine Pending').length,
    Paid: violations.filter(v => v.status === 'Paid').length,
    Appealed: violations.filter(v => v.status === 'Appealed').length,
    Resolved: violations.filter(v => v.status === 'Resolved').length,
  };

  const recentViolations = violations.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Demo Context Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Campus Parking Enforcement Control
              <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                Live Prototype Mode
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Centralized monitoring for student lots, faculty bays, EV stalls, and emergency red curbs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('record')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Issue New Citation
          </button>
          <button
            onClick={exportViolationsCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            title="Download CSV report"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden md:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Boot/Tow Alert Banner if repeat offenders exceed threshold */}
      {bootTowEligibleCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-900 block">
                Security Attention: {bootTowEligibleCount} Vehicle(s) Eligible for Immobilization (Wheel Boot / Tow)
              </span>
              <span className="text-rose-700">
                Vehicles with 4+ confirmed infractions or &gt;₹5,000 in unpaid penalties flagged for patrol dispatch.
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('repeat-offenders')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shrink-0"
          >
            View Watchlist
          </button>
        </div>
      )}

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Violations */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Violations</span>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {totalViolations}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              Active Log
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Across 6 university parking zones
          </p>
        </div>

        {/* Pending Cases */}
        <div 
          onClick={() => setActiveTab('violations')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Pending Cases</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {pendingCases}
            </span>
            <span className="text-xs text-amber-600 font-semibold">
              Needs Review
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {statusCounts.Reported} reported · {statusCounts['Under Review']} in review
          </p>
        </div>

        {/* Repeat Offenders */}
        <div 
          onClick={() => setActiveTab('repeat-offenders')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs cursor-pointer hover:border-rose-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Repeat Offenders</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {repeatOffenders}
            </span>
            <span className="text-xs text-rose-600 font-semibold">
              3+ Citations
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {bootTowEligibleCount} vehicles flagged for boot/tow
          </p>
        </div>

        {/* Unresolved Penalties */}
        <div 
          onClick={() => setActiveTab('penalties')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs cursor-pointer hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Unresolved Penalties</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#142B4A] tabular-nums">
              {formatINR(unresolvedPenalties)}
            </span>
            <span className="text-xs text-slate-500">
              due
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium tabular-nums">
            {formatINR(totalCollected)} collected to date
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Violations & Breakdown Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Violations Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Violations Log</h2>
              <p className="text-xs text-slate-500">Latest active field citations recorded across campus</p>
            </div>
            <button
              onClick={() => setActiveTab('violations')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              View All ({violations.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Citation ID</th>
                  <th className="py-2.5 px-3">Vehicle Plate</th>
                  <th className="py-2.5 px-3">Zone & Location</th>
                  <th className="py-2.5 px-3">Offense</th>
                  <th className="py-2.5 px-3 text-right">Fine</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentViolations.map((v) => (
                  <tr 
                    key={v.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedViolationId(v.id)}
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                      {v.id}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{v.vehiclePlate}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[120px]">{v.vehicleMakeModel}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800 truncate max-w-[150px]">{v.zoneName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{v.specificLocation}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800 truncate max-w-[160px]">{v.category}</div>
                      <SeverityBadge severity={v.severity} />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatINR(v.fineAmount)}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-blue-600 group-hover:underline text-xs font-semibold">
                        Inspect
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Category Breakdown & Quick Zone Hotspots */}
        <div className="space-y-6">
          {/* Violations by Category */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Common Infraction Categories</h2>
            <p className="text-xs text-slate-500 mb-3">Campus citation frequency breakdown</p>

            <div className="space-y-3">
              {sortedCategories.map(([category, count]) => {
                const percent = Math.round((count / totalViolations) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span className="truncate pr-2">{category}</span>
                      <span className="font-mono tabular-nums text-slate-900 font-bold shrink-0">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Violations by Parking Zone */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">Enforcement Zone Activity</h2>
              <button 
                onClick={() => setActiveTab('zones')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                All Zones
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Infraction density across managed lots</p>

            <div className="space-y-2.5">
              {zoneStats.slice(0, 4).map((zone) => (
                <div 
                  key={zone.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-800 truncate">{zone.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                      <span>{zone.code}</span>
                      <span>·</span>
                      <span>Occupancy: {zone.utilizationPercent}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-800">
                      {zone.violationCount} violations
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Case Status Pipeline Summary Strip */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Citation Lifecycle & Resolution Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div 
              key={status}
              onClick={() => setActiveTab('violations')}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-600 truncate">{status}</div>
              <div className="text-lg font-black font-mono text-slate-900 tabular-nums mt-0.5">
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
