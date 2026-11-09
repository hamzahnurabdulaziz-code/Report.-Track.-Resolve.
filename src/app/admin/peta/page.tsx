'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Filter, Layers, MapPin, RefreshCw } from 'lucide-react';
import { AdminTopbar } from '@/components/admin-topbar';
import InteractiveMap from '@/components/interactive-map';
import { StatusBadge } from '@/components/status-badge';
import { DataStore } from '@/lib/data-store';
import { Report } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminPetaPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const loadData = async () => {
    const data = await DataStore.getReports();
    setReports(data);
    if (data.length > 0) {
      setSelectedReport(data[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = reports.filter((r) => {
    if (selectedStatus !== 'semua' && r.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      <AdminTopbar
        title="Admin Issues Map (GIS)"
        subtitle="Pantau titik persebaran insiden dan penugasan lapangan secara spasial"
        onRefresh={loadData}
      />

      <main className="p-6 space-y-6 flex-1 flex flex-col">
        {/* Filter bar */}
        <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 mr-2">Filter Status:</span>
          {(['semua', 'menunggu', 'diproses', 'selesai', 'ditolak'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Fullscreen Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
          <div className="lg:col-span-9 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <InteractiveMap
              reports={filtered}
              height="650px"
              zoom={13}
              center={
                selectedReport?.latitude && selectedReport?.longitude
                  ? [selectedReport.latitude, selectedReport.longitude]
                  : [-6.2088, 106.8456]
              }
            />
          </div>

          <div className="lg:col-span-3 space-y-3 max-h-[650px] overflow-y-auto">
            <h4 className="text-xs font-bold uppercase text-slate-400">
              Titik Laporan ({filtered.length})
            </h4>
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedReport(item)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedReport?.id === item.id
                    ? 'border-blue-500 bg-blue-50/80 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-blue-600">
                    {item.tracking_code}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">📍 {item.location_name}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
