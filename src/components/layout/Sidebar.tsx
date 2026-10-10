import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  ClipboardList, 
  Car, 
  AlertOctagon, 
  MapPin, 
  Receipt, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  RotateCcw,
  Building2,
  MessageSquare,
  History,
  Users
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { 
    currentUser,
    activeTab, 
    setActiveTab, 
    violations, 
    allViolationsRaw,
    getAllVehicleProfiles, 
    resetToDemoData 
  } = useParking();

  const role = currentUser?.role || 'OFFICER';

  // Counts
  const pendingAppealsCount = allViolationsRaw.filter(v => v.status === 'Appealed' && v.appeal?.status === 'Pending').length;
  const pendingReviewsCount = allViolationsRaw.filter(v => ['Reported', 'Under Review'].includes(v.status)).length;
  const repeatCount = getAllVehicleProfiles().filter(p => p.isRepeatOffender).length;
  const myViolationsCount = violations.length;

  // Role-specific nav items
  interface NavItem {
    id: string;
    label: string;
    icon: any;
    highlight?: boolean;
    badge?: number;
    badgeColor?: string;
  }

  let navItems: NavItem[] = [];

  if (role === 'OWNER') {
    navItems = [
      { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
      { id: 'vehicles', label: 'My Vehicles', icon: Car },
      { id: 'violations', label: 'My Citations', icon: ClipboardList, badge: myViolationsCount > 0 ? myViolationsCount : undefined },
      { id: 'settings', label: 'Account Profile', icon: Settings },
    ];
  } else if (role === 'OFFICER') {
    navItems = [
      { id: 'dashboard', label: 'Officer Terminal', icon: LayoutDashboard },
      { id: 'record', label: 'Record Violation', icon: FilePlus2, highlight: true },
      { id: 'vehicles', label: 'Vehicle Lookup', icon: Car },
      { id: 'violations', label: 'Shift Citations Log', icon: ClipboardList },
      { id: 'repeat-offenders', label: 'Repeat Watchlist', icon: AlertOctagon, badge: repeatCount > 0 ? repeatCount : undefined },
      { id: 'settings', label: 'Officer Profile', icon: Settings },
    ];
  } else {
    // ADMIN
    navItems = [
      { id: 'dashboard', label: 'Command Overview', icon: LayoutDashboard },
      { id: 'violations', label: 'All Citations', icon: ClipboardList, badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined },
      { id: 'record', label: 'Record Violation', icon: FilePlus2 },
      { id: 'vehicles', label: 'Vehicle Registry', icon: Car },
      { id: 'repeat-offenders', label: 'Repeat Offenders', icon: AlertOctagon, badge: repeatCount > 0 ? repeatCount : undefined, badgeColor: 'bg-rose-500 text-white' },
      { id: 'zones', label: 'Parking Zones', icon: MapPin },
      { id: 'penalties', label: 'Penalties Ledger', icon: Receipt },
      { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      { id: 'settings', label: 'System Settings', icon: Settings },
    ];
  }

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#142B4A] text-slate-200 flex flex-col shrink-0
        transform transition-transform duration-200 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        border-r border-slate-800/80 shadow-xl md:shadow-none
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                ParkGuard
              </div>
              <div className="text-[11px] text-blue-300 font-medium capitalize">
                {role.toLowerCase()} workspace
              </div>
            </div>
          </div>
        </div>

        {/* Current User Pill */}
        <div className="px-4 py-3 bg-white/5 border-b border-white/5 text-xs flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="font-semibold text-white block truncate">{currentUser?.name}</span>
            <span className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.email}</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-blue-500/20 text-blue-300 border border-blue-400/20">
            {role}
          </span>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {role === 'OWNER' ? 'My Account' : role === 'OFFICER' ? 'Field Patrol' : 'Administration'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold' 
                    : item.highlight
                      ? 'text-blue-300 hover:text-white hover:bg-white/10 bg-white/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`
                    text-[11px] font-semibold px-2 py-0.5 rounded-full font-mono tabular-nums
                    ${item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300')}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Demo Mode / Storage Status Box */}
        <div className="p-4 border-t border-white/10 bg-[#0E1E34]">
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                RBAC Prototype
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Local Live</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              OWASP least privilege & scoped data isolation active.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset all violations, users, and zones to original demo scenario?')) {
                  resetToDemoData();
                }
              }}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white rounded text-[11px] font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Records
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
