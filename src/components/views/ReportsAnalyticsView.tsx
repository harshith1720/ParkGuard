import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Filter, 
  Calendar, 
  Download, 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { formatINR } from '../../utils/formatters';

export const ReportsAnalyticsView: React.FC = () => {
  const { violations, zones, exportViolationsCSV, getAllVehicleProfiles } = useParking();

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d'>('all');

  // Filtered dataset
  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      if (selectedZone !== 'all' && v.zoneId !== selectedZone) return false;
      if (dateRange !== 'all') {
        const violationDate = new Date(v.timestamp);
        const days = dateRange === '7d' ? 7 : 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (violationDate < cutoff) return false;
      }
      return true;
    });
  }, [violations, selectedZone, dateRange]);

  const total = filteredViolations.length || 1;
  const resolvedCount = filteredViolations.filter(v => ['Paid', 'Resolved'].includes(v.status)).length;
  const resolutionRate = Math.round((resolvedCount / total) * 100);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  filteredViolations.forEach(v => {
    categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1;
  });
  const categoryList = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Zone counts
  const zoneCounts: Record<string, number> = {};
  filteredViolations.forEach(v => {
    zoneCounts[v.zoneName] = (zoneCounts[v.zoneName] || 0) + 1;
  });
  const zoneList = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1]);

  // Status breakdown
  const statusCounts = {
    Reported: filteredViolations.filter(v => v.status === 'Reported').length,
    'Under Review': filteredViolations.filter(v => v.status === 'Under Review').length,
    Confirmed: filteredViolations.filter(v => v.status === 'Confirmed').length,
    'Fine Pending': filteredViolations.filter(v => v.status === 'Fine Pending').length,
    Paid: filteredViolations.filter(v => v.status === 'Paid').length,
    Appealed: filteredViolations.filter(v => v.status === 'Appealed').length,
    Resolved: filteredViolations.filter(v => v.status === 'Resolved').length,
  };

  const repeatProfiles = getAllVehicleProfiles().filter(p => p.isRepeatOffender);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Enforcement Reports & Intelligence</h2>
          <p className="text-xs text-slate-500">
            Audit campus citation trends, clearance rates, hotspot densities, and fine recovery metrics.
          </p>
        </div>

        <button
          onClick={exportViolationsCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Export Full Dataset (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter By:</span>
          </div>

          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="all">All Campus Zones</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="all">All-Time Cumulative</option>
            <option value="30d">Past 30 Days</option>
            <option value="7d">Past 7 Days</option>
          </select>
        </div>

        <div className="text-slate-500 font-mono">
          Displaying <strong>{filteredViolations.length}</strong> active citations
        </div>
      </div>

      {/* Key Metric Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Citations</span>
          <div className="text-2xl font-black font-mono text-slate-900 tabular-nums mt-1">
            {filteredViolations.length}
          </div>
          <span className="text-[11px] text-slate-400">Recorded infractions</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Case Resolution Rate</span>
          <div className="text-2xl font-black font-mono text-emerald-600 tabular-nums mt-1">
            {resolutionRate}%
          </div>
          <span className="text-[11px] text-slate-400">{resolvedCount} cases closed / settled</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">Repeat Offender Ratio</span>
          <div className="text-2xl font-black font-mono text-rose-600 tabular-nums mt-1">
            {repeatProfiles.length}
          </div>
          <span className="text-[11px] text-slate-400">Vehicles with &ge; 3 infractions</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">Assessed Revenue</span>
          <div className="text-2xl font-black font-mono text-blue-900 tabular-nums mt-1">
            {formatINR(filteredViolations.reduce((sum, v) => sum + v.fineAmount, 0))}
          </div>
          <span className="text-[11px] text-slate-400">Total penalty ledger</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation by Category Chart */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Infractions by Violation Category</h3>
            <p className="text-xs text-slate-500">Distribution of parking violations across campus</p>
          </div>

          <div className="space-y-3 pt-2">
            {categoryList.map(([cat, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 font-medium">
                    <span className="truncate pr-2">{cat}</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums shrink-0">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hotspots by Zone Chart */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Violations by Parking Zone & Hotspot</h3>
            <p className="text-xs text-slate-500">Infraction concentration across structures and lots</p>
          </div>

          <div className="space-y-3 pt-2">
            {zoneList.map(([zName, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={zName} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 font-medium">
                    <span className="truncate pr-2">{zName}</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums shrink-0">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-[#142B4A] h-2.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution vs Pending Pipeline */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Case Clearance Status Breakdown</h3>
            <p className="text-xs text-slate-500">Pending intake versus confirmed and settled infractions</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 text-xs">
                  <div className="text-slate-500 font-medium truncate">{status}</div>
                  <div className="text-lg font-black font-mono text-slate-900 tabular-nums mt-0.5">
                    {count} <span className="text-[11px] font-normal text-slate-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Enforcement Hours Timeline */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enforcement Shift Activity Profile</h3>
            <p className="text-xs text-slate-500">Hourly infraction volume distribution</p>
          </div>

          <div className="space-y-2.5 pt-2 text-xs">
            {[
              { label: '06:00 - 09:00 (Morning Commute & Early Faculty)', count: 3, percent: 35 },
              { label: '09:00 - 12:00 (Peak Morning Class Period)', count: 4, percent: 45 },
              { label: '12:00 - 15:00 (Lunch & Student Center Shift)', count: 3, percent: 35 },
              { label: '15:00 - 18:00 (Late Afternoon & Evening Lab)', count: 2, percent: 25 },
              { label: '18:00 - 06:00 (Overnight Restrictive Patrol)', count: 1, percent: 12 },
            ].map((shift) => (
              <div key={shift.label} className="space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>{shift.label}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">{shift.count} citations</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${shift.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
