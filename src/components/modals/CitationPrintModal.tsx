import React from 'react';
import { X, Printer, Shield, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { Violation } from '../../types';
import { formatINR, formatISTDate } from '../../utils/formatters';

interface CitationPrintModalProps {
  violation: Violation;
  onClose: () => void;
}

export const CitationPrintModal: React.FC<CitationPrintModalProps> = ({ violation, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = formatISTDate(violation.timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <span className="text-xs font-semibold text-slate-700">Official Citation Document Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#142B4A] hover:bg-slate-800 text-white rounded text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Body */}
        <div className="p-8 font-sans text-slate-900 space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-[#142B4A]" />
              <h2 className="text-lg font-black uppercase tracking-wider text-[#142B4A]">
                {violation.issuingAuthority || 'Campus Traffic & Security Enforcement Directorate'}
              </h2>
            </div>
            <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
              Notice of Parking Infraction & Official Citation (India)
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-xs font-bold text-slate-900">
              CITATION NO: {violation.id}
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 p-4 rounded bg-slate-50/50">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Vehicle Registration Number</span>
              <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                {violation.vehiclePlate} ({violation.vehicleState})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Vehicle Type & Description</span>
              <span className="font-medium text-slate-800">{violation.vehicleType} · {violation.vehicleMakeModel}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Infraction Timestamp (IST)</span>
              <span className="font-mono font-medium text-slate-800">{formattedDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Designated Parking Zone</span>
              <span className="font-medium text-slate-800">{violation.zoneName}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Exact Location & Coordinates</span>
              <span className="font-medium text-slate-800 block">{violation.specificLocation}</span>
              {violation.locationMode === 'GPS_CAPTURED' && violation.gpsCoordinates ? (
                <span className="text-[11px] text-emerald-700 font-mono flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  GPS Verified: {violation.gpsCoordinates.latitude.toFixed(5)}°N, {violation.gpsCoordinates.longitude.toFixed(5)}°E (±{violation.gpsCoordinates.accuracyMeters.toFixed(1)}m)
                </span>
              ) : (
                <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                  Authorized Manual Location Entry: {violation.manualExceptionReason || 'Indoor facility fix'}
                </span>
              )}
            </div>
          </div>

          {/* Offense & Fine */}
          <div className="border border-slate-900 rounded p-4 bg-slate-900 text-white">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Offense Charged</span>
                <span className="text-base font-bold text-white block mt-0.5">{violation.category}</span>
                <span className="text-xs text-slate-300 mt-1 block font-mono">Applicable Rule: {violation.applicableRule || 'Campus Regulation'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Fine Assessed</span>
                <span className="text-2xl font-black font-mono text-white tabular-nums">{formatINR(violation.fineAmount)}</span>
              </div>
            </div>
          </div>

          {/* Officer Details & Notes */}
          <div className="text-xs space-y-2">
            <div>
              <span className="text-slate-500 block font-semibold text-[10px] uppercase">Officer Field Remarks:</span>
              <p className="p-2.5 bg-slate-100 rounded border border-slate-200 text-slate-700 italic">
                "{violation.notes || 'Routine parking patrol verification.'}"
              </p>
            </div>
            <div className="flex justify-between text-slate-600 pt-1 text-[11px]">
              <span>Issuing Officer: <strong>{violation.officerName}</strong></span>
              <span>Badge / Token ID: <strong className="font-mono">{violation.officerBadge}</strong></span>
            </div>
          </div>

          {/* Barcode & Instructions */}
          <div className="border-t border-slate-200 pt-4 text-center space-y-3">
            <div className="font-mono tracking-widest text-xs font-bold text-slate-500">
              ||| | ||||| |||| || | |||| ||||| ||| |||| | ||
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-lg mx-auto">
              Fines must be remitted via Razorpay portal or Campus Accounts Desk within 14 calendar days. Online dispute/appeal may be submitted through the Vehicle Owner Portal within 7 business days. Vehicles accumulating 3+ infractions are subject to wheel immobilization (boot) or impoundment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
