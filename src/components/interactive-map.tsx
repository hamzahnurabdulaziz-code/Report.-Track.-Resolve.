'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Report } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { PriorityBadge } from './priority-badge';

interface InteractiveMapProps {
  reports?: Report[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  isPicker?: boolean;
  selectedCoord?: [number, number] | null;
  onSelectCoord?: (lat: number, lng: number) => void;
  className?: string;
}

export default function InteractiveMap({
  reports = [],
  center = [-6.2088, 106.8456], // Default Jakarta Center
  zoom = 13,
  height = '480px',
  isPicker = false,
  selectedCoord,
  onSelectCoord,
  className = '',
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let L: any;
    let isCancelled = false;

    async function loadMap() {
      try {
        L = await import('leaflet');

        if (isCancelled || !mapContainerRef.current) return;

        // Clean up previous instance if exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: selectedCoord || center,
          zoom: zoom,
          scrollWheelZoom: true,
        });

        // OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;

        // In picker mode, allow user to click on map to choose location
        if (isPicker) {
          let currentMarker: any = null;

          if (selectedCoord) {
            const pickerIcon = L.divIcon({
              className: 'custom-picker-pin',
              html: `
                <div style="background-color: #2563eb; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transform: translate(-50%, -50%);"></div>
              `,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            });
            currentMarker = L.marker(selectedCoord, { icon: pickerIcon }).addTo(map);
          }

          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            if (onSelectCoord) {
              onSelectCoord(lat, lng);
            }
            if (currentMarker) {
              currentMarker.setLatLng([lat, lng]);
            } else {
              const pickerIcon = L.divIcon({
                className: 'custom-picker-pin',
                html: `
                  <div style="background-color: #2563eb; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transform: translate(-50%, -50%);"></div>
                `,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              });
              currentMarker = L.marker([lat, lng], { icon: pickerIcon }).addTo(map);
            }
          });

          return;
        }

        // Render report markers
        reports.forEach((report) => {
          if (!report.latitude || !report.longitude) return;

          let color = '#ef4444'; // Menunggu
          if (report.status === 'diproses') color = '#f59e0b';
          if (report.status === 'selesai') color = '#10b981';
          if (report.status === 'ditolak') color = '#64748b';

          const customIcon = L.divIcon({
            className: 'report-map-marker',
            html: `
              <div style="
                background-color: ${color};
                width: 18px;
                height: 18px;
                border-radius: 50%;
                border: 2.5px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.35);
                position: relative;
                cursor: pointer;
              ">
                <span style="
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;
                  background-color: ${color};
                  opacity: 0.4;
                  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></span>
              </div>
            `,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });

          const marker = L.marker([report.latitude, report.longitude], {
            icon: customIcon,
          }).addTo(markersLayer);

          const popupContent = `
            <div style="padding: 4px; font-family: inherit; max-width: 240px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 11px; font-weight: 700; color: #2563eb;">${report.tracking_code}</span>
                <span style="font-size: 10px; padding: 2px 6px; border-radius: 9999px; background: #eff6ff; color: #1e40af; font-weight: 600;">
                  ${report.category_name || 'Laporan'}
                </span>
              </div>
              <h4 style="font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
                ${report.title}
              </h4>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.3;">
                📍 ${report.location_name}
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; border-top: 1px solid #f1f5f9; pt: 6px;">
                <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: ${color};">
                  ${report.status}
                </span>
                <a href="/laporan/${report.id}" style="font-size: 11px; font-weight: 600; color: #2563eb; text-decoration: none;">
                  Lihat Detail &rarr;
                </a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
        });
      } catch (err) {
        console.error('Failed to initialize Leaflet map:', err);
      }
    }

    loadMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, reports, center, zoom, isPicker, selectedCoord, onSelectCoord]);

  if (!isClient) {
    return (
      <div
        style={{ height }}
        className={`flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ${className}`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-xs font-medium">Memuat Peta...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 ${className}`}>
      {/* Map Header Status Legend */}
      {!isPicker && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white/95 px-3 py-1.5 text-[11px] font-medium shadow-md backdrop-blur-xs">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Menunggu
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Diproses
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Selesai
          </span>
        </div>
      )}

      {isPicker && (
        <div className="absolute top-3 left-3 z-[1000] rounded-xl border border-blue-200 bg-blue-50/90 px-3 py-1.5 text-[11px] font-medium text-blue-800 shadow-sm backdrop-blur-xs">
          📍 Klik pada peta untuk memilih titik lokasi laporan
        </div>
      )}

      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
    </div>
  );
}
