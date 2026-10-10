import React, { useState } from 'react';
import { X, MessageSquare, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Violation } from '../../types';
import { useParking } from '../../context/ParkingContext';
import { formatINR } from '../../utils/formatters';

interface AppealModalProps {
  violation: Violation;
  onClose: () => void;
}

export const AppealModal: React.FC<AppealModalProps> = ({ violation, onClose }) => {
  const { submitAppeal } = useParking();
  const [reason, setReason] = useState('');
  const [selectedPresetReason, setSelectedPresetReason] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const presets = [
    'Emergency medical situation / urgent health care access',
    'Valid parking permit was displayed but obscured on windshield',
    'Parking pay meter machine / mobile app error at time of session',
    'Vehicle was mechanically stalled / awaiting roadside assistance',
    'Official university contractor or departmental loading authorization',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = [selectedPresetReason, reason, evidenceNotes]
      .filter(Boolean)
      .join('\n\nAdditional Details: ');

    if (!finalReason.trim()) return;

    submitAppeal(violation.id, finalReason);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {isSuccess ? 'Appeal Submitted' : 'File Formal Citation Appeal'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Appeal Placed in Adjudication Queue</h4>
              <p className="text-xs text-slate-500 mt-1">
                Your dispute for citation <span className="font-mono font-bold text-slate-800">{violation.id}</span> has been forwarded to the Enforcement Supervisor.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-900 text-left space-y-1">
              <div className="font-semibold">What happens next?</div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                • Late fine collection is frozen during active review.
                • The Supervisor will inspect timestamped evidence and your explanation.
                • Track decision status directly on your Owner Dashboard.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 bg-[#142B4A] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
            >
              Back to My Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Citation quick context */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Citation:</span>
                <span className="font-mono font-bold text-slate-900">{violation.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-mono font-bold text-slate-900">{violation.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Violation:</span>
                <span className="font-semibold text-slate-800">{violation.category}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/60">
                <span className="font-semibold text-slate-700">Contested Fine:</span>
                <span className="font-mono font-bold text-purple-700 tabular-nums">{formatINR(violation.fineAmount)}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Primary Ground for Appeal
              </label>
              <select
                value={selectedPresetReason}
                onChange={(e) => setSelectedPresetReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
              >
                <option value="">Select general grounds...</option>
                {presets.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Explanation & Justification *
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State your circumstances, driver identity, permit number, or time discrepancies clearly..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supporting Evidence Reference / Documentation Notes
              </label>
              <input
                type="text"
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                placeholder="e.g. Receipt #4401 attached / Permit permit_stu_8841 valid until 2027"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Submit Official Appeal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
