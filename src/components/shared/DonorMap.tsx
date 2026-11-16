import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BloodBank, BloodRequest, DonorProfile } from '../../types/database';

interface DonorMapProps {
  donors: DonorProfile[];
  bloodBanks?: BloodBank[];
  activeRequests?: BloodRequest[];
  center?: { lat: number; lng: number };
  zoom?: number;
  heightClass?: string;
}

export const DonorMap: React.FC<DonorMapProps> = ({
  donors,
  bloodBanks = [],
  activeRequests = [],
  center = { lat: 23.8103, lng: 90.4125 },
  zoom = 7,
  heightClass = 'h-[360px] lg:h-[460px]',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    map.whenReady(() => {
      setTimeout(() => map.invalidateSize(), 120);
    });

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    donors.forEach((donor) => {
      const marker = L.circleMarker([donor.latitude, donor.longitude], {
        radius: 8,
        fillColor: donor.isAvailable ? '#9F1239' : '#64748B',
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      });
      marker.bindPopup(
        `<div style="min-width:160px">
          <div style="font-weight:700;color:#0F172A;font-size:13px">${donor.fullName} (${donor.bloodGroup})</div>
          <div style="color:#475569;font-size:12px;margin-top:2px">${donor.unionName}, ${donor.upazila}</div>
          <div style="color:${donor.isAvailable ? '#15803D' : '#64748B'};font-size:11px;font-weight:600;margin-top:4px">
            ${donor.isAvailable ? 'Available' : 'Paused'}${donor.isVerified ? ' · Verified' : ''}
          </div>
        </div>`
      );
      marker.addTo(group);
    });

    bloodBanks.forEach((bank) => {
      const marker = L.circleMarker([bank.latitude, bank.longitude], {
        radius: 9,
        fillColor: '#0F172A',
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95,
      });
      marker.bindPopup(
        `<div style="min-width:180px">
          <div style="font-weight:700;color:#0F172A;font-size:13px">${bank.name}</div>
          <div style="color:#475569;font-size:12px;margin-top:2px">${bank.address}</div>
          <div style="color:#9F1239;font-size:11px;font-weight:600;margin-top:4px">${bank.phone}</div>
        </div>`
      );
      marker.addTo(group);
    });

    activeRequests.forEach((req) => {
      const marker = L.circleMarker([req.latitude, req.longitude], {
        radius: 10,
        fillColor: '#DC2626',
        color: '#FEE2E2',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.95,
      });
      marker.bindPopup(
        `<div style="min-width:170px">
          <div style="font-weight:700;color:#DC2626;font-size:13px">Urgent Need: ${req.bloodGroup} (${req.bagsNeeded} bags)</div>
          <div style="color:#0F172A;font-size:12px;margin-top:2px">${req.hospitalName || req.unionName}</div>
        </div>`
      );
      marker.addTo(group);
    });

    if (center) {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }
  }, [donors, bloodBanks, activeRequests, center.lat, center.lng, zoom]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <div
        ref={containerRef}
        data-testid="roktodaan-leaflet-map"
        className={`w-full ${heightClass}`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-800" aria-hidden="true" />
            Available Donor
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900" aria-hidden="true" />
            Blood Bank / Hospital
          </span>
          {activeRequests.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" aria-hidden="true" />
              Active Request
            </span>
          )}
        </div>
        <span className="font-mono tabular-nums text-slate-500">
          {donors.length} donors · {bloodBanks.length} banks
        </span>
      </div>
    </div>
  );
};
