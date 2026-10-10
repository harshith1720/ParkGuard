import React, { useState, useEffect, useMemo } from 'react';
import { 
  FilePlus2, 
  Car, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertOctagon, 
  Printer, 
  ExternalLink, 
  RefreshCw,
  Info,
  ChevronRight,
  ShieldCheck,
  Navigation,
  Crosshair,
  Compass,
  MapPinned,
  BadgeAlert
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
import { CitationPrintModal } from '../modals/CitationPrintModal';
import { CampusGpsMap } from '../common/CampusGpsMap';
import { formatINR, formatISTDate, calculateDistanceMeters } from '../../utils/formatters';

export const RecordViolationView: React.FC = () => {
  const { 
    zones, 
    addViolation, 
    checkDuplicateCandidates, 
    getVehicleProfile, 
    setActiveTab, 
    setSelectedViolationId,
    setSelectedVehiclePlate,
    currentUser 
  } = useParking();

  // Form states
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleState, setVehicleState] = useState('KA');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Sedan');
  const [vehicleMakeModel, setVehicleMakeModel] = useState('');
  const [zoneId, setZoneId] = useState(zones[0]?.id || 'zone-1');
  const [specificLocation, setSpecificLocation] = useState('');
  const [category, setCategory] = useState<ViolationCategory>('Unauthorized Parking in Resident / Faculty Bay');
  const [severity, setSeverity] = useState<SeverityLevel>('Medium');
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [officerBadge, setOfficerBadge] = useState(currentUser?.badgeId || 'OFF-402');
  const [officerName, setOfficerName] = useState(currentUser?.name || 'Officer Rajesh Kumar');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('/src/assets/images/parking_violation_curb_1791630912103.jpg');

  // GPS Location states
  const [gpsStatus, setGpsStatus] = useState<'IDLE' | 'LOCATING' | 'DETECTED' | 'DENIED' | 'MANUAL'>('IDLE');
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number; accuracyMeters: number; capturedAt: string } | null>(null);
  const [detectedAddress, setDetectedAddress] = useState<string>('');
  const [isManualException, setIsManualException] = useState<boolean>(false);
  const [manualReason, setManualReason] = useState<string>('');

  // Duplicate candidates
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [showDuplicateDrawer, setShowDuplicateDrawer] = useState(false);
  const [allowDuplicateSubmit, setAllowDuplicateSubmit] = useState(false);

  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedViolation, setSubmittedViolation] = useState<Violation | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Auto-fill known vehicle registry info
  useEffect(() => {
    const cleanPlate = vehiclePlate.trim().toUpperCase();
    if (KNOWN_VEHICLES_REGISTRY[cleanPlate]) {
      const info = KNOWN_VEHICLES_REGISTRY[cleanPlate];
      if (!vehicleMakeModel) setVehicleMakeModel(info.makeModel);
      if (info.type) setVehicleType(info.type);
      if (info.state) setVehicleState(info.state);
    }
  }, [vehiclePlate]);

  // Adjust default severity when category changes
  useEffect(() => {
    const defaultSev = CATEGORY_FINE_MAP[category]?.defaultSeverity;
    if (defaultSev) {
      setSeverity(defaultSev);
    }
  }, [category]);

  // Check duplicate records on input changes
  useEffect(() => {
    if (vehiclePlate.trim().length >= 3) {
      const matches = checkDuplicateCandidates(
        vehiclePlate,
        zoneId,
        category,
        new Date(timestamp).toISOString()
      );
      setDuplicates(matches);
      if (matches.length > 0 && !allowDuplicateSubmit) {
        setShowDuplicateDrawer(true);
      }
    } else {
      setDuplicates([]);
      setShowDuplicateDrawer(false);
    }
  }, [vehiclePlate, zoneId, category, timestamp]);

  const selectedZone = zones.find(z => z.id === zoneId) || zones[0];
  const baseFine = CATEGORY_FINE_MAP[category]?.fineINR || 500;
  const calculatedFine = Math.round(baseFine * (selectedZone?.fineMultiplier || 1.0));

  const zoneDistance = useMemo(() => {
    if (!gpsCoords || !selectedZone) return null;
    return calculateDistanceMeters(
      gpsCoords.latitude,
      gpsCoords.longitude,
      selectedZone.latitude,
      selectedZone.longitude
    );
  }, [gpsCoords, selectedZone]);

  const isZoneMismatch = useMemo(() => {
    if (zoneDistance === null || !selectedZone) return false;
    return zoneDistance > selectedZone.radiusMeters;
  }, [zoneDistance, selectedZone]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('DENIED');
      return;
    }

    setGpsStatus('LOCATING');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracyMeters: Math.round(pos.coords.accuracy),
          capturedAt: new Date().toISOString(),
        };
        setGpsCoords(coords);
        setGpsStatus('DETECTED');
        setIsManualException(false);

        try {
          const res = await fetch('/api/geocode/reverse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.address) {
              setDetectedAddress(data.address);
              if (!specificLocation) {
                setSpecificLocation(data.address);
              }
            }
          }
        } catch {
          // ignore network glitch
        }
      },
      (err) => {
        console.warn('GPS location request denied or timed out:', err);
        setGpsStatus('DENIED');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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
    if (!zoneId) newErrors.zoneId = 'Parking zone selection is required';
    if (!specificLocation.trim()) newErrors.specificLocation = 'Specific location or bay is required';
    if (!category) newErrors.category = 'Violation category is required';
    if (!officerName.trim()) newErrors.officerName = 'Issuing officer name is required';
    if (!notes.trim()) newErrors.notes = 'Officer field observation notes are required';
    if (isManualException && !manualReason.trim()) {
      newErrors.manualReason = 'Please provide mandatory reason for bypassing GPS location';
    }

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
      vehicleMakeModel: vehicleMakeModel.trim() || 'Unspecified Vehicle',
      zoneId,
      specificLocation: specificLocation.trim(),
      category,
      severity,
      timestamp: new Date(timestamp).toISOString(),
      officerBadge,
      officerName,
      notes: notes.trim(),
      photoUrl,
      isDuplicateFlagged: duplicates.length > 0,
      linkedDuplicateId: duplicates[0]?.existingViolation.id,
      locationMode: isManualException ? 'MANUAL_EXCEPTION' : (gpsCoords ? 'GPS_CAPTURED' : 'MANUAL_EXCEPTION'),
      gpsCoordinates: !isManualException && gpsCoords ? gpsCoords : undefined,
      gpsAddress: detectedAddress || undefined,
      manualExceptionReason: isManualException ? manualReason || 'GPS signal unavailable' : undefined,
      zoneMismatchFlag: isZoneMismatch,
      zoneMismatchDetails: isZoneMismatch && zoneDistance !== null ? `Officer device at ${zoneDistance}m from ${selectedZone.name} focal center (Allowed zone radius: ${selectedZone.radiusMeters}m)` : undefined,
    });

    setSubmittedViolation(created);
  };

  const handleResetForm = () => {
    setSubmittedViolation(null);
    setVehiclePlate('');
    setVehicleMakeModel('');
    setSpecificLocation('');
    setNotes('');
    setDuplicates([]);
    setShowDuplicateDrawer(false);
    setAllowDuplicateSubmit(false);
    setErrors({});
  };

  // If successfully submitted, display confirmation screen
  if (submittedViolation) {
    const vehicleProf = getVehicleProfile(submittedViolation.vehiclePlate);

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 md:p-8 shadow-xs text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            Violation Successfully Registered
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Citation ID: <span className="font-mono text-blue-600">{submittedViolation.id}</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Citation recorded in local enforcement database. Record is placed under <strong>Reported</strong> status for supervisor validation and fine processing.
          </p>

          {/* Details Card */}
          <div className="my-6 bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs max-w-lg mx-auto space-y-2.5">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">License Plate:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {submittedViolation.vehiclePlate} ({submittedViolation.vehicleState})
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Offense Charged:</span>
              <span className="font-semibold text-slate-800">{submittedViolation.category}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Zone & Bay:</span>
              <span className="text-slate-800">{submittedViolation.zoneName} · {submittedViolation.specificLocation}</span>
            </div>
            {submittedViolation.gpsCoordinates && (
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">GPS Evidence Stamp:</span>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                  {submittedViolation.gpsCoordinates.latitude.toFixed(4)}°N, {submittedViolation.gpsCoordinates.longitude.toFixed(4)}°E (±{submittedViolation.gpsCoordinates.accuracyMeters}m)
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Applicable Regulation:</span>
              <span className="text-[11px] text-slate-700 font-medium">{submittedViolation.applicableRule}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Assessed Penalty:</span>
              <span className="font-mono font-black text-blue-700 text-base tabular-nums">
                {formatINR(submittedViolation.fineAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Issuing Officer:</span>
              <span className="text-slate-800">{submittedViolation.officerName} ({submittedViolation.officerBadge})</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Vehicle Repeat Status:</span>
              <span className={`font-semibold ${vehicleProf?.isRepeatOffender ? 'text-rose-600' : 'text-slate-700'}`}>
                {vehicleProf?.totalViolations} Citations on Record {vehicleProf?.isRepeatOffender ? '(Repeat Offender ⚠️)' : ''}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#142B4A] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print Official Citation
            </button>
            <button
              onClick={() => {
                setSelectedViolationId(submittedViolation.id);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Inspect Case File
            </button>
            <button
              onClick={() => {
                setSelectedVehiclePlate(submittedViolation.vehiclePlate);
                setActiveTab('vehicles');
              }}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
            >
              View Vehicle History
            </button>
            <button
              onClick={handleResetForm}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
            >
              Record Another Citation
            </button>
          </div>
        </div>

        {showPrintModal && (
          <CitationPrintModal
            violation={submittedViolation}
            onClose={() => setShowPrintModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">New Parking Citation Intake</h2>
          <p className="text-xs text-slate-500">
            Log physical or camera-verified infractions with automatic duplicate check and fine appraisal.
          </p>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Officer: <strong>{officerName}</strong></span>
        </div>
      </div>

      {/* Duplicate Warning Callout if matches exist */}
      {duplicates.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  Possible Duplicate Record Detected ({duplicates.length} match found)
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Vehicle <strong className="font-mono">{vehiclePlate.toUpperCase()}</strong> matches an existing active citation in our database. Review prior report details below before issuing a duplicate charge.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDuplicateDrawer(!showDuplicateDrawer)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shrink-0"
            >
              {showDuplicateDrawer ? 'Hide Comparison' : 'Review Match'}
            </button>
          </div>

          {/* Drawer comparing candidate */}
          {showDuplicateDrawer && (
            <div className="mt-4 pt-3 border-t border-amber-200/80 space-y-3">
              {duplicates.map((dup, index) => (
                <div key={index} className="bg-white/90 border border-amber-200 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      Existing Case: {dup.existingViolation.id}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold text-[11px]">
                      {dup.matchScore}% Similarity Match
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                    <div><strong>Zone:</strong> {dup.existingViolation.zoneName}</div>
                    <div><strong>Location:</strong> {dup.existingViolation.specificLocation}</div>
                    <div><strong>Reported:</strong> {new Date(dup.existingViolation.timestamp).toLocaleString()}</div>
                    <div><strong>Status:</strong> {dup.existingViolation.status}</div>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    <strong>Match Factors:</strong> {dup.reasons.join(' · ')}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedViolationId(dup.existingViolation.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                    >
                      Inspect Existing Citation File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAllowDuplicateSubmit(true);
                        setShowDuplicateDrawer(false);
                      }}
                      className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded text-[11px] font-semibold"
                    >
                      Confirm New Independent Violation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-6">
        {/* Section 1: Vehicle Information */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Car className="w-4 h-4 text-[#F97316]" />
            1. Vehicle Identification & Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                License Plate Number *
              </label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="e.g. 7RJK429"
                className={`w-full px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] ${
                  errors.vehiclePlate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.vehiclePlate && (
                <span className="text-[11px] text-rose-600 mt-0.5 block">{errors.vehiclePlate}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issuing State / Jurisdiction
              </label>
              <input
                type="text"
                value={vehicleState}
                onChange={(e) => setVehicleState(e.target.value.toUpperCase())}
                placeholder="CA"
                maxLength={3}
                className="w-full px-3 py-2 text-xs font-mono font-semibold uppercase border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Classification
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316] bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Make, Model & Color Description
              </label>
              <input
                type="text"
                value={vehicleMakeModel}
                onChange={(e) => setVehicleMakeModel(e.target.value)}
                placeholder="e.g. Subaru Legacy (Silver metallic)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Zone & Location with GPS Detection */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F97316]" />
              2. Enforcement Location & GPS Detection
            </h3>

            {/* Prominent Detect My Location Action */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={gpsStatus === 'LOCATING'}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <Navigation className={`w-3.5 h-3.5 text-white ${gpsStatus === 'LOCATING' ? 'animate-spin' : ''}`} />
              {gpsStatus === 'LOCATING' ? 'Detecting Coordinates...' : 'Detect My Location (GPS)'}
            </button>
          </div>

          {/* GPS Status & Live Telemetry Banner */}
          {gpsCoords && !isManualException && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <Crosshair className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>GPS Fix Captured (High Accuracy):</span>
                  <span className="font-mono text-emerald-800">
                    {gpsCoords.latitude.toFixed(5)}°N, {gpsCoords.longitude.toFixed(5)}°E
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-semibold font-mono">
                    ±{gpsCoords.accuracyMeters}m Accuracy
                  </span>
                </div>

                <span className="text-[10px] text-emerald-700 font-mono">
                  Stamped: {formatISTDate(gpsCoords.capturedAt)}
                </span>
              </div>

              {detectedAddress && (
                <div className="text-[11px] text-emerald-950 flex items-start gap-1.5">
                  <MapPinned className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Geocoded Landmark:</strong> {detectedAddress}</span>
                </div>
              )}

              {/* Zone Geofence Proximity Check */}
              {zoneDistance !== null && (
                <div className="pt-1.5 border-t border-emerald-200/80 flex items-center justify-between text-[11px]">
                  <span>
                    Distance from selected <strong>{selectedZone.name}</strong> center: <strong className="font-mono">{zoneDistance}m</strong>
                  </span>
                  {isZoneMismatch ? (
                    <span className="text-amber-800 bg-amber-100 font-semibold px-2 py-0.5 rounded border border-amber-300">
                      ⚠️ Zone Boundary Warning (&gt;{selectedZone.radiusMeters}m radius)
                    </span>
                  ) : (
                    <span className="text-emerald-800 bg-emerald-200/60 font-semibold px-2 py-0.5 rounded">
                      ✓ Inside Authorized Zone Boundary (Radius: {selectedZone.radiusMeters}m)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Interactive Campus GPS & Geofence Map Preview */}
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <div className="px-3 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                Campus Geofence & GPS Map Preview
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                {gpsCoords && !isManualException ? `Captured GPS Fix (±${gpsCoords.accuracyMeters}m)` : `${selectedZone.name} Focal Zone`}
              </span>
            </div>
            <CampusGpsMap
              gpsCoords={!isManualException ? gpsCoords : null}
              selectedZone={selectedZone}
              allZones={zones}
              height="240px"
            />
          </div>

          {gpsStatus === 'DENIED' && !isManualException && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgeAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>GPS permission denied or indoor signal obstructed. Please enter location manually or enable location permission.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsManualException(true)}
                className="text-[11px] underline font-bold text-amber-900"
              >
                Log Manual Location Exception
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enforcement Zone *
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316] bg-white"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.code}) — {z.fineMultiplier}x Rate
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Bay / Landmark / Stall *
              </label>
              <input
                type="text"
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                placeholder="e.g. Bay 42, Opposite Campus Union Hydrant #4"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-[#F97316] ${
                  errors.specificLocation ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.specificLocation && (
                <span className="text-[11px] text-rose-600 mt-0.5 block">{errors.specificLocation}</span>
              )}
            </div>
          </div>

          {/* Manual GPS Exception Toggle */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isManualException}
                onChange={(e) => setIsManualException(e.target.checked)}
                className="rounded border-slate-300 text-[#F97316] focus:ring-[#F97316]"
              />
              <span className="font-medium">
                Record as Manual Location Exception (Basement garage, satellite obstruction, or device offline)
              </span>
            </label>

            {isManualException && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exception Justification / Reason *
                </label>
                <input
                  type="text"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g. Underground MLCP Level B2 - Concrete slab ceiling blocked GPS reception"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-[#F97316]"
                />
                {errors.manualReason && (
                  <span className="text-[11px] text-rose-600 mt-0.5 block">{errors.manualReason}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Infraction Category & Severity */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#F97316]" />
            3. Violation Charge & Penalty Appraisal (INR)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Violation Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ViolationCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316] bg-white"
              >
                {Object.keys(CATEGORY_FINE_MAP).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} (Base: ₹{CATEGORY_FINE_MAP[cat as ViolationCategory].fineINR})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Authority Rule: <strong className="text-slate-700">{CATEGORY_FINE_MAP[category]?.ruleCode}</strong> — {CATEGORY_FINE_MAP[category]?.ruleDescription}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316] bg-white"
              >
                <option value="Low">Low Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="High">High Severity</option>
                <option value="Critical">Critical Severity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Violation Timestamp
              </label>
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316]"
              />
            </div>

            {/* Calculated Fine Display Card */}
            <div className="sm:col-span-2 bg-orange-50/80 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#9A3412] block">Assessed Penalty Appraisal</span>
                <span className="text-[11px] text-slate-600">
                  Base ₹{baseFine} × {selectedZone?.fineMultiplier}x zone multiplier
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-mono text-[#9A3412] tabular-nums">
                  {formatINR(calculatedFine)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Photo Evidence */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#F97316]" />
            4. Photo Evidence Documentation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            {/* Photo preview */}
            <div className="aspect-4/3 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 relative group">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Evidence preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4">
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-[11px]">No photo attached</span>
                </div>
              )}
              {photoUrl && (
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                  Attached Evidence
                </div>
              )}
            </div>

            {/* Upload or Preset selector */}
            <div className="sm:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Photo from Camera / Device
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#9A3412] hover:file:bg-orange-100 text-slate-600 cursor-pointer"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Or select test evidence image:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Red Curb Hydrant', url: '/src/assets/images/parking_violation_curb_1791630912103.jpg' },
                    { label: 'Faculty Bay Lines', url: '/src/assets/images/parking_violation_bay_1791630926958.jpg' },
                    { label: 'Parking Structure', url: '/src/assets/images/campus_parking_deck_1791630942171.jpg' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPhotoUrl(preset.url)}
                      className={`p-2 rounded border text-left text-[11px] font-medium transition-all ${
                        photoUrl === preset.url
                          ? 'border-[#F97316] bg-orange-50 text-orange-950 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Officer Observation Notes */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            5. Officer Notes & Enforcement Authentication
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Citing Officer Name *
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Badge / Patrol ID
              </label>
              <input
                type="text"
                value={officerBadge}
                onChange={(e) => setOfficerBadge(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Notes & Evidence Description *
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record exact vehicle position, visible decals, driver interactions, and towing or immobilization warnings issued..."
              className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.notes ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.notes && (
              <span className="text-[11px] text-rose-600 mt-0.5 block">{errors.notes}</span>
            )}
          </div>
        </div>

        {/* Form Submit & Clear Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetForm}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          >
            Clear Form
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-xs md:text-sm font-semibold shadow-xs transition-colors"
          >
            <FilePlus2 className="w-4 h-4" />
            Issue Violation & Generate Citation
          </button>
        </div>
      </form>
    </div>
  );
};
