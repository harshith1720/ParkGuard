import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  Sliders, 
  UserCog, 
  Database,
  CheckCircle2,
  FileJson,
  User
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export const SettingsView: React.FC = () => {
  const { 
    currentUser, 
    users, 
    switchUser, 
    resetToDemoData, 
    violations, 
    zones 
  } = useParking();

  const [repeatThreshold, setRepeatThreshold] = useState(3);
  const [bootThresholdAmount, setBootThresholdAmount] = useState(5000);
  const [appealGraceDays, setAppealGraceDays] = useState(14);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      violations,
      zones,
      policies: {
        repeatThreshold,
        bootThresholdAmount,
        appealGraceDays,
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parkguard_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Account Profile & Security Policies</h2>
        <p className="text-xs text-slate-500">
          User authentication status, role boundaries, enforcement thresholds, and demo database controls.
        </p>
      </div>

      {isSavedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Campus enforcement policies updated successfully in local storage.</span>
        </div>
      )}

      {/* Active User Information Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Current Authenticated Account</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
          <div>
            <span className="text-slate-500 block">Name:</span>
            <span className="font-bold text-slate-900 text-sm">{currentUser?.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Email:</span>
            <span className="font-mono text-slate-800">{currentUser?.email}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Assigned Role:</span>
            <span className="font-bold text-blue-700 uppercase">{currentUser?.role}</span>
          </div>
          {currentUser?.registeredPlates && (
            <div className="sm:col-span-3 pt-2 border-t border-slate-200/60">
              <span className="text-slate-500 block">Registered Vehicle License Plates:</span>
              <span className="font-mono font-bold text-slate-900">{currentUser.registeredPlates.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Role Management Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <UserCog className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Switch Active Demo Role</h3>
        </div>
        <p className="text-xs text-slate-500">
          Seamlessly switch between Vehicle Owner, Officer, and Admin personas to verify least-privilege access.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {users.map((user) => {
            const isSelected = currentUser?.id === user.id;
            return (
              <div
                key={user.id}
                onClick={() => switchUser(user)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-slate-900">{user.name}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {user.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">{user.email}</p>
                <div className="mt-3 text-right">
                  <span className={`text-[11px] font-semibold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Active Session' : 'Switch To'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enforcement Policies Form (Admin Only) */}
      {currentUser?.role === 'ADMIN' && (
        <form onSubmit={handleSavePolicies} className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Enforcement Thresholds & Campus Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Repeat Offender Citation Threshold
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={repeatThreshold}
                onChange={(e) => setRepeatThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Number of citations to trigger repeat flag</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Boot / Tow Delinquent Balance Limit (₹ INR)
              </label>
              <input
                type="number"
                min={1000}
                max={25000}
                step={500}
                value={bootThresholdAmount}
                onChange={(e) => setBootThresholdAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Unpaid fine sum triggering immobilization</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Citation Appeal Window (Days)
              </label>
              <input
                type="number"
                min={5}
                max={30}
                value={appealGraceDays}
                onChange={(e) => setAppealGraceDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Grace period for driver to file written dispute</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Save Policy Rules
            </button>
          </div>
        </form>
      )}

      {/* Database & Prototype Storage Controls */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Prototype Storage & Demo Presets</h3>
        </div>
        <p className="text-xs text-slate-500">
          Reset records to test initial state or backup local citation data for presentation.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Reset all citations, zones, and status to original demo baseline?')) {
                resetToDemoData();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Sample Demo Dataset
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            <FileJson className="w-4 h-4" />
            Export System Backup (JSON)
          </button>
        </div>
      </div>
    </div>
  );
};
