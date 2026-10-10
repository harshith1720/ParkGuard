import React, { useState } from 'react';
import { 
  Car, 
  Search, 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Receipt, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  MapPin
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { StatusBadge, SeverityBadge } from '../common/StatusBadge';
import { formatINR, formatISTDateOnly } from '../../utils/formatters';

export const VehiclesView: React.FC = () => {
  const { 
    getAllVehicleProfiles, 
    violations, 
    selectedVehiclePlate, 
    setSelectedVehiclePlate, 
    setSelectedViolationId 
  } = useParking();

  const [searchPlate, setSearchPlate] = useState(selectedVehiclePlate || '');
  const vehicleProfiles = getAllVehicleProfiles();

  // Selected profile or default to first or matching search
  const activeProfile = selectedVehiclePlate 
    ? vehicleProfiles.find(p => p.plate.toUpperCase() === selectedVehiclePlate.toUpperCase()) 
    : (vehicleProfiles[0] || null);

  const vehicleViolations = activeProfile
    ? violations.filter(v => v.vehiclePlate.toUpperCase() === activeProfile.plate.toUpperCase())
    : [];

  const handleSelectVehicle = (plate: string) => {
    setSelectedVehiclePlate(plate);
    setSearchPlate(plate);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchPlate.trim().toUpperCase();
    if (!clean) return;

    setSelectedVehiclePlate(clean);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Vehicle Enforcement Registry & History</h2>
          <p className="text-xs text-slate-500">
            Audit full citation histories, distinguish confirmed infractions from under-review claims, and track repeat offenders.
          </p>
        </div>

        {/* Plate Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
              placeholder="Look up Plate (e.g. 7RJK429)..."
              className="pl-8 pr-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 w-56"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#142B4A] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Lookup
          </button>
        </form>
      </div>

      {/* Main Split: Left Sidebar of vehicles, Right Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Registered Vehicles List */}
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Active Vehicle Registry</span>
            <span className="text-[11px] text-slate-500">{vehicleProfiles.length} vehicles</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {vehicleProfiles.map((p) => {
              const isSelected = activeProfile?.plate === p.plate;
              return (
                <div
                  key={p.plate}
                  onClick={() => handleSelectVehicle(p.plate)}
                  className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-blue-50/60 border-l-3 border-blue-600' : ''
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{p.plate}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{p.state}</span>
                      {p.isRepeatOffender && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded">
                          Repeat ⚠️
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 truncate mt-0.5">{p.makeModel}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{p.ownerName}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-800 tabular-nums block">
                      {p.totalViolations} citations
                    </span>
                    {p.unresolvedPenalties > 0 && (
                      <span className="text-[11px] font-mono text-rose-600 font-semibold tabular-nums">
                        {formatINR(p.unresolvedPenalties)} due
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 cols: Selected Vehicle Dossier */}
        <div className="lg:col-span-2 space-y-6">
          {activeProfile ? (
            <>
              {/* Profile Card */}
              <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#142B4A] text-white flex items-center justify-center shrink-0">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-mono font-black text-slate-900 tracking-wider">
                          {activeProfile.plate}
                        </h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold font-mono">
                          {activeProfile.state}
                        </span>
                        {activeProfile.isRepeatOffender && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-xs font-bold flex items-center gap-1">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            Repeat Offender
                          </span>
                        )}
                        {activeProfile.bootTowEligible && (
                          <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-xs font-bold">
                            Boot / Tow Authorized
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {activeProfile.makeModel} · {activeProfile.type}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Registered To: <strong className="text-slate-800">{activeProfile.ownerName}</strong> ({activeProfile.ownerType})
                        {activeProfile.permitNumber && (
                          <span> · Permit: <span className="font-mono">{activeProfile.permitNumber}</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-center text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-500 block font-medium">Total Citations</span>
                    <span className="text-xl font-black font-mono text-slate-900 tabular-nums">
                      {activeProfile.totalViolations}
                    </span>
                  </div>

                  <div className="p-3 bg-rose-50/70 rounded-lg border border-rose-100">
                    <span className="text-[11px] text-rose-700 block font-semibold">Confirmed Violations</span>
                    <span className="text-xl font-black font-mono text-rose-700 tabular-nums">
                      {activeProfile.confirmedViolations}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-100">
                    <span className="text-[11px] text-amber-700 block font-semibold">Under Review / Pending</span>
                    <span className="text-xl font-black font-mono text-amber-700 tabular-nums">
                      {activeProfile.underReviewViolations}
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100">
                    <span className="text-[11px] text-blue-800 block font-semibold">Unresolved Fines</span>
                    <span className="text-xl font-black font-mono text-blue-900 tabular-nums">
                      {formatINR(activeProfile.unresolvedPenalties)}
                    </span>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Citation History Dossier</h4>
                    <p className="text-xs text-slate-500">
                      Chronological log of all recorded parking enforcement actions for this vehicle
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {vehicleViolations.length} records
                  </span>
                </div>

                {vehicleViolations.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No active citations recorded for vehicle {activeProfile.plate}.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicleViolations.map((v) => {
                      const isConfirmed = ['Confirmed', 'Fine Pending', 'Paid'].includes(v.status);
                      const isUnderReview = ['Reported', 'Under Review'].includes(v.status);

                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedViolationId(v.id)}
                          className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50/60 transition-all cursor-pointer group space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">{v.id}</span>
                                <StatusBadge status={v.status} />
                                {isConfirmed ? (
                                  <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
                                    Confirmed Infraction
                                  </span>
                                ) : isUnderReview ? (
                                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                                    Under Review (Unconfirmed)
                                  </span>
                                ) : null}
                              </div>
                              <h5 className="font-bold text-slate-800 text-xs mt-1">{v.category}</h5>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-base font-black font-mono text-slate-900 tabular-nums">
                                {formatINR(v.fineAmount)}
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {formatISTDateOnly(v.timestamp)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {v.zoneName} · {v.specificLocation}
                            </span>
                            <span>·</span>
                            <span>Officer: {v.officerName}</span>
                          </div>

                          {v.notes && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                              "{v.notes}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-xl p-12 text-center text-slate-400">
              <Car className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-700">No Vehicle Selected</p>
              <p className="text-xs mt-1">Select a vehicle from the directory on the left or enter a license plate above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
