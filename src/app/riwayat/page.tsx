'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  PlusCircle,
  Search,
} from 'lucide-react';
import { PriorityBadge } from '@/components/priority-badge';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/data-store';
import { Report, ReportStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function RiwayatLaporanPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await DataStore.getReports();
        // If user is logged in, show their reports or all reports if demo
        if (user && user.role !== 'admin') {
          const userReports = all.filter(
            (r) =>
              r.user_id === user.id ||
              r.reporter_name.toLowerCase() === user.full_name.toLowerCase() ||
              r.reporter_email === user.email
          );
          setReports(userReports.length > 0 ? userReports : all.slice(0, 4));
        } else {
          setReports(all);
        }
      } catch (err) {
        console.error('Failed to load my reports:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = reports.filter((r) => {
    if (selectedStatus !== 'semua' && r.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Riwayat Laporan Saya
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Pantau seluruh laporan keluhan fasilitas yang telah Anda ajukan
            </p>
          </div>
          <Link
            href="/laporan/buat"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Buat Laporan Baru</span>
          </Link>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 mr-2">Filter Status:</span>
          {(['semua', 'menunggu', 'diproses', 'selesai', 'ditolak'] as const).map((st) => (
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
        </div>

        {/* Reports List */}
        {isLoading ? (
          <div className="mt-12 flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-xs font-medium">Memuat riwayat laporan...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
              >
                {item.image_url && (
                  <div className="h-32 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {item.tracking_code}
                        </span>
                        <StatusBadge status={item.status} size="sm" />
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <Link href={`/laporan/${item.id}`}>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate max-w-[200px]">{item.location_name}</span>
                    </span>

                    <Link
                      href={`/laporan/${item.id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Pantau Perkembangan &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">Belum ada riwayat laporan</h3>
            <p className="mt-1 text-xs text-slate-500">
              Anda belum membuat laporan keluhan pada kategori atau status ini.
            </p>
            <Link
              href="/laporan/buat"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Buat Laporan Pertama Anda
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
