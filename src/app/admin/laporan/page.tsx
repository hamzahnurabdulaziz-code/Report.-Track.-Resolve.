'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  Filter,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { AdminTopbar } from '@/components/admin-topbar';
import { PriorityBadge } from '@/components/priority-badge';
import { StatusBadge } from '@/components/status-badge';
import { UpdateStatusModal } from '@/components/update-status-modal';
import { DataStore } from '@/lib/data-store';
import { Report, ReportCategory, ReportStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminLaporanPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus laporan ini secara permanen?')) {
      await DataStore.deleteReport(id);
      loadData();
    }
  };

  const filtered = reports.filter((r) => {
    if (selectedStatus !== 'semua' && r.status !== selectedStatus) return false;
    if (selectedCategory !== 'semua' && r.category_id !== selectedCategory) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.tracking_code.toLowerCase().includes(q) ||
        r.location_name.toLowerCase().includes(q) ||
        r.reporter_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      <AdminTopbar
        title="Manajemen Seluruh Laporan"
        subtitle="Daftar lengkap laporan warga, riwayat tindak lanjut, dan disposisi dinas"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      <main className="p-6 space-y-6">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-2">Filter:</span>
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

          <div className="flex items-center gap-2">
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

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="py-3.5 pl-6 pr-3">Laporan</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5">Prioritas</th>
                  <th className="px-3 py-3.5">Kategori / Dinas</th>
                  <th className="px-3 py-3.5">Petugas</th>
                  <th className="px-3 py-3.5">Lokasi</th>
                  <th className="px-3 py-3.5">Pelapor & Tanggal</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedReport(item);
                      setIsUpdateModalOpen(true);
                    }}
                  >
                    <td className="py-4 pl-6 pr-3 font-medium">
                      <div className="max-w-[200px]">
                        <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                        <p className="font-mono text-[11px] text-blue-600 font-bold mt-0.5">
                          {item.tracking_code}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-3 py-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-semibold text-slate-800">{item.category_name}</p>
                      <p className="text-[10px] text-slate-400">{item.department}</p>
                    </td>
                    <td className="px-3 py-4 text-slate-700">
                      {item.assigned_officer_name || (
                        <span className="text-slate-400 italic">Belum ditugaskan</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-slate-600 truncate max-w-[140px]">
                      {item.location_name}
                    </td>
                    <td className="px-3 py-4 text-slate-500 text-[11px]">
                      <p className="font-semibold text-slate-800">{item.reporter_name}</p>
                      <p className="text-slate-400">{formatDate(item.created_at)}</p>
                    </td>
                    <td
                      className="py-4 pl-3 pr-6 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedReport(item);
                            setIsUpdateModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                          title="Tindak Lanjut & Ubah Status"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/laporan/${item.id}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Hapus Laporan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <UpdateStatusModal
        report={selectedReport}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdated={loadData}
      />
    </div>
  );
}
