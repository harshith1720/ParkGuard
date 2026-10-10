import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  PlusCircle, 
  ShieldAlert, 
  LogOut, 
  User, 
  Repeat, 
  HelpCircle,
  Car,
  ChevronDown
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { 
    currentUser, 
    logout, 
    users, 
    switchUser, 
    activeTab, 
    setActiveTab, 
    setSelectedViolationId, 
    setSelectedVehiclePlate,
    violations 
  } = useParking();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    const found = violations.find(v => v.id.toUpperCase() === query);
    if (found) {
      setSelectedViolationId(found.id);
      setActiveTab('violations');
      setSearchQuery('');
      return;
    }

    setSelectedVehiclePlate(query);
    setActiveTab('vehicles');
    setSearchQuery('');
  };

  const roleBadgeStyle = {
    OWNER: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    OFFICER: 'bg-blue-50 text-blue-800 border-blue-200',
    ADMIN: 'bg-purple-50 text-purple-800 border-purple-200',
  }[currentUser?.role || 'OFFICER'];

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 px-4 md:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Active Role Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-bold text-[#142B4A]">ParkGuard</span>
              <span>/</span>
              <span className="font-semibold text-blue-600 truncate">
                {currentUser?.role === 'OWNER' ? 'Vehicle Owner Portal' :
                 currentUser?.role === 'OFFICER' ? 'Officer Field Terminal' :
                 'Supervisor Command'}
              </span>
            </div>
            <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight truncate">
              {currentUser?.name || 'Active Session'}
            </h1>
          </div>
        </div>

        {/* Right side: Search (for staff) + Account Switcher + Logout */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Search bar (Officer / Admin) */}
          {currentUser?.role !== 'OWNER' && (
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plate (e.g. KA01AB1234)..."
                className="w-52 xl:w-60 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
              />
            </form>
          )}

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${roleBadgeStyle}`}
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-75" />
              <span>Role: {currentUser?.role}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                  Switch Active Persona
                </div>

                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                      currentUser?.id === u.id ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            title="Sign Out of Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
