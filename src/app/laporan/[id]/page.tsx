'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  MapPin,
  Share2,
  ShieldCheck,
  ThumbsUp,
  User,
  XCircle,
} from 'lucide-react';
import InteractiveMap from '@/components/interactive-map';
import { PriorityBadge } from '@/components/priority-badge';
import { StatusBadge } from '@/components/status-badge';
import { UpdateStatusModal } from '@/components/update-status-modal';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/data-store';
import { Report } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';

function LaporanDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const id = params?.id as string;
  const isNewlyCreated = searchParams?.get('created') === 'true';

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      try {
        const data = await DataStore.getReportById(id);
        if (data) {
          setReport(data);
          setUpvotes(data.upvotes_count || 0);
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleUpvote = async () => {
    if (hasUpvoted || !report) return;
    setHasUpvoted(true);
    setUpvotes((prev) => prev + 1);
    await DataStore.upvoteReport(report.id);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Memuat detail laporan...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Laporan Tidak Ditemukan</h2>
          <p className="mt-1 text-xs text-slate-500">
            Laporan dengan ID tersebut tidak tersedia atau sudah dihapus.
          </p>
          <Link
            href="/laporan"
            className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white"
          >
            Kembali ke Daftar Laporan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation & Success Alert */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/laporan"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Laporan</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-500" />
              <span>{copyFeedback ? 'Tautan Disalin!' : 'Bagikan'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Tindak Lanjut (Admin)</span>
              </button>
            )}
          </div>
        </div>

        {isNewlyCreated && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">Laporan Anda Berhasil Dikirim!</p>
              <p className="text-emerald-700">
                Nomor pelacakan resmi Anda adalah{' '}
                <strong className="font-mono text-emerald-900">{report.tracking_code}</strong>. Simpan
                nomor ini untuk memantau progres perbaikan.
              </p>
            </div>
          </div>
        )}

        {/* Main Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Content, Photo, Location Map */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              {/* Badges & Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-extrabold text-blue-600">
                    {report.tracking_code}
                  </span>
                  <StatusBadge status={report.status} size="md" />
                  <PriorityBadge priority={report.priority} />
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: report.category_color || '#3b82f6' }}
                >
                  {report.category_name}
                </span>
              </div>

              {/* Title & Reporter */}
              <div className="mt-5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {report.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Pelapor: {report.reporter_name}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatDate(report.created_at)}</span>
                  </span>
                  <span className="text-blue-600 font-medium">Dinas: {report.department}</span>
                </div>
              </div>

              {/* Photo */}
              {report.image_url && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <img
                    src={report.image_url}
                    alt={report.title}
                    className="max-h-[420px] w-full object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Deskripsi Kerusakan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                  {report.description}
                </p>
              </div>

              {/* Upvote Button Bar */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  onClick={handleUpvote}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    hasUpvoted
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{hasUpvoted ? 'Didukung Warga' : 'Dukung Penanganan Ini'} ({upvotes})</span>
                </button>

                {report.assigned_officer_name && (
                  <div className="text-xs text-right text-slate-500">
                    <span className="block text-[10px] text-slate-400">Petugas Ditugaskan:</span>
                    <strong className="text-slate-800">{report.assigned_officer_name}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Map Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Titik Lokasi Masalah</span>
              </h3>
              <p className="text-xs text-slate-600 mb-4">{report.location_name}</p>

              {report.latitude && report.longitude && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <InteractiveMap
                    reports={[report]}
                    center={[report.latitude, report.longitude]}
                    zoom={15}
                    height="280px"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Progress Timeline (Status History) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Perkembangan Tindak Lanjut</span>
              </h3>

              {/* Timeline Items */}
              <div className="mt-5 relative border-l-2 border-slate-200 ml-3.5 space-y-6 pb-2">
                {report.history && report.history.length > 0 ? (
                  report.history.map((hist, idx) => (
                    <div key={hist.id || idx} className="relative pl-6">
                      {/* Timeline dot */}
                      <span className="absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-4 ring-white">
                        {hist.new_status === 'selesai' ? (
                          <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        ) : hist.new_status === 'diproses' ? (
                          <span className="h-3 w-3 rounded-full bg-amber-500" />
                        ) : hist.new_status === 'ditolak' ? (
                          <span className="h-3 w-3 rounded-full bg-slate-400" />
                        ) : (
                          <span className="h-3 w-3 rounded-full bg-rose-500" />
                        )}
                      </span>

                      <div>
                        <div className="flex items-center justify-between">
                          <StatusBadge status={hist.new_status} size="sm" />
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(hist.created_at)}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {hist.notes || 'Status diperbarui oleh petugas.'}
                        </p>

                        {/* Proof image if any */}
                        {hist.proof_image_url && (
                          <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                            <img
                              src={hist.proof_image_url}
                              alt="Bukti Pengerjaan"
                              className="h-28 w-full object-cover"
                            />
                            <span className="block bg-slate-50 px-2 py-1 text-[10px] text-slate-500 font-medium">
                              📷 Foto Bukti Pengerjaan Lapangan
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white" />
                    <div>
                      <StatusBadge status={report.status} size="sm" />
                      <p className="mt-2 text-xs text-slate-600">
                        Laporan telah diterima dalam sistem dan sedang dalam antrean pemeriksaan.
                      </p>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        {formatDateTime(report.created_at)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-xs">
              <h4 className="font-bold text-slate-900 mb-1">Butuh Bantuan Segera?</h4>
              <p className="text-slate-500 mb-3 text-[11px]">
                Jika kondisi darurat mengancam keselamatan umum, segera hubungi kontak darurat.
              </p>
              <Link
                href="/kontak-darurat"
                className="block text-center rounded-xl bg-slate-100 py-2 font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Lihat Direktori Nomor Darurat &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Update Modal */}
      {isAdmin && (
        <UpdateStatusModal
          report={report}
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdated={(updated) => {
            setReport(updated);
          }}
        />
      )}
    </div>
  );
}

export default function LaporanDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <LaporanDetailContent />
    </Suspense>
  );
}
