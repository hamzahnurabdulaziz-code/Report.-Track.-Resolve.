'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Filter, Layers, MapPin, PlusCircle, Search } from 'lucide-react';
import InteractiveMap from '@/components/interactive-map';
import { PriorityBadge } from '@/components/priority-badge';
import { StatusBadge } from '@/components/status-badge';
import { DataStore } from '@/lib/data-store';
import { Report, ReportCategory, ReportStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function PetaLaporanPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [reps, cats] = await Promise.all([
          DataStore.getReports(),
          DataStore.getCategories(),
        ]);
        setReports(reps);
        setCategories(cats);
        if (reps.length > 0) {
          setSelectedReport(reps[0]);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (selectedStatus !== 'semua' && r.status !== selectedStatus) return false;
    if (selectedCategory !== 'semua' && r.category_id !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Peta Sebaran Laporan Warga
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Visualisasi geografis sebaran titik masalah fasilitas umum di wilayah pemukiman
            </p>
          </div>
          <Link
            href="/laporan/buat"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Laporkan Masalah</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-2">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Status:</span>
          </div>

          {(['semua', 'menunggu', 'diproses', 'selesai'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="semua">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Map & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Map (8 cols) */}
          <div className="lg:col-span-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <InteractiveMap
              reports={filteredReports}
              center={
                selectedReport?.latitude && selectedReport?.longitude
                  ? [selectedReport.latitude, selectedReport.longitude]
                  : [-6.2088, 106.8456]
              }
              zoom={13}
              height="600px"
            />
          </div>

          {/* Side Panel: Issues List & Selected Issue (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Daftar Titik Laporan ({filteredReports.length})
              </h3>

              <div className="space-y-2.5">
                {filteredReports.map((r) => {
                  const isSelected = selectedReport?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[11px] font-bold text-blue-600">
                          {r.tracking_code}
                        </span>
                        <StatusBadge status={r.status} size="sm" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{r.title}</h4>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{r.location_name}</span>
                      </p>
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] text-slate-400">
                        <span>{formatDate(r.created_at)}</span>
                        <Link
                          href={`/laporan/${r.id}`}
                          className="font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          Detail &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
