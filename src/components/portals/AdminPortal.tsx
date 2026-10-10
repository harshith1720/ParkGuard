import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Users, 
  MapPin, 
  Sliders, 
  FileSpreadsheet, 
  AlertOctagon, 
  Lock, 
  History, 
  Search,
  Filter,
  Printer,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { StatusBadge, SeverityBadge } from '../common/StatusBadge';
import { CitationPrintModal } from '../modals/CitationPrintModal';
import { Violation } from '../../types';
import { formatINR, formatISTDate } from '../../utils/formatters';

export const AdminPortal: React.FC = () => {
  const { 
    currentUser, 
    allViolationsRaw, 
    updateViolationStatus, 
    resolveAppeal, 
    deleteViolation,
    zones, 
    users, 
    auditLogs, 
    getAllVehicleProfiles,
    exportViolationsCSV,
    setSelectedViolationId 
  } = useParking();

  const [activeAdminTab, setActiveAdminTab] = useState<'violations' | 'appeals' | 'offenders' | 'users' | 'audit'>('violations');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedViolationForPrint, setSelectedViolationForPrint] = useState<Violation | null>(null);

  // Adjudication state
  const [adjudicationNotes, setAdjudicationNotes] = useState('');

  // Appeals queue
  const pendingAppeals = allViolationsRaw.filter(v => v.status === 'Appealed' && v.appeal?.status === 'Pending');

  // Pending citations needing supervisor approval
  const pendingReviewCitations = allViolationsRaw.filter(v => ['Reported', 'Under Review'].includes(v.status));

  // Repeat offenders
  const vehicleProfiles = getAllVehicleProfiles();
  const repeatOffenders = vehicleProfiles.filter(p => p.isRepeatOffender);

  const filteredViolations = allViolationsRaw.filter(v => {
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        v.vehiclePlate.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Admin Banner */}
      <div className="bg-[#142B4A] text-white rounded-xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Enforcement Command & Supervisor Console
              </h2>
              <span className="text-[10px] bg-purple-500/30 text-purple-200 font-mono font-bold px-2 py-0.5 rounded border border-purple-400/30">
                Supervisor: {currentUser?.name}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Full Administrative Authority · Case Adjudication · Zone Multipliers · Audit Log
            </p>
          </div>
        </div>

        <button
          onClick={exportViolationsCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Export Complete Master CSV
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveAdminTab('violations')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs cursor-pointer hover:border-blue-400"
        >
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Citations Awaiting Review
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-600 tabular-nums">
              {pendingReviewCitations.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Needs confirmation</span>
        </div>

        <div 
          onClick={() => setActiveAdminTab('appeals')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs cursor-pointer hover:border-purple-400"
        >
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
            Pending Appeals Queue
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-purple-600 tabular-nums">
              {pendingAppeals.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Owner disputes filed</span>
        </div>

        <div 
          onClick={() => setActiveAdminTab('offenders')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs cursor-pointer hover:border-rose-400"
        >
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
            Repeat Offender Watchlist
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-rose-600 tabular-nums">
              {repeatOffenders.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">&ge; 3 infractions</span>
        </div>

        <div 
          onClick={() => setActiveAdminTab('users')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs cursor-pointer hover:border-slate-400"
        >
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Registered Users & Officers
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {users.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Active accounts</span>
        </div>
      </div>

      {/* Admin Module Sub-navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-2 overflow-x-auto pb-1">
        {[
          { id: 'violations', label: `All Citations (${allViolationsRaw.length})` },
          { id: 'appeals', label: `Appeals Adjudication (${pendingAppeals.length})` },
          { id: 'offenders', label: `Repeat Offenders (${repeatOffenders.length})` },
          { id: 'users', label: `User & Officer Directory (${users.length})` },
          { id: 'audit', label: `Security Audit Trail (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
              activeAdminTab === tab.id
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: All Citations Review & Confirmation */}
      {activeAdminTab === 'violations' && (
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plate or ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="Under Review">Under Review</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Paid">Paid</option>
                <option value="Appealed">Appealed</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Citation ID</th>
                  <th className="py-2.5 px-3">Plate</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3 text-right">Fine</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Supervisor Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredViolations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{v.id}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{v.vehiclePlate}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{v.category}</td>
                    <td className="py-2.5 px-3 text-slate-600">{v.zoneName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatINR(v.fineAmount)}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1">
                      {v.status === 'Reported' || v.status === 'Under Review' ? (
                        <>
                          <button
                            onClick={() => updateViolationStatus(v.id, 'Confirmed', 'Validated by Administrator.')}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateViolationStatus(v.id, 'Resolved', 'Dismissed by Supervisor discretion.')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                          >
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedViolationId(v.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                        >
                          Review File
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Appeals Adjudication Queue */}
      {activeAdminTab === 'appeals' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Vehicle Owner Appeals Adjudication Queue</h3>
              <p className="text-xs text-slate-500">
                Review submitted disputes, inspect original citations, and record official resolutions.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 font-mono">
              {pendingAppeals.length} disputes awaiting decision
            </span>
          </div>

          {pendingAppeals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All citation appeals have been adjudicated. Queue is clear!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAppeals.map((v) => (
                <div key={v.id} className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 text-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{v.id}</span>
                        <span className="font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                          Vehicle: {v.vehiclePlate}
                        </span>
                        <SeverityBadge severity={v.severity} />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">{v.category}</h4>
                      <div className="text-slate-500 mt-0.5">
                        Issued: {formatISTDate(v.timestamp)} at {v.zoneName}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-base font-black text-purple-900 tabular-nums">
                        {formatINR(v.fineAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-purple-200 space-y-1">
                    <span className="font-bold text-purple-900 block">Appellant's Statement:</span>
                    <p className="text-slate-700 leading-relaxed italic">
                      "{v.appeal?.reason || 'No written statement provided.'}"
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Submitted on: {v.appeal ? new Date(v.appeal.appealedAt).toLocaleString() : ''}
                    </div>
                  </div>

                  {/* Adjudication Controls */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-end">
                    <input
                      type="text"
                      placeholder="Supervisor adjudication remarks..."
                      value={adjudicationNotes}
                      onChange={(e) => setAdjudicationNotes(e.target.value)}
                      className="w-full sm:w-80 px-3 py-1.5 border border-purple-200 bg-white rounded-lg text-xs"
                    />
                    <button
                      onClick={() => {
                        resolveAppeal(v.id, 'Granted', adjudicationNotes || 'Appeal approved. Citation fine dismissed.');
                        setAdjudicationNotes('');
                      }}
                      className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                    >
                      Grant Appeal (Dismiss Fine)
                    </button>
                    <button
                      onClick={() => {
                        resolveAppeal(v.id, 'Denied', adjudicationNotes || 'Appeal reviewed and denied. Fine remains due.');
                        setAdjudicationNotes('');
                      }}
                      className="w-full sm:w-auto px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                    >
                      Deny Appeal (Enforce Fine)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Repeat Offenders */}
      {activeAdminTab === 'offenders' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Repeat Offenders Escalation</h3>
              <p className="text-xs text-slate-500">
                Vehicles meeting &ge; 3 infractions or outstanding balances &gt;₹5,000.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repeatOffenders.map((off) => (
              <div key={off.plate} className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 text-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-base font-black text-slate-900">{off.plate}</span>
                    <div className="text-slate-600 font-semibold">{off.makeModel}</div>
                    <div className="text-slate-500 text-[11px]">Owner: {off.ownerName} ({off.ownerType})</div>
                  </div>
                  {off.bootTowEligible && (
                    <span className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded text-[10px] uppercase">
                      Boot / Tow Authorized
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white p-2 rounded border border-rose-200">
                    <span className="text-slate-500 text-[10px] uppercase block">Total Citations</span>
                    <span className="text-base font-black font-mono text-slate-900">{off.totalViolations}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-rose-200">
                    <span className="text-slate-500 text-[10px] uppercase block">Outstanding Balance</span>
                    <span className="text-base font-black font-mono text-rose-600">{formatINR(off.unresolvedPenalties)}</span>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => alert(`Patrol immobilization unit dispatched with wheel lock for vehicle ${off.plate}.`)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Dispatch Immobilization Unit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: User & Officer Directory */}
      {activeAdminTab === 'users' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">User & Officer Directory</h3>
              <p className="text-xs text-slate-500">
                Managed role accounts and registered vehicles.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">ID / Badge</th>
                  <th className="py-2.5 px-3">Linked Vehicles</th>
                  <th className="py-2.5 px-3">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'OFFICER' ? 'bg-blue-100 text-blue-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {u.badgeId || u.studentOrEmployeeId || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-800">
                      {(u.registeredPlates || []).join(', ') || 'None'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Trail */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              Security Audit Trail (OWASP Traceability Compliance)
            </h3>
            <p className="text-xs text-slate-500">
              Immutable logging of citation creations, status changes, payments, and supervisor decisions.
            </p>
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                      {log.targetId}
                    </span>
                    <span className="text-slate-500">by <strong>{log.actorName}</strong> ({log.actorRole})</span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
