'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpDown,
  Filter,
  PlusCircle,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ReportCard } from '@/components/report-card';
import { DataStore } from '@/lib/data-store';
import { Report, ReportCategory, ReportStatus } from '@/lib/types';

function LaporanContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('kategori');

  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [sortBy, setSortBy] = useState<'terbaru' | 'terlama' | 'terpopuler'>('terbaru');
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
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Filtering & sorting logic
  const filteredReports = reports
    .filter((r) => {
      // Status filter
      if (selectedStatus !== 'semua' && r.status !== selectedStatus) return false;

      // Category filter
      if (selectedCategory !== 'semua') {
        const matchedCat =
          r.category_id === selectedCategory ||
          categories.find((c) => c.slug === selectedCategory)?.id === r.category_id;
        if (!matchedCat) return false;
      }

      // Search filter
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location_name.toLowerCase().includes(q) ||
          r.tracking_code.toLowerCase().includes(q)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'terlama') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'terpopuler') {
        return (b.upvotes_count || 0) - (a.upvotes_count || 0);
      }
      // default: terbaru
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('semua');
    setSelectedStatus('semua');
    setSortBy('terbaru');
  };

  const hasActiveFilters =
    searchTerm !== '' || selectedCategory !== 'semua' || selectedStatus !== 'semua';

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Daftar Laporan Warga
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Pantau laporan masalah fasilitas umum dan perkembangannya di lingkungan Anda
            </p>
          </div>
          <Link
            href="/laporan/buat"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Buat Laporan Baru</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {/* Search input (5 cols) */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari judul, ID laporan, jalan, RT/RW..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category Dropdown (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="semua">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="semua">Semua Status</option>
                <option value="menunggu">Menunggu</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>

            {/* Sort Dropdown (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="terpopuler">Dukungan Terbanyak</option>
              </select>
            </div>
          </div>

          {/* Quick status tabs & clear button */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Status Cepat:</span>
              {(['semua', 'menunggu', 'diproses', 'selesai', 'ditolak'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                    selectedStatus === st
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Results summary */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <p>
            Menampilkan <strong className="text-slate-800">{filteredReports.length}</strong> laporan
          </p>
        </div>

        {/* Grid Reports */}
        {isLoading ? (
          <div className="mt-12 flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-xs font-medium">Memuat data laporan...</p>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onUpvoted={() => {
                  DataStore.getReports().then(setReports);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">Tidak ada laporan yang cocok</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              Coba sesuaikan kata kunci pencarian atau ubah filter status dan kategori Anda.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Hapus Semua Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LaporanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <LaporanContent />
    </Suspense>
  );
}
