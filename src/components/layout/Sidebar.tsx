
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
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    violations,
    allViolationsRaw,
    getAllVehicleProfiles,
    resetToDemoData,
  } = useParking();

  const role = currentUser?.role || 'OFFICER';

  const pendingReviewsCount = allViolationsRaw.filter((v) =>
    ['Reported', 'Under Review'].includes(v.status)
  ).length;

  const repeatCount = getAllVehicleProfiles().filter(
    (p) => p.isRepeatOffender
  ).length;

  const myViolationsCount = violations.length;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    highlight?: boolean;
    badge?: number;
    badgeColor?: string;
  }

  let navItems: NavItem[] = [];

  if (role === 'OWNER') {
    navItems = [
      { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
      { id: 'vehicles', label: 'My Vehicles', icon: Car },
      {
        id: 'violations',
        label: 'My Citations',
        icon: ClipboardList,
        badge: myViolationsCount > 0 ? myViolationsCount : undefined,
      },
      { id: 'settings', label: 'Account Profile', icon: Settings },
    ];
  } else if (role === 'OFFICER') {
    navItems = [
      { id: 'dashboard', label: 'Officer Terminal', icon: LayoutDashboard },
      {
        id: 'record',
        label: 'Record Violation',
        icon: FilePlus2,
        highlight: true,
      },
      { id: 'vehicles', label: 'Vehicle Lookup', icon: Car },
      { id: 'violations', label: 'Shift Citations Log', icon: ClipboardList },
      {
        id: 'repeat-offenders',
        label: 'Repeat Watchlist',
        icon: AlertOctagon,
        badge: repeatCount > 0 ? repeatCount : undefined,
      },
      { id: 'settings', label: 'Officer Profile', icon: Settings },
    ];
  } else {
    navItems = [
      { id: 'dashboard', label: 'Command Overview', icon: LayoutDashboard },
      {
        id: 'violations',
        label: 'All Citations',
        icon: ClipboardList,
        badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
      },
      { id: 'record', label: 'Record Violation', icon: FilePlus2 },
      { id: 'vehicles', label: 'Vehicle Registry', icon: Car },
      {
        id: 'repeat-offenders',
        label: 'Repeat Offenders',
        icon: AlertOctagon,
        badge: repeatCount > 0 ? repeatCount : undefined,
      },
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col
          border-r border-neutral-800 bg-black text-white shadow-xl
          transition-transform duration-200 ease-in-out
          md:static md:shadow-none
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-base font-bold tracking-tight text-white">
                ParkGuard
              </div>
              <div className="text-[11px] font-medium capitalize text-neutral-400">
                {role.toLowerCase()} workspace
              </div>
            </div>
          </div>
        </div>

        {/* Current User */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3 text-xs">
          <div className="truncate pr-2">
            <span className="block truncate font-semibold text-white">
              {currentUser?.name}
            </span>
            <span className="truncate font-mono text-[10px] text-neutral-400">
              {currentUser?.email}
            </span>
          </div>
          <span className="rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
            {role}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {role === 'OWNER'
              ? 'My Account'
              : role === 'OFFICER'
                ? 'Field Patrol'
                : 'Administration'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  group flex w-full items-center justify-between rounded-lg
                  px-3 py-2.5 text-sm font-medium transition-colors duration-150
                  ${isActive
                    ? 'bg-white font-semibold text-black shadow-sm'
                    : item.highlight
                      ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                      : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive
                      ? 'text-black'
                      : 'text-neutral-400 group-hover:text-white'
                      }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`
                      rounded-full px-2 py-0.5 font-mono text-[11px]
                      font-semibold tabular-nums
                      ${isActive
                        ? 'bg-neutral-200 text-black'
                        : 'bg-neutral-800 text-neutral-200'
                      }
                    `}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Demo and Storage Status */}
        <div className="border-t border-neutral-800 bg-neutral-950 p-4">
          <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-xs">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Building2 className="h-3.5 w-3.5 text-neutral-300" />
                RBAC System
              </span>
              <span className="text-[10px] font-medium text-neutral-400">
                Local Live
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-neutral-400">
              OWASP least privilege &amp; scoped data isolation active.
            </p>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Reset all violations, users, and zones to original demo scenario?'
                  )
                ) {
                  resetToDemoData();
                }
              }}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-neutral-700"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Demo Records
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
