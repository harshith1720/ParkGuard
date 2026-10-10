import React, { useState } from 'react';
import { 
  MapPin, 
  PlusCircle, 
  Clock, 
  ShieldAlert, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { ParkingZone } from '../../types';

export const ZonesView: React.FC = () => {
  const { zones, updateZone, addZone, currentUser, setActiveTab } = useParking();
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editMultiplier, setEditMultiplier] = useState<number>(1.0);
  const [editHours, setEditHours] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCode, setNewZoneCode] = useState('');
  const [newZoneType, setNewZoneType] = useState<'deck' | 'surface_lot' | 'street' | 'loading'>('surface_lot');
  const [newZoneCapacity, setNewZoneCapacity] = useState(150);
  const [newZoneMultiplier, setNewZoneMultiplier] = useState(1.0);
  const [newZoneHours, setNewZoneHours] = useState('07:00 - 21:00');

  const handleStartEdit = (zone: ParkingZone) => {
    setEditingZoneId(zone.id);
    setEditMultiplier(zone.fineMultiplier);
    setEditHours(zone.enforcementHours);
  };

  const handleSaveEdit = (zone: ParkingZone) => {
    updateZone({
      ...zone,
      fineMultiplier: editMultiplier,
      enforcementHours: editHours,
    });
    setEditingZoneId(null);
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !newZoneCode.trim()) return;

    addZone({
      name: newZoneName.trim(),
      code: newZoneCode.trim().toUpperCase(),
      type: newZoneType,
      capacity: Number(newZoneCapacity),
      currentOccupancy: Math.round(Number(newZoneCapacity) * 0.7),
      enforcementHours: newZoneHours,
      fineMultiplier: Number(newZoneMultiplier),
      status: 'Active',
      latitude: 12.8452,
      longitude: 77.6601,
      radiusMeters: 150,
    });

    setShowAddModal(false);
    setNewZoneName('');
    setNewZoneCode('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Enforcement Parking Zones</h2>
          <p className="text-xs text-slate-500">
            Regulate campus structures, surface lots, loading docks, and emergency vehicle zones.
          </p>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Parking Zone
          </button>
        )}
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {zones.map((zone) => {
          const occupancyPercent = Math.round((zone.currentOccupancy / zone.capacity) * 100);
          const isEditing = editingZoneId === zone.id;

          return (
            <div
              key={zone.id}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                      {zone.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 leading-snug">
                      {zone.name}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    zone.status === 'High Alert' 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {zone.status}
                  </span>
                </div>

                {/* Capacity meter */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Live Occupancy</span>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">
                      {zone.currentOccupancy} / {zone.capacity} stalls ({occupancyPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        occupancyPercent > 90 
                          ? 'bg-rose-500' 
                          : occupancyPercent > 75 
                            ? 'bg-amber-500' 
                            : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Rules & Rates info */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Enforcement Hours:
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editHours}
                        onChange={(e) => setEditHours(e.target.value)}
                        className="px-2 py-0.5 text-xs border rounded w-28 text-right"
                      />
                    ) : (
                      <span className="font-mono font-medium text-slate-800">{zone.enforcementHours}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Fine Rate Multiplier:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="3.0"
                        value={editMultiplier}
                        onChange={(e) => setEditMultiplier(parseFloat(e.target.value))}
                        className="px-2 py-0.5 text-xs border rounded w-16 text-right font-mono"
                      />
                    ) : (
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                        {zone.fineMultiplier}x Rate
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Active Infractions:</span>
                    <span className={`font-mono font-bold ${zone.activeViolations > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {zone.activeViolations} open citations
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full justify-end">
                    <button
                      onClick={() => setEditingZoneId(null)}
                      className="px-2.5 py-1 text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(zone)}
                      className="px-3 py-1 bg-emerald-600 text-white rounded font-semibold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('violations')}
                      className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                      Inspect Citations <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {currentUser?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleStartEdit(zone)}
                        className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        Edit Rules
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Enforcement Parking Zone</h3>
            <form onSubmit={handleCreateZone} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. West Campus Residence Hall Deck"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zone Code</label>
                  <input
                    type="text"
                    required
                    value={newZoneCode}
                    onChange={(e) => setNewZoneCode(e.target.value.toUpperCase())}
                    placeholder="WC-DECK-B"
                    className="w-full px-3 py-2 font-mono uppercase border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newZoneCapacity}
                    onChange={(e) => setNewZoneCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enforcement Hours</label>
                  <input
                    type="text"
                    value={newZoneHours}
                    onChange={(e) => setNewZoneHours(e.target.value)}
                    placeholder="07:00 - 22:00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fine Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="2.5"
                    value={newZoneMultiplier}
                    onChange={(e) => setNewZoneMultiplier(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
