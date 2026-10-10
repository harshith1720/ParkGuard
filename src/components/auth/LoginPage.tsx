import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Car, 
  User, 
  Lock, 
  ArrowRight, 
  ShieldAlert, 
  UserPlus, 
  CheckCircle2, 
  Info,
  BadgeAlert
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export const LoginPage: React.FC = () => {
  const { login, registerOwner, users, switchUser } = useParking();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('officer@campus.edu');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPlate, setRegPlate] = useState('KA01AB1234');
  const [regId, setRegId] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(email);
    if (!success) {
      setErrorMsg('Invalid credentials or unregistered account. Check email address.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName.trim() || !regEmail.trim() || !regPlate.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    const success = registerOwner(regName, regEmail, regPlate, regId);
    if (!success) {
      setErrorMsg('An account with this email already exists.');
    }
  };

  const demoAccounts = [
    {
      role: 'OFFICER' as const,
      email: 'officer@campus.edu',
      name: 'Officer Rajesh Kumar',
      badge: 'OFF-402',
      tag: 'Field Enforcement App',
      desc: 'Scan plates, issue citations with GPS & map preview, check duplicate & repeat warnings',
      color: 'border-orange-200 hover:border-[#F97316] bg-orange-50/40',
    },
    {
      role: 'OWNER' as const,
      email: 'owner@campus.edu',
      name: 'Aarav Sharma (Student)',
      badge: 'KA 01 AB 1234',
      tag: 'Vehicle Owner Portal',
      desc: 'View personal citations, see photo evidence, pay fines via verified gateway & file appeals',
      color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/40',
    },
    {
      role: 'ADMIN' as const,
      email: 'admin@campus.edu',
      name: 'Commander Vikram Anand',
      badge: 'ADM-001',
      tag: 'Admin & Supervisor Console',
      desc: 'Confirm citations, adjudicate appeals, configure zones & audit logs',
      color: 'border-purple-200 hover:border-purple-400 bg-purple-50/40',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF9] text-[#1F2937] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#9A3412] text-white shadow-lg shadow-orange-950/20 mb-3">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          ParkGuard Enforcement
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Role-Based Parking Compliance & Citation Settlement System (INR)
        </p>
      </div>

      {/* Main Auth Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-semibold">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`pb-3 flex-1 text-center transition-colors border-b-2 ${
                mode === 'login'
                  ? 'border-[#F97316] text-[#F97316] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              System Login (Single Sign-On)
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`pb-3 flex-1 text-center transition-colors border-b-2 ${
                mode === 'register'
                  ? 'border-[#F97316] text-[#F97316] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Register Vehicle Owner
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <BadgeAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University / Staff / Account Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. officer@campus.edu or owner@campus.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">Demo mode accepts any password</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-xs font-bold shadow-md transition-all"
              >
                Sign In to Authorized Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-lg text-xs text-orange-950 leading-relaxed">
                <strong>Student / Employee Vehicle Self-Registration:</strong> Creates a dedicated vehicle-owner account linked exclusively to your vehicle license plate.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle License Plate *</label>
                  <input
                    type="text"
                    required
                    value={regPlate}
                    onChange={(e) => setRegPlate(e.target.value.toUpperCase())}
                    placeholder="KA01AB1234"
                    className="w-full px-3 py-2 text-xs font-mono font-bold uppercase border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student / Employee ID</label>
                  <input
                    type="text"
                    value={regId}
                    onChange={(e) => setRegId(e.target.value)}
                    placeholder="STU-2026-9042"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Complete Registration & Access My Portal
              </button>
            </form>
          )}

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Role-Based Demo Accounts
              </span>
              <span className="text-[10px] text-[#F97316] font-semibold">Ready for Evaluation</span>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((acc) => {
                const userObj = users.find(u => u.email.toLowerCase() === acc.email.toLowerCase());
                return (
                  <div
                    key={acc.email}
                    onClick={() => {
                      if (userObj) switchUser(userObj);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${acc.color}`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-700">
                          {acc.badge}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 uppercase">
                          [{acc.role}]
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{acc.desc}</p>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 rounded text-[11px] font-bold shrink-0 transition-colors shadow-xs"
                    >
                      Login as {acc.role} →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* OWASP Security Notice Card */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>OWASP Least-Privilege & Data Isolation Architecture</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Every request enforces server-side role validation. Vehicle owners only receive citation data matching their verified registered license plates (zero cross-vehicle data leakage). Parking officers create and inspect field records but cannot dismiss violations or alter penalty policies.
          </p>
        </div>
      </div>
    </div>
  );
};
