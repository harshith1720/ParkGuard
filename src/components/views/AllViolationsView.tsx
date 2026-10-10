import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ArrowUpDown, 
  FileText, 
  ExternalLink, 
  Download,
  Receipt,
  CheckCircle,
  PlusCircle,
  Printer
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { ViolationStatus, SeverityLevel } from '../../types';
import { StatusBadge, SeverityBadge } from '../common/StatusBadge';
import { formatINR, formatISTDate } from '../../utils/formatters';

export const AllViolationsView: React.FC = () => {
  const { 
    violations, 
    zones, 
    setSelectedViolationId, 
    setActiveTab, 
    exportViolationsCSV,
    currentUser,
    updateViolationStatus 
  } = useParking();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'timestamp' | 'fineAmount' | 'id'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      // Status filter
      if (statusFilter !== 'All' && v.status !== statusFilter) return false;
      // Zone filter
      if (zoneFilter !== 'All' && v.zoneId !== zoneFilter) return false;
      // Severity filter
      if (severityFilter !== 'All' && v.severity !== severityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesPlate = v.vehiclePlate.toLowerCase().includes(q);
        const matchesId = v.id.toLowerCase().includes(q);
        const matchesCategory = v.category.toLowerCase().includes(q);
        const matchesLocation = v.specificLocation.toLowerCase().includes(q);
        const matchesOfficer = v.officerName.toLowerCase().includes(q);
        if (!matchesPlate && !matchesId && !matchesCategory && !matchesLocation && !matchesOfficer) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'timestamp') {
        const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? -diff : diff;
      }
      if (sortField === 'fineAmount') {
        const diff = a.fineAmount - b.fineAmount;
        return sortOrder === 'desc' ? -diff : diff;
      }
      return sortOrder === 'desc' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
    });
  }, [violations, statusFilter, zoneFilter, severityFilter, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: 'timestamp' | 'fineAmount' | 'id') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const statusesList: ViolationStatus[] = [
    'Reported',
    'Under Review',
    'Confirmed',
    'Fine Pending',
    'Paid',
    'Appealed',
    'Resolved',
  ];

  return (
    <div className="space-y-5">
      {/* Top action & title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">All Citation Records</h2>
          <p className="text-xs text-slate-500">
            Search, review evidence dossiers, update case statuses, and manage citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportViolationsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setActiveTab('record')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Citation
          </button>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter plate, ID, officer..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status selector */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 font-medium"
            >
              <option value="All">All Statuses ({violations.length})</option>
              {statusesList.map(st => (
                <option key={st} value={st}>
                  {st} ({violations.filter(v => v.status === st).length})
                </option>
              ))}
            </select>
          </div>

          {/* Zone selector */}
          <div>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 font-medium"
            >
              <option value="All">All Zones</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* Severity selector */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 font-medium"
            >
              <option value="All">All Severities</option>
              <option value="Low">Low Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="High">High Severity</option>
              <option value="Critical">Critical Severity</option>
            </select>
          </div>
        </div>

        {/* Quick Segmented Status Tabs (Functional Filter Buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-100 pb-0.5 text-xs">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'All'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All ({violations.length})
          </button>
          {statusesList.map(st => {
            const count = violations.filter(v => v.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th 
                  onClick={() => toggleSort('id')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Violation ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Vehicle Plate</th>
                <th className="py-3 px-3.5">Category & Severity</th>
                <th className="py-3 px-3.5">Location</th>
                <th 
                  onClick={() => toggleSort('timestamp')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Date & Time</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('fineAmount')}
                  className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Penalty</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-600">No violations match active filters</p>
                    <p className="text-[11px] mt-1">Try clearing your search query or reset status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredViolations.map((v) => (
                  <tr 
                    key={v.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedViolationId(v.id)}
                  >
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                      {v.id}
                      {v.isDuplicateFlagged && (
                        <span className="block text-[10px] text-amber-600 font-sans font-medium">
                          ⚠️ Match Flagged
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {v.vehiclePlate} <span className="text-[11px] text-slate-500 font-normal">({v.vehicleState})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                        {v.vehicleMakeModel}
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-800 truncate max-w-[180px]">
                        {v.category}
                      </div>
                      <div className="mt-0.5">
                        <SeverityBadge severity={v.severity} />
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-medium text-slate-800 truncate max-w-[150px]">
                        {v.zoneName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {v.specificLocation}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      {formatISTDate(v.timestamp)}
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatINR(v.fineAmount)}
                    </td>

                    <td className="py-3 px-3.5">
                      <StatusBadge status={v.status} />
                    </td>

                    <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedViolationId(v.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredViolations.length} of {violations.length} total citations</span>
          <span className="font-mono tabular-nums">
            Total Filtered Value: {formatINR(filteredViolations.reduce((sum, v) => sum + v.fineAmount, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};
