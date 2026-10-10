import React, { useState } from 'react';
import { 
  Car, 
  ShieldAlert, 
  CreditCard, 
  MessageSquare, 
  Camera, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  ExternalLink,
  Printer,
  Receipt,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { StatusBadge, SeverityBadge } from '../common/StatusBadge';
import { PaymentModal } from '../modals/PaymentModal';
import { AppealModal } from '../modals/AppealModal';
import { CitationPrintModal } from '../modals/CitationPrintModal';
import { Violation } from '../../types';
import { formatINR, formatISTDate, formatISTDateOnly } from '../../utils/formatters';

export const OwnerPortal: React.FC = () => {
  const { 
    currentUser, 
    violations, 
    getVehicleProfile, 
    registerVehicleToCurrentOwner 
  } = useParking();

  const [selectedViolationForPay, setSelectedViolationForPay] = useState<Violation | null>(null);
  const [selectedViolationForAppeal, setSelectedViolationForAppeal] = useState<Violation | null>(null);
  const [selectedViolationForPrint, setSelectedViolationForPrint] = useState<Violation | null>(null);

  // New vehicle registration form
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');

  const registeredPlates = currentUser?.registeredPlates || [];
  
  // Scoped violations for this owner (ensuring privacy isolation)
  const myViolations = violations;

  const unpaidFines = myViolations
    .filter(v => ['Confirmed', 'Fine Pending', 'Reported', 'Under Review'].includes(v.status))
    .reduce((sum, v) => sum + v.fineAmount, 0);

  const pendingAppeals = myViolations.filter(v => v.status === 'Appealed').length;
  const resolvedCount = myViolations.filter(v => ['Paid', 'Resolved'].includes(v.status)).length;

  // Check if owner is nearing repeat offender threshold
  const totalMyViolations = myViolations.length;
  const isNearRepeat = totalMyViolations >= 2 && totalMyViolations < 3;
  const isRepeat = totalMyViolations >= 3;

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) return;
    registerVehicleToCurrentOwner(newPlate, newModel || 'Vehicle');
    setShowAddVehicle(false);
    setNewPlate('');
    setNewModel('');
  };

  return (
    <div className="space-y-6">
      {/* Top Greeting & Scope Indicator */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold text-base shadow-xs">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900">
                Welcome, {currentUser?.name}
              </h2>
              <span className="text-[10px] bg-orange-50 text-[#9A3412] font-bold px-2 py-0.5 rounded border border-orange-200 uppercase">
                Vehicle Owner Portal
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Account ID: <span className="font-mono">{currentUser?.studentOrEmployeeId || 'STU-ACTIVE'}</span> · Email: {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddVehicle(!showAddVehicle)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-orange-50 hover:text-[#9A3412] text-stone-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Register Another Vehicle
          </button>
        </div>
      </div>

      {/* Add Vehicle Drawer */}
      {showAddVehicle && (
        <form onSubmit={handleAddVehicleSubmit} className="bg-orange-50/40 border border-orange-200/80 rounded-xl p-4 text-xs space-y-3 animate-in fade-in">
          <div className="font-bold text-stone-900">Add Vehicle to My Account Profile</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-600 mb-1 font-semibold">License Plate *</label>
              <input
                type="text"
                required
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                placeholder="e.g. 7XYZ999"
                className="w-full px-3 py-1.5 font-mono uppercase bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Make / Model / Color</label>
              <input
                type="text"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                placeholder="e.g. Toyota Corolla (White)"
                className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddVehicle(false)}
              className="px-3 py-1 text-stone-500 hover:text-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 bg-[#F97316] hover:bg-[#EA580C] text-white rounded font-semibold transition-colors shadow-xs"
            >
              Save Vehicle
            </button>
          </div>
        </form>
      )}

      {/* Repeat Offender Advisory Banner */}
      {isRepeat && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-900">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-950">
              URGENT ADVISORY: Repeat Offender Threshold Reached ({totalMyViolations} Citations)
            </h4>
            <p className="text-rose-800 leading-relaxed">
              Your vehicle has accumulated 3 or more documented campus parking violations. Any additional infraction or unpaid balance &gt;₹2,500 authorizes campus security to apply a wheel clamp (boot) or execute impound towing. Please settle outstanding balances or contact the Parking Office immediately.
            </p>
          </div>
        </div>
      )}

      {isNearRepeat && !isRepeat && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-amber-950">
              Compliance Warning: {totalMyViolations} Active Citations on Record
            </h4>
            <p className="text-amber-800">
              A 3rd parking violation will classify your vehicle as a Repeat Offender with escalated fine schedules and immobilization risk.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            My Registered Vehicles
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              {registeredPlates.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
            {registeredPlates.join(', ') || 'No plates'}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
            Outstanding Penalties Due
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-rose-600 tabular-nums">
              {formatINR(unpaidFines)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Due within 14 calendar days
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
            Appeals Under Review
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-purple-700 tabular-nums">
              {pendingAppeals}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Awaiting supervisor adjudication
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Settled / Resolved
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-600 tabular-nums">
              {resolvedCount}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Completed citations
          </span>
        </div>
      </div>

      {/* Citations List Section */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              My Citations & Infraction Records
            </h3>
            <p className="text-xs text-slate-500">
              Private records matching verified license plates {registeredPlates.map(p => `"${p}"`).join(', ')}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {myViolations.length} records
          </span>
        </div>

        {myViolations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-800">No Violations Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your registered vehicle(s) ({registeredPlates.join(', ')}) currently have a completely clean enforcement record.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myViolations.map((v) => {
              const isUnpaid = ['Confirmed', 'Fine Pending', 'Reported', 'Under Review'].includes(v.status);
              const dueDate = new Date(new Date(v.timestamp).getTime() + 14 * 24 * 60 * 60 * 1000);

              return (
                <div key={v.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-4">
                  {/* Top Bar of Citation Card */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">{v.id}</span>
                        <StatusBadge status={v.status} />
                        <SeverityBadge severity={v.severity} />
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                          {v.vehiclePlate}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{v.category}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Location: <strong className="text-slate-700">{v.zoneName}</strong> ({v.specificLocation})
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Fine Amount</span>
                      <div className="text-xl font-black font-mono text-slate-900 tabular-nums">
                        {formatINR(v.fineAmount)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {v.status === 'Paid' ? (
                          <span className="text-emerald-600 font-semibold">Settled</span>
                        ) : (
                          <span>Due by {formatISTDateOnly(dueDate.toISOString())}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Evidence & Details Split */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 text-xs">
                    {/* Photo thumbnail */}
                    <div>
                      <span className="text-[11px] font-bold text-stone-700 block mb-1.5 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-[#F97316]" />
                        Officer Evidence Photo
                      </span>
                      <div className="aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative group">
                        {v.photoUrl ? (
                          <img
                            src={v.photoUrl}
                            alt={`Photo evidence for citation ${v.id}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setSelectedViolationForPrint(v)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            No photo
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Officer notes & timestamp */}
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-200/60">
                        <span>Issued: <strong>{formatISTDate(v.timestamp)}</strong></span>
                        <span>Officer: <strong>{v.officerName} ({v.officerBadge})</strong></span>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-600">Officer Observation:</span>
                        <p className="text-slate-700 italic mt-0.5">
                          "{v.notes || 'Routine campus parking patrol inspection.'}"
                        </p>
                      </div>

                      {/* Appeal details if present */}
                      {v.appeal && (
                        <div className="p-2.5 rounded bg-purple-50 border border-purple-200 space-y-1">
                          <div className="flex justify-between font-bold text-purple-900">
                            <span>Appeal Status: {v.appeal.status}</span>
                            <span className="font-mono text-[10px] text-purple-700">
                              Filed {formatISTDate(v.appeal.appealedAt)}
                            </span>
                          </div>
                          <p className="text-purple-800">Statement: "{v.appeal.reason}"</p>
                          {v.appeal.responseNotes && (
                            <div className="pt-1 text-[11px] text-slate-700 border-t border-purple-200/60">
                              <strong>Supervisor Response:</strong> {v.appeal.responseNotes}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payment details if paid */}
                      {v.payment && (
                        <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex justify-between">
                          <span>Paid: <strong>{formatINR(v.payment.amountRupees || (v.payment.amountPaise / 100))}</strong> via {v.payment.paymentMethod}</span>
                          <span className="font-mono">Receipt #{v.payment.receiptNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setSelectedViolationForPrint(v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      View Official Notice PDF
                    </button>

                    <div className="flex items-center gap-2 ml-auto">
                      {/* Appeal button */}
                      {v.status !== 'Paid' && v.status !== 'Resolved' && !v.appeal && (
                        <button
                          onClick={() => setSelectedViolationForAppeal(v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          File Appeal / Dispute
                        </button>
                      )}

                      {/* Pay button */}
                      {isUnpaid && (
                        <button
                          onClick={() => setSelectedViolationForPay(v)}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Fine ({formatINR(v.fineAmount)})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Privacy Notice Box */}
      <div className="p-4 bg-stone-100/90 border border-stone-200/60 rounded-xl text-xs text-stone-500 space-y-1">
        <div className="font-semibold text-stone-700 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#9A3412]" />
          Vehicle Owner Privacy & Security Policy
        </div>
        <p className="text-[11px] leading-relaxed">
          In compliance with FERPA and campus data governance standards, your records are strictly confidential and mapped only to your authenticated credentials. You cannot view other individuals' vehicles, alter confirmed violation records, or access campus security logs.
        </p>
      </div>

      {/* Modals */}
      {selectedViolationForPay && (
        <PaymentModal
          violation={selectedViolationForPay}
          onClose={() => setSelectedViolationForPay(null)}
        />
      )}

      {selectedViolationForAppeal && (
        <AppealModal
          violation={selectedViolationForAppeal}
          onClose={() => setSelectedViolationForAppeal(null)}
        />
      )}

      {selectedViolationForPrint && (
        <CitationPrintModal
          violation={selectedViolationForPrint}
          onClose={() => setSelectedViolationForPrint(null)}
        />
      )}
    </div>
  );
};
