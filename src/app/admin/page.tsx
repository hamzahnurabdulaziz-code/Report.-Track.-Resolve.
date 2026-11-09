'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  MapPin,
  MoreHorizontal,
  RefreshCw,
  Shield,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { AdminTopbar } from '@/components/admin-topbar';
import InteractiveMap from '@/components/interactive-map';
import { PriorityBadge } from '@/components/priority-badge';
import { StatusBadge } from '@/components/status-badge';
import { UpdateStatusModal } from '@/components/update-status-modal';
import { DataStore } from '@/lib/data-store';
import { DashboardStats, Report, ReportStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('semua');
  const [selectedReportForUpdate, setSelectedReportForUpdate] = useState<Report | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [allReports, dbStats] = await Promise.all([
        DataStore.getReports(),
        DataStore.getDashboardStats(),
      ]);
      setReports(allReports);
      setStats(dbStats);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenUpdate = (report: Report) => {
    setSelectedReportForUpdate(report);
    setIsUpdateModalOpen(true);
  };

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (selectedStatus !== 'semua' && r.status !== selectedStatus) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.tracking_code.toLowerCase().includes(q) ||
        r.location_name.toLowerCase().includes(q) ||
        r.reporter_name.toLowerCase().includes(q) ||
        (r.department && r.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      {/* Topbar matching Screenshot 2 */}
      <AdminTopbar
        title="Dashboard Overview"
        subtitle="Manage civic issues and track city maintenance"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Main content body */}
      <main className="flex-1 p-6 space-y-6">
        {/* ROW 1: 4 Metric Stat Cards matching Screenshot 2 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {/* 1. Open Issues */}
          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-xs transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Open Issues</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {stats?.openIssues ?? 23}
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="font-bold text-emerald-600">
                +{stats?.openDeltaPercent ?? 12}%
              </span>
              <span className="ml-1 text-slate-500">from last month</span>
            </div>
          </div>

          {/* 2. In Progress */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 shadow-xs transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">In Progress</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {stats?.inProgressIssues ?? 15}
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="font-bold text-amber-600">
                {stats?.inProgressDeltaPercent ?? 8}%
              </span>
              <span className="ml-1 text-slate-500">from last month</span>
            </div>
          </div>

          {/* 3. Resolved Today */}
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-xs transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Resolved Today</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {stats?.resolvedIssues ?? 8}
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="font-bold text-emerald-600">
                +{stats?.resolvedDeltaPercent ?? 23}%
              </span>
              <span className="ml-1 text-slate-500">from last month</span>
            </div>
          </div>

          {/* 4. Avg Resolution */}
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-5 shadow-xs transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Avg Resolution</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {stats?.avgResolutionDays ?? 4.2} days
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="font-bold text-blue-600">15%</span>
              <span className="ml-1 text-slate-500">from last month</span>
            </div>
          </div>
        </div>

        {/* ROW 2: Issues Map & Officers Card (matching Screenshot 2) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Issues Map (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Issues Map</h3>
              </div>
              <Link
                href="/admin/peta"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Full Screen Map &rarr;
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <InteractiveMap reports={reports} height="360px" zoom={12} />
            </div>
          </div>

          {/* Right: Active Officers & Coverage Areas (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Active Officers Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Active Officers</span>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {stats?.activeOfficers ?? 12}
              </p>
              <p className="mt-1 text-xs text-slate-500">Currently assigned to issues</p>
            </div>

            {/* Coverage Areas Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Coverage Areas</span>
                <Shield className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {stats?.coverageAreas ?? 8}
              </p>
              <p className="mt-1 text-xs text-slate-500">Districts being monitored</p>
            </div>

            {/* Citizen Portal Shortcut */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-blue-900">Platform BantuWarga</h4>
                <p className="mt-1 text-[11px] text-blue-700 leading-relaxed">
                  Laporan masyarakat disinkronkan secara langsung. Anda dapat mengubah status,
                  menugaskan petugas, dan mencatat progres pekerjaan.
                </p>
              </div>
              <Link
                href="/"
                className="mt-4 inline-flex items-center justify-between text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                <span>Buka Beranda Warga</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 3: Recent Issues Data Table (matching Screenshot 2) */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Table Header Controls */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Issues</h3>
              <p className="text-xs text-slate-500">
                Kelola laporan terkini dan mutakhirkan status penanganan
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 p-1 text-xs">
              {(['semua', 'menunggu', 'diproses', 'selesai', 'ditolak'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`rounded-full px-3 py-1 capitalize font-medium transition-all ${
                    selectedStatus === st
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="py-3.5 pl-6 pr-3">Issue</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5">Priority</th>
                  <th className="px-3 py-3.5">Department</th>
                  <th className="px-3 py-3.5">Assignee</th>
                  <th className="px-3 py-3.5">Location</th>
                  <th className="px-3 py-3.5">Reported</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => handleOpenUpdate(report)}
                  >
                    {/* Issue Title & ID */}
                    <td className="py-4 pl-6 pr-3 font-medium">
                      <div className="max-w-[200px]">
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1">
                          {report.title}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                          ID: {report.tracking_code}
                        </p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 py-4">
                      <StatusBadge status={report.status} size="sm" />
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-4">
                      <PriorityBadge priority={report.priority} />
                    </td>

                    {/* Department / Category */}
                    <td className="px-3 py-4 text-slate-600">
                      <div className="max-w-[150px]">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {report.category_name}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {report.department}
                        </p>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="px-3 py-4 text-slate-700">
                      {report.assigned_officer_name ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                            {report.assigned_officer_name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800 truncate max-w-[110px]">
                            {report.assigned_officer_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum ditugaskan</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-3 py-4 text-slate-600">
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{report.location_name}</span>
                      </span>
                    </td>

                    {/* Reported */}
                    <td className="px-3 py-4 text-slate-500">
                      <div className="text-[11px]">
                        <p className="font-medium text-slate-700">
                          {formatDate(report.created_at)}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[100px]">
                          & {report.reporter_name}
                        </p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-4 pl-3 pr-6 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenUpdate(report)}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Tindak Lanjut / Ubah Status"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/laporan/${report.id}`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Lihat Detail Halaman"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-xs text-slate-500">
            <span>
              Menampilkan {filteredReports.length} dari {reports.length} total laporan
            </span>
            <Link
              href="/admin/laporan"
              className="font-bold text-blue-600 hover:underline"
            >
              Lihat Seluruh Arsip Laporan &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Modal Update Status */}
      <UpdateStatusModal
        report={selectedReportForUpdate}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdated={(updated) => {
          loadData();
        }}
      />
    </div>
  );
}
