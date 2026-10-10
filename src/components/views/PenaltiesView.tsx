import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Search, 
  Download, 
  AlertCircle,
  DollarSign,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { StatusBadge } from '../common/StatusBadge';
import { PaymentModal } from '../modals/PaymentModal';
import { Violation } from '../../types';
import { formatINR, formatISTDateOnly } from '../../utils/formatters';

export const PenaltiesView: React.FC = () => {
  const { violations, exportViolationsCSV, setSelectedViolationId } = useParking();
  const [filterState, setFilterState] = useState<'All' | 'Unsettled' | 'Paid'>('All');
  const [searchPlate, setSearchPlate] = useState('');
  const [selectedViolationForPayment, setSelectedViolationForPayment] = useState<Violation | null>(null);

  const totalAssessed = violations.reduce((sum, v) => sum + v.fineAmount, 0);
  const totalSettled = violations
    .filter(v => v.status === 'Paid')
    .reduce((sum, v) => sum + v.fineAmount, 0);
  const totalOutstanding = violations
    .filter(v => ['Confirmed', 'Fine Pending', 'Reported', 'Under Review'].includes(v.status))
    .reduce((sum, v) => sum + v.fineAmount, 0);

  const filteredList = useMemo(() => {
    return violations.filter(v => {
      if (filterState === 'Paid' && v.status !== 'Paid') return false;
      if (filterState === 'Unsettled' && v.status === 'Paid') return false;
      if (searchPlate.trim()) {
        const q = searchPlate.toLowerCase().trim();
        return (
          v.vehiclePlate.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [violations, filterState, searchPlate]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Penalty Management & Revenue Ledger</h2>
          <p className="text-xs text-slate-500">
            Track citation balances, bursar remittances, student card charges, and simulation receipts.
          </p>
        </div>

        <button
          onClick={exportViolationsCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Export Ledger CSV
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Assessed Fines
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 tabular-nums mt-1">
            {formatINR(totalAssessed)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Cumulative campus citations</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            Settled / Collected (Razorpay Gateway)
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 tabular-nums mt-1">
            {formatINR(totalSettled)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {violations.filter(v => v.status === 'Paid').length} paid citations
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
            Outstanding Delinquent Balance
          </span>
          <div className="text-2xl font-black font-mono text-rose-600 tabular-nums mt-1">
            {formatINR(totalOutstanding)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Due across {violations.filter(v => ['Confirmed', 'Fine Pending'].includes(v.status)).length} open accounts
          </span>
        </div>
      </div>

      {/* Simulation Notice Disclaimer */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Enforcement Notice:</strong> Payment updates in this prototype simulate integration with university bursar ledgers and campus payment portals. No genuine monetary transactions or bank transfers are executed.
        </p>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Filter controls */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                placeholder="Search citation or vehicle plate..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto justify-end text-xs">
            {(['All', 'Unsettled', 'Paid'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterState(mode)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterState === mode
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Citation ID</th>
                <th className="py-3 px-3.5">Vehicle Plate</th>
                <th className="py-3 px-3.5">Charge Reason</th>
                <th className="py-3 px-3.5">Issued Date</th>
                <th className="py-3 px-3.5 text-right">Penalty Amount</th>
                <th className="py-3 px-3.5">Settlement Status</th>
                <th className="py-3 px-3.5">Payment Details</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                    <button 
                      onClick={() => setSelectedViolationId(v.id)}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {v.id}
                    </button>
                  </td>

                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                    {v.vehiclePlate}
                  </td>

                  <td className="py-3 px-3.5 font-medium text-slate-800 truncate max-w-[190px]">
                    {v.category}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600">
                    {formatISTDateOnly(v.timestamp)}
                  </td>

                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatINR(v.fineAmount)}
                  </td>

                  <td className="py-3 px-3.5">
                    <StatusBadge status={v.status} />
                  </td>

                  <td className="py-3 px-3.5 text-slate-600 text-[11px]">
                    {v.payment ? (
                      <div>
                        <span className="font-semibold text-emerald-700 block">
                          Receipt #{v.payment.receiptNumber}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {v.payment.paymentMethod}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unsettled</span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-right">
                    {v.status !== 'Paid' && v.status !== 'Resolved' ? (
                      <button
                        onClick={() => setSelectedViolationForPayment(v)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold shadow-xs"
                      >
                        Settle Fine
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px] font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedViolationForPayment && (
        <PaymentModal
          violation={selectedViolationForPayment}
          onClose={() => setSelectedViolationForPayment(null)}
        />
      )}
    </div>
  );
};
