import React, { useState } from 'react';
import { 
  X, 
  Car, 
  MapPin, 
  Calendar, 
  Clock, 
  Shield, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Receipt, 
  Printer, 
  ExternalLink,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { ViolationStatus } from '../../types';
import { StatusBadge, SeverityBadge } from '../common/StatusBadge';
import { PaymentModal } from './PaymentModal';
import { CitationPrintModal } from './CitationPrintModal';
import { CampusGpsMap } from '../common/CampusGpsMap';
import { formatINR, formatISTDate } from '../../utils/formatters';

export const ViolationDetailModal: React.FC = () => {
  const { 
    selectedViolationId, 
    setSelectedViolationId, 
    violations, 
    zones,
    updateViolationStatus, 
    resolveAppeal,
    currentUser,
    getVehicleProfile,
    setSelectedVehiclePlate,
    setActiveTab
  } = useParking();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [appealNotes, setAppealNotes] = useState('');
  const [showStatusChanger, setShowStatusChanger] = useState(false);

  if (!selectedViolationId) return null;

  const violation = violations.find(v => v.id === selectedViolationId);
  if (!violation) return null;

  const vehicleProfile = getVehicleProfile(violation.vehiclePlate);
  const matchingZone = zones.find(z => z.id === violation.zoneId) || zones[0];
  const formattedDate = formatISTDate(violation.timestamp);

  const handleStatusChange = (newStatus: ViolationStatus) => {
    updateViolationStatus(violation.id, newStatus, reviewRemarks);
    setShowStatusChanger(false);
  };

  const handleVehicleClick = () => {
    setSelectedVehiclePlate(violation.vehiclePlate);
    setSelectedViolationId(null);
    setActiveTab('vehicles');
  };

  return (
    <>
      <div className="fixed inset-0 z-45 flex items-center justify-center p-3 md:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-3xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-bold text-stone-900">{violation.id}</span>
              <StatusBadge status={violation.status} />
              <SeverityBadge severity={violation.severity} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 rounded-md transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Citation Slip
              </button>
              <button
                onClick={() => setSelectedViolationId(null)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Header Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-stone-50 border border-stone-200">
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Charged Offense</span>
                <h3 className="text-base font-bold text-stone-900">{violation.category}</h3>
                <div className="text-xs text-stone-600 mt-0.5 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{violation.zoneName} · {violation.specificLocation}</span>
                </div>
                {violation.gpsCoordinates && (
                  <div className="text-[11px] text-emerald-700 font-mono mt-1 font-semibold">
                    GPS Fix: {violation.gpsCoordinates.latitude.toFixed(5)}°N, {violation.gpsCoordinates.longitude.toFixed(5)}°E (±{violation.gpsCoordinates.accuracyMeters.toFixed(1)}m)
                  </div>
                )}
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Penalty Amount</span>
                <div className="text-2xl font-black font-mono text-[#9A3412] tabular-nums">
                  {formatINR(violation.fineAmount)}
                </div>
                <div className="text-[11px] font-medium text-stone-500">
                  {violation.status === 'Paid' ? (
                    <span className="text-emerald-600 font-semibold">Fully Settled</span>
                  ) : (
                    <span>Payment Due (Net 14 Days)</span>
                  )}
                </div>
              </div>
            </div>

            {/* GPS Map Preview if coordinates are recorded */}
            {violation.gpsCoordinates && (
              <div className="rounded-xl overflow-hidden border border-stone-200 shadow-xs">
                <div className="bg-stone-50 px-3.5 py-2 border-b border-stone-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                    Incident Geolocation &amp; Zone Boundary
                  </span>
                  <span className="font-mono text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    GPS Fix Confirmed
                  </span>
                </div>
                <CampusGpsMap selectedZone={matchingZone} officerLocation={violation.gpsCoordinates} height="175px" />
              </div>
            )}

            {/* Evidence & Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Photo Evidence */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#F97316]" />
                    Photographic Evidence
                  </span>
                  <span className="text-[11px] text-stone-400">Timestamp Verified</span>
                </div>

                <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 group">
                  {violation.photoUrl ? (
                    <img
                      src={violation.photoUrl}
                      alt={`Evidence for citation ${violation.id}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-xs">No camera photo attached</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 bg-stone-900/80 backdrop-blur-xs text-white p-2 rounded text-[11px] flex justify-between font-mono">
                    <span>GPS: {violation.locationMode === 'GPS_CAPTURED' ? 'Verified' : 'Manual'}</span>
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Right: Vehicle & Registration */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#F97316]" />
                      Vehicle Information
                    </span>
                    <button
                      onClick={handleVehicleClick}
                      className="text-xs text-[#9A3412] hover:text-[#7C2D12] font-semibold flex items-center gap-1 transition-colors"
                    >
                      History Dossier <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="border border-stone-200 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-500">Registration Plate:</span>
                      <span className="font-mono font-bold text-stone-900 text-sm">{violation.vehiclePlate} ({violation.vehicleState})</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-500">Vehicle Type:</span>
                      <span className="font-medium text-stone-800">{violation.vehicleType}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-500">Make / Model / Color:</span>
                      <span className="font-medium text-stone-800">{violation.vehicleMakeModel}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span className="text-stone-500">Affiliation:</span>
                      <span className="font-medium text-stone-800">{vehicleProfile?.ownerType || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-stone-500">Repeat Offenses:</span>
                      <span className={`font-semibold ${vehicleProfile?.isRepeatOffender ? 'text-rose-600' : 'text-stone-700'}`}>
                        {vehicleProfile?.totalViolations || 1} Total Citations {vehicleProfile?.isRepeatOffender ? '⚠️' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Issuing Officer Details */}
                <div>
                  <span className="text-xs font-bold text-stone-900 block mb-1.5">Enforcement Officer</span>
                  <div className="border border-stone-200 rounded-lg p-2.5 text-xs bg-stone-50 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-stone-800">{violation.officerName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">Badge ID: {violation.officerBadge}</div>
                    </div>
                    <div className="text-right text-[11px] text-stone-500">
                      <div>Logged at</div>
                      <div className="font-mono">{formattedDate}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Officer Field Notes */}
            <div>
              <span className="text-xs font-bold text-stone-900 block mb-1.5">Officer Field Notes</span>
              <p className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 leading-relaxed italic">
                "{violation.notes || 'No detailed field notes logged.'}"
              </p>
            </div>

            {/* Supervisor Review / Audit Section */}
            {violation.supervisorReview && (
              <div className="border border-orange-200 bg-orange-50/50 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#9A3412] flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-[#F97316]" />
                    Supervisor Audit Validation
                  </span>
                  <span className="text-[11px] text-[#9A3412] font-mono">
                    {formatISTDate(violation.supervisorReview.reviewedAt)}
                  </span>
                </div>
                <p className="text-stone-700">{violation.supervisorReview.remarks}</p>
                <div className="text-[11px] text-stone-500">
                  Reviewed by: <strong>{violation.supervisorReview.reviewer}</strong>
                </div>
              </div>
            )}

            {/* Appeal Section (if exists) */}
            {violation.appeal && (
              <div className="border border-purple-200 bg-purple-50/50 rounded-lg p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    Citation Appeal Status: {violation.appeal.status}
                  </span>
                  <span className="text-[11px] text-purple-600 font-mono">
                    {formatISTDate(violation.appeal.appealedAt)}
                  </span>
                </div>
                <p className="text-slate-700"><strong>Appellant Statement:</strong> {violation.appeal.reason}</p>
                {violation.appeal.responseNotes && (
                  <p className="text-slate-600 italic">Response: {violation.appeal.responseNotes}</p>
                )}

                {/* Appeal decision buttons if under review and supervisor/admin */}
                {violation.appeal.status === 'Pending' && currentUser?.role === 'ADMIN' && (
                  <div className="pt-2 border-t border-purple-200 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Supervisor adjudication notes..."
                      value={appealNotes}
                      onChange={(e) => setAppealNotes(e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-purple-200 rounded"
                    />
                    <button
                      onClick={() => resolveAppeal(violation.id, 'Granted', appealNotes || 'Appeal accepted. Citation dismissed.')}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                    >
                      Grant Appeal (Dismiss)
                    </button>
                    <button
                      onClick={() => resolveAppeal(violation.id, 'Denied', appealNotes || 'Appeal reviewed and denied. Fine stands.')}
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
                    >
                      Deny Appeal
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Payment Record (if Paid) */}
            {violation.payment && (
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Payment Settled via {violation.payment.paymentMethod}
                  </span>
                  <span className="font-mono text-emerald-700">Receipt #{violation.payment.receiptNumber}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div>Paid: <strong className="font-mono text-emerald-700">{formatINR(violation.payment.amountRupees || violation.payment.amountPaise / 100 || violation.fineAmount)}</strong></div>
                  <div>Razorpay Payment ID: <strong className="font-mono">{violation.payment.razorpayPaymentId || 'N/A'}</strong></div>
                  <div className="col-span-2 text-[11px] text-slate-500">
                    Verified on {formatISTDate(violation.payment.paidAt)} by {violation.payment.processedBy}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Status changer dropdown for Administrators only */}
            {currentUser?.role === 'ADMIN' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-600">Update Status:</span>
                <select
                  value={violation.status}
                  onChange={(e) => handleStatusChange(e.target.value as ViolationStatus)}
                  className="text-xs font-medium px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                >
                  <option value="Reported">Reported</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Fine Pending">Fine Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Appealed">Appealed</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {violation.status !== 'Paid' && violation.status !== 'Resolved' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Settle Penalty ({formatINR(violation.fineAmount)})
                </button>
              )}

              {violation.status === 'Reported' && currentUser?.role === 'ADMIN' && (
                <button
                  onClick={() => handleStatusChange('Confirmed')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Confirm Citation
                </button>
              )}

              <button
                onClick={() => setSelectedViolationId(null)}
                className="px-3.5 py-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          violation={violation}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {showPrintModal && (
        <CitationPrintModal
          violation={violation}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </>
  );
};
