import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Car, 
  ShieldAlert, 
  Receipt, 
  FileSpreadsheet, 
  AlertTriangle,
  Lock,
  ExternalLink,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { formatINR, formatISTDateOnly } from '../../utils/formatters';

export const RepeatOffendersView: React.FC = () => {
  const { 
    getAllVehicleProfiles, 
    setSelectedVehiclePlate, 
    setActiveTab 
  } = useParking();

  const [bootNoticePlate, setBootNoticePlate] = useState<string | null>(null);
  const vehicleProfiles = getAllVehicleProfiles();
  const repeatOffenders = vehicleProfiles.filter(p => p.isRepeatOffender);

  const handleInspect = (plate: string) => {
    setSelectedVehiclePlate(plate);
    setActiveTab('vehicles');
  };

  const handleDispatchBoot = (plate: string) => {
    setBootNoticePlate(plate);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Repeat Offenders Watchlist</h2>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded">
              High Priority Enforcement
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Vehicles with 3+ documented citations or chronic delinquent parking penalties.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Watchlist Threshold: <strong>&ge; 3 Violations</strong> · Boot Trigger: <strong>&ge; 4 Citations / &gt;₹5,000 Unpaid</strong>
        </div>
      </div>

      {/* Security Dispatch Notice Modal Simulation */}
      {bootNoticePlate && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-700" />
              Immobilization / Wheel Clamp Dispatch Order Logged for Vehicle {bootNoticePlate}
            </span>
            <button
              onClick={() => setBootNoticePlate(null)}
              className="text-xs text-rose-700 hover:text-rose-900 font-bold"
            >
              Dismiss Notice
            </button>
          </div>
          <p className="text-rose-800 leading-relaxed">
            Patrol unit dispatched with boot device #B-104. Vehicle operator must clear outstanding penalties at the Bursar or Parking Office to authorize device release.
          </p>
        </div>
      )}

      {/* Repeat Offenders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {repeatOffenders.map((offender) => {
          return (
            <div 
              key={offender.plate}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xl font-black text-slate-900 tracking-wider">
                        {offender.plate}
                      </span>
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                        {offender.state}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-700 mt-1">
                      {offender.makeModel}
                    </div>
                  </div>

                  {offender.bootTowEligible ? (
                    <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] uppercase rounded tracking-wider">
                      Tow / Boot Eligible
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold text-[10px] uppercase rounded">
                      Probationary
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 mt-2">
                  Owner: <strong>{offender.ownerName}</strong> ({offender.ownerType})
                  {offender.permitNumber && (
                    <div className="font-mono text-[11px] text-slate-400">Permit: {offender.permitNumber}</div>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Citations</span>
                    <span className="text-lg font-black font-mono text-slate-900 tabular-nums">
                      {offender.totalViolations}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{offender.confirmedViolations} confirmed</span>
                  </div>

                  <div className="bg-rose-50/70 p-2 rounded">
                    <span className="text-[10px] text-rose-700 uppercase font-semibold block">Outstanding Fines</span>
                    <span className="text-lg font-black font-mono text-rose-700 tabular-nums">
                      {formatINR(offender.unresolvedPenalties)}
                    </span>
                    <span className="text-[10px] text-emerald-700 block">{formatINR(offender.totalFinesPaid)} settled</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 mt-3">
                  Latest Citation: <span className="font-mono">{formatISTDateOnly(offender.lastViolation)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleInspect(offender.plate)}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Dossier
                </button>

                {offender.bootTowEligible && (
                  <button
                    onClick={() => handleDispatchBoot(offender.plate)}
                    className="py-1.5 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    Dispatch Boot
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {repeatOffenders.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-800">No Repeat Offenders on Watchlist</h3>
          <p className="text-xs text-slate-500 mt-1">All campus vehicles have fewer than 3 recorded citations.</p>
        </div>
      )}
    </div>
  );
};
