import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Car, 
  Search, 
  FilePlus2, 
  AlertTriangle, 
  AlertOctagon, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Printer, 
  History,
  Info
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { 
  ViolationCategory, 
  VehicleType, 
  SeverityLevel, 
  DuplicateCandidate, 
  Violation 
} from '../../types';
import { CATEGORY_FINE_MAP, KNOWN_VEHICLES_REGISTRY } from '../../data/initialData';
import { StatusBadge, SeverityBadge } from '../common/StatusBadge';
import { CitationPrintModal } from '../modals/CitationPrintModal';
import { formatINR } from '../../utils/formatters';

export const OfficerPortal: React.FC = () => {
  const { 
    currentUser, 
    zones, 
    addViolation, 
    allViolationsRaw, 
    checkDuplicateCandidates, 
    getVehicleProfile,
    setSelectedViolationId 
  } = useParking();

  // Search / Quick Scan State
  const [lookupPlate, setLookupPlate] = useState('KA01AB1234');
  const [inspectedProfile, setInspectedProfile] = useState<any>(null);

  // Form states
  const [vehiclePlate, setVehiclePlate] = useState('KA01AB1234');
  const [vehicleState, setVehicleState] = useState('KA');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Sedan');
  const [vehicleMakeModel, setVehicleMakeModel] = useState('Honda Civic (Midnight Blue)');
  const [zoneId, setZoneId] = useState(zones[0]?.id || 'zone-1');
  const [specificLocation, setSpecificLocation] = useState('Perimeter Ring Road Red Curb Fire Line');
  const [category, setCategory] = useState<ViolationCategory>('Blocking Fire Hydrant / Emergency Evacuation Route');
  const [severity, setSeverity] = useState<SeverityLevel>('Critical');
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [officerNotes, setOfficerNotes] = useState('Vehicle unattended adjacent to emergency access curb.');
  const [photoUrl, setPhotoUrl] = useState<string>('/src/assets/images/parking_violation_curb_1791630912103.jpg');

  // Duplicate candidates
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [showDuplicateDrawer, setShowDuplicateDrawer] = useState(false);
  const [submittedViolation, setSubmittedViolation] = useState<Violation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Officer shift records
  const myShiftCitations = allViolationsRaw.filter(
    v => v.officerBadge === currentUser?.badgeId || v.reportedByOfficerId === currentUser?.id
  );

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lookupPlate.trim().toUpperCase();
    if (!clean) return;

    const profile = getVehicleProfile(clean);
    setInspectedProfile(profile || {
      plate: clean,
      totalViolations: 0,
      isRepeatOffender: false,
      makeModel: 'Unregistered / Visitor',
      ownerName: 'External Visitor',
    });

    // Also populate form
    setVehiclePlate(clean);
    if (KNOWN_VEHICLES_REGISTRY[clean]) {
      setVehicleMakeModel(KNOWN_VEHICLES_REGISTRY[clean].makeModel);
      setVehicleType(KNOWN_VEHICLES_REGISTRY[clean].type || 'Sedan');
    }

    // Check duplicates
    const matches = checkDuplicateCandidates(clean, zoneId, category, new Date().toISOString());
    setDuplicates(matches);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehiclePlate.trim()) newErrors.vehiclePlate = 'Vehicle registration number is required';
    if (!specificLocation.trim()) newErrors.specificLocation = 'Specific location is required';
    if (!officerNotes.trim()) newErrors.officerNotes = 'Officer notes are required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const created = addViolation({
      vehiclePlate: vehiclePlate.trim().toUpperCase(),
      vehicleState: vehicleState.trim().toUpperCase(),
      vehicleType,
      vehicleMakeModel: vehicleMakeModel.trim() || 'Vehicle',
      zoneId,
      specificLocation: specificLocation.trim(),
      category,
      severity,
      timestamp: new Date(timestamp).toISOString(),
      officerBadge: currentUser?.badgeId || 'OFF-402',
      officerName: currentUser?.name || 'Patrol Officer',
      notes: officerNotes.trim(),
      photoUrl,
      isDuplicateFlagged: duplicates.length > 0,
      linkedDuplicateId: duplicates[0]?.existingViolation.id,
    });

    setSubmittedViolation(created);
  };

  const vehicleProfileForCurrentForm = getVehicleProfile(vehiclePlate.trim().toUpperCase());

  return (
    <div className="space-y-6">
      {/* Top Officer Console Header */}
      <div className="bg-[#142B4A] text-white rounded-xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Officer Field Terminal · {currentUser?.name}
              </h2>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 font-mono font-bold px-2 py-0.5 rounded border border-blue-400/30">
                Badge #{currentUser?.badgeId || 'OFF-402'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Assigned Patrol Zone: <strong>{currentUser?.assignedZone || 'Campus Central & Decks'}</strong> · Shift: Active On-Duty
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-300 font-mono">
          Citations Filed This Shift: <strong className="text-white text-sm">{myShiftCitations.length}</strong>
        </div>
      </div>

      {/* Step 1: Vehicle Search / Quick Scan Section */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              1. Vehicle Lookup & Repeat Offender Scan
            </h3>
            <p className="text-xs text-slate-500">
              Query vehicle registration to verify parking permit, affiliation, and repeat offender status before citing.
            </p>
          </div>
        </div>

        <form onSubmit={handleLookup} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={lookupPlate}
            onChange={(e) => setLookupPlate(e.target.value.toUpperCase())}
            placeholder="Enter Plate (e.g. KA01AB1234)..."
            className="flex-1 px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#142B4A] hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
          >
            Scan Plate
          </button>
        </form>

        {/* Lookup Result Box */}
        {inspectedProfile && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black text-slate-900">{inspectedProfile.plate}</span>
                <span className="font-semibold text-slate-700">· {inspectedProfile.makeModel}</span>
                <span className="text-slate-500">({inspectedProfile.ownerName})</span>
              </div>

              {inspectedProfile.isRepeatOffender ? (
                <span className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  REPEAT OFFENDER ({inspectedProfile.totalViolations} Citations)
                </span>
              ) : inspectedProfile.totalViolations > 0 ? (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[11px] font-semibold">
                  Prior Citations: {inspectedProfile.totalViolations}
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-semibold">
                  Clean Record (0 Prior Citations)
                </span>
              )}
            </div>

            {inspectedProfile.bootTowEligible && (
              <div className="p-2.5 bg-rose-100 border border-rose-300 rounded text-rose-900 font-bold flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-700" />
                SECURITY ALERT: Vehicle is eligible for Immobilization (Wheel Clamp) or Tow Dispatch.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Duplicate Warning Callout if matches exist */}
      {duplicates.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 animate-in fade-in">
          <div className="flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-950">
                  DUPLICATE VIOLATION ALERT: {duplicates.length} Matching Citation(s) Found
                </h4>
                <p className="text-amber-800 mt-0.5">
                  Vehicle <strong className="font-mono">{vehiclePlate}</strong> already has an active citation logged in this timeframe/location.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDuplicateDrawer(!showDuplicateDrawer)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shrink-0"
            >
              {showDuplicateDrawer ? 'Hide Details' : 'Compare Match'}
            </button>
          </div>

          {showDuplicateDrawer && (
            <div className="mt-3 pt-3 border-t border-amber-200 space-y-2 text-xs">
              {duplicates.map((dup, i) => (
                <div key={i} className="bg-white p-3 rounded border border-amber-200">
                  <div className="flex justify-between font-mono font-bold text-slate-800">
                    <span>Existing ID: {dup.existingViolation.id}</span>
                    <span className="text-amber-700">{dup.matchScore}% Similarity</span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-1">
                    Logged: {new Date(dup.existingViolation.timestamp).toLocaleString()} · Zone: {dup.existingViolation.zoneName} · Status: {dup.existingViolation.status}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Factors: {dup.reasons.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submission Confirmation Banner */}
      {submittedViolation && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 text-xs text-emerald-900 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-base font-bold text-emerald-950">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            Violation Recorded: Citation #{submittedViolation.id}
          </div>
          <p className="text-emerald-800">
            Vehicle <strong className="font-mono">{submittedViolation.vehiclePlate}</strong> cited for <strong>{submittedViolation.category}</strong>. Placed under status <strong>Reported</strong> for supervisor review.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-1.5 bg-[#142B4A] text-white rounded font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Windshield Notice
            </button>
            <button
              onClick={() => setSubmittedViolation(null)}
              className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded font-semibold"
            >
              Issue Another Citation
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Record Violation Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FilePlus2 className="w-4 h-4 text-blue-600" />
            2. Record Infraction & Evidentiary Dossier
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete required infraction details. Fines are calculated automatically by campus regulations.
          </p>
        </div>

        {/* Repeat offender warning in form if relevant */}
        {vehicleProfileForCurrentForm?.isRepeatOffender && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-center gap-2 font-semibold">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>REPEAT OFFENDER WARNING: Vehicle has {vehicleProfileForCurrentForm.totalViolations} prior citations on record.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vehicle License Plate *</label>
            <input
              type="text"
              required
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
              placeholder="e.g. KA01AB1234"
              className="w-full px-3 py-2 font-mono font-bold uppercase border border-slate-300 rounded-lg"
            />
            {errors.vehiclePlate && <span className="text-rose-600 text-[11px]">{errors.vehiclePlate}</span>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">State / Jurisdiction</label>
            <input
              type="text"
              value={vehicleState}
              onChange={(e) => setVehicleState(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 font-mono uppercase border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vehicle Classification</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Pickup Truck">Pickup Truck</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Delivery Van">Delivery Van</option>
              <option value="Electric Vehicle (EV)">Electric Vehicle (EV)</option>
              <option value="Hatchback / Compact">Hatchback / Compact</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">Make / Model / Color</label>
            <input
              type="text"
              value={vehicleMakeModel}
              onChange={(e) => setVehicleMakeModel(e.target.value)}
              placeholder="e.g. Honda Civic (Midnight Blue)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        {/* Location & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Enforcement Zone *</label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name} ({z.fineMultiplier}x Fine)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Specific Location / Bay / Curb *</label>
            <input
              type="text"
              required
              value={specificLocation}
              onChange={(e) => setSpecificLocation(e.target.value)}
              placeholder="e.g. Science Quad Red Curb Fire Line"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            {errors.specificLocation && <span className="text-rose-600 text-[11px]">{errors.specificLocation}</span>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Violation Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              {Object.keys(CATEGORY_FINE_MAP).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Severity Rating</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Photographic Evidence */}
        <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
          <label className="block font-semibold text-slate-700">Photo Evidence Capture / Upload</label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-32 h-24 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt="Evidence" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No Photo</div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 font-medium"
              />
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-500">Quick presets:</span>
                <button
                  type="button"
                  onClick={() => setPhotoUrl('/src/assets/images/parking_violation_curb_1791630912103.jpg')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Red Curb
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoUrl('/src/assets/images/parking_violation_bay_1791630926958.jpg')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700"
                >
                  Faculty Bay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Officer Notes */}
        <div className="pt-4 border-t border-slate-100 text-xs">
          <label className="block font-semibold text-slate-700 mb-1">Patrol Officer Field Notes *</label>
          <textarea
            required
            rows={2}
            value={officerNotes}
            onChange={(e) => setOfficerNotes(e.target.value)}
            placeholder="Document vehicle positioning, safety obstruction, or towing warning placed on windshield..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          {errors.officerNotes && <span className="text-rose-600 text-[11px]">{errors.officerNotes}</span>}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-2"
          >
            <FilePlus2 className="w-4 h-4" />
            Submit Citation for Supervisor Review
          </button>
        </div>
      </form>

      {/* Step 3: My Shift Citations Log */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              3. My Field Patrol Log (Badge #{currentUser?.badgeId})
            </h3>
            <p className="text-xs text-slate-500">
              Live record of citations filed during this shift.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {myShiftCitations.length} recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Citation ID</th>
                <th className="py-2.5 px-3">Vehicle Plate</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-right">Fine</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myShiftCitations.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{v.id}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{v.vehiclePlate}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{v.category}</td>
                  <td className="py-2.5 px-3 text-slate-600">{v.specificLocation}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatINR(v.fineAmount)}
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officer Least-Privilege Policy Box */}
      <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-500 space-y-1">
        <div className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600" />
          Enforcement Officer Authorization Limits (OWASP Principle of Least Privilege)
        </div>
        <p className="text-[11px] leading-relaxed">
          Officers create and document field infractions. In accordance with anti-corruption and due process protocols, officers cannot dismiss confirmed violations, alter penalty multipliers, or adjudicate appeals on citations they have issued.
        </p>
      </div>

      {showPrintModal && submittedViolation && (
        <CitationPrintModal
          violation={submittedViolation}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
