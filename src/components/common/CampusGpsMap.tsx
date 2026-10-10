import React, { useEffect, useRef } from 'react';
import { MapPin, AlertTriangle, CheckCircle2, Crosshair } from 'lucide-react';
import { ParkingZone, GpsCoordinates } from '../../types';
import { calculateDistanceMeters } from '../../utils/formatters';

interface CampusGpsMapProps {
  gpsCoords?: GpsCoordinates | null;
  selectedZone?: ParkingZone | null;
  allZones?: ParkingZone[];
  height?: string;
  onSelectCoordinates?: (lat: number, lng: number) => void;
}

export const CampusGpsMap: React.FC<CampusGpsMapProps> = ({
  gpsCoords,
  selectedZone,
  allZones = [],
  height = '240px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);

  // Compute distance from selected zone if both available
  let distanceToZone: number | null = null;
  let isMismatch = false;

  if (gpsCoords && selectedZone) {
    distanceToZone = calculateDistanceMeters(
      gpsCoords.latitude,
      gpsCoords.longitude,
      selectedZone.latitude,
      selectedZone.longitude
    );
    isMismatch = distanceToZone > selectedZone.radiusMeters;
  }

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;

        // Ensure leaflet css is present
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        const centerLat = gpsCoords ? gpsCoords.latitude : (selectedZone ? selectedZone.latitude : 12.8452);
        const centerLng = gpsCoords ? gpsCoords.longitude : (selectedZone ? selectedZone.longitude : 77.6601);

        if (!leafletMapRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [centerLat, centerLng],
            zoom: 16,
            zoomControl: false,
            attributionControl: false,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(map);

          L.control.zoom({ position: 'topright' }).addTo(map);

          leafletMapRef.current = map;
          markerGroupRef.current = L.layerGroup().addTo(map);
        }

        const map = leafletMapRef.current;
        const group = markerGroupRef.current;
        if (!map || !group || !isMounted) return;

        group.clearLayers();

        // 1. Plot all parking zones with subtle blue circle geofences
        allZones.forEach((z) => {
          const isSelected = selectedZone?.id === z.id;
          const zoneColor = isSelected ? '#2563EB' : '#64748B';

          const circle = L.circle([z.latitude, z.longitude], {
            color: zoneColor,
            fillColor: zoneColor,
            fillOpacity: isSelected ? 0.2 : 0.08,
            radius: z.radiusMeters,
            weight: isSelected ? 2 : 1,
            dashArray: isSelected ? '4, 4' : undefined,
          }).addTo(group);

          circle.bindPopup(`<b>${z.name}</b><br>Code: ${z.code}<br>Radius: ${z.radiusMeters}m`);
        });

        // 2. Plot Captured Officer GPS location with red/emerald pulse marker
        if (gpsCoords) {
          // Accuracy circle
          L.circle([gpsCoords.latitude, gpsCoords.longitude], {
            color: isMismatch ? '#DC2626' : '#16A34A',
            fillColor: isMismatch ? '#F87171' : '#4ADE80',
            fillOpacity: 0.15,
            radius: Math.max(gpsCoords.accuracyMeters, 10),
            weight: 1,
          }).addTo(group);

          // Officer Pin
          const officerIcon = L.divIcon({
            className: 'custom-gps-pin',
            html: `
              <div style="background-color: ${isMismatch ? '#DC2626' : '#2563EB'}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
                <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          L.marker([gpsCoords.latitude, gpsCoords.longitude], { icon: officerIcon })
            .addTo(group)
            .bindPopup(`<b>Officer GPS Location</b><br>Lat: ${gpsCoords.latitude.toFixed(5)}<br>Lng: ${gpsCoords.longitude.toFixed(5)}<br>Accuracy: ±${gpsCoords.accuracyMeters.toFixed(1)}m`);

          map.setView([gpsCoords.latitude, gpsCoords.longitude], 17);
        } else if (selectedZone) {
          map.setView([selectedZone.latitude, selectedZone.longitude], 16);
        }
      } catch (e) {
        console.error('Failed to initialize Leaflet GPS map:', e);
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [gpsCoords, selectedZone, allZones]);

  return (
    <div className="space-y-2">
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border border-slate-200 overflow-hidden relative shadow-inner z-0"
      />

      {/* Geofence verification status banner */}
      {gpsCoords && selectedZone && (
        <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
          isMismatch 
            ? 'bg-amber-50 border-amber-300 text-amber-900' 
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2">
            {isMismatch ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {isMismatch ? 'Zone Proximity Mismatch Alert' : 'GPS Zone Geofence Match'}
              </span>
              <span className="block text-[11px] opacity-80">
                {isMismatch 
                  ? `Device GPS is ${distanceToZone}m from ${selectedZone.name} (exceeds ${selectedZone.radiusMeters}m zone perimeter). Flagged for supervisor review.`
                  : `Coordinates are within ${selectedZone.radiusMeters}m radius of ${selectedZone.name} (${distanceToZone}m away).`}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/80 border border-current shrink-0">
            {isMismatch ? 'Mismatch Flagged' : 'Geofence Verified'}
          </span>
        </div>
      )}
    </div>
  );
};
