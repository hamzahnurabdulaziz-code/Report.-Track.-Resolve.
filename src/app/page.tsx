'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Construction,
  Droplets,
  FileText,
  Lightbulb,
  MapPin,
  Megaphone,
  PhoneCall,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { ReportCard } from '@/components/report-card';
import { DataStore } from '@/lib/data-store';
import { Announcement, DashboardStats, EmergencyContact, Report, ReportCategory } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'semua' | 'menunggu' | 'diproses' | 'selesai'>('semua');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [reps, cats, anns, ems, st] = await Promise.all([
          DataStore.getReports(),
          DataStore.getCategories(),
          DataStore.getAnnouncements(),
          DataStore.getEmergencyContacts(),
          DataStore.getDashboardStats(),
        ]);
        setReports(reps);
        setCategories(cats);
        setAnnouncements(anns.slice(0, 3));
        setEmergencyContacts(ems.slice(0, 4));
        setStats(st);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (activeTab === 'semua') return true;
    return r.status === activeTab;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION - Matching CivicResolve Reference */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50/50 py-20 lg:py-28">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Badge: Empowering Civic Engagement */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-blue-800 shadow-xs backdrop-blur-xs">
            <span className="text-amber-500">💡</span>
            <span>Empowering Civic Engagement</span>
          </div>

          {/* Big Headline */}
          <h1 className="mt-8 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900">
            Report. Track.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Resolve.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
            BantuWarga memberdayakan masyarakat untuk melaporkan masalah fasilitas umum seperti jalan
            rusak, penumpukan sampah, dan lampu jalan mati. Membantu aparatur mengelola dan menuntaskan
            masalah lingkungan secara transparan dengan pelacakan langsung.
          </p>

          {/* Dual Action CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href="/laporan/buat"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all sm:w-auto"
            >
              <span>Laporkan Masalah Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/laporan"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all sm:w-auto"
            >
              Lihat Daftar Laporan
            </Link>
          </div>

          {/* 2. STATS ROW - Exactly matching the reference counter row */}
          <div className="mt-20 grid grid-cols-2 gap-8 border-y border-slate-200/80 py-10 sm:grid-cols-4">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                12,458
              </p>
              <p className="mt-1.5 text-xs font-medium text-slate-500">Laporan Diterima</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                9,234
              </p>
              <p className="mt-1.5 text-xs font-medium text-slate-500">Masalah Terselesaikan</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                3,567
              </p>
              <p className="mt-1.5 text-xs font-medium text-slate-500">Warga Aktif Berperan</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                2.3 hari
              </p>
              <p className="mt-1.5 text-xs font-medium text-slate-500">Rata-rata Penanganan</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW BANTUWARGA WORKS */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Bagaimana BantuWarga Bekerja
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Platform komprehensif yang dirancang untuk menjembatani kesenjangan antara warga dan
              aparatur kelurahan/dinas demi resolusi masalah yang efektif dan transparan.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-extrabold text-lg">
                1
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Foto & Laporkan</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Foto masalah fasilitas yang Anda temukan di jalan atau lingkungan, pilih kategori dan
                tandai lokasi masalah pada peta.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-extrabold text-lg">
                2
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Verifikasi & Disposisi</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Sistem dan admin memverifikasi keabsahan laporan dan meneruskannya ke dinas terkait
                (Bina Marga, DLH, Dishub, atau Satpol PP).
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600 font-extrabold text-lg">
                3
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Tindak Lanjut Petugas</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Petugas lapangan ditugaskan langsung ke titik koordinat untuk melakukan perbaikan
                infrastruktur atau penanganan kebersihan.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-extrabold text-lg">
                4
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Selesai & Transparan</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Warga mendapatkan notifikasi progres dan dapat melihat foto bukti penyelesaian secara
                terbuka di halaman riwayat laporan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATEGORIES SECTION */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Kategori Masalah Fasilitas Umum
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Pilih kategori yang sesuai untuk mempercepat proses penanganan dinas terkait
              </p>
            </div>
            <Link
              href="/laporan"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Lihat semua kategori</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/laporan?kategori=${cat.id}`}
                className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <Construction className="h-6 w-6" />
                </div>
                <h4 className="mt-3 text-xs font-bold text-slate-900 group-hover:text-blue-600">
                  {cat.name}
                </h4>
                <p className="mt-1 text-[10px] text-slate-500 line-clamp-1">{cat.department}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RECENT PUBLIC ISSUES (CivicResolve Style) */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Laporan Warga Terkini
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Pantau laporan yang telah diajukan masyarakat di lingkungan sekitar secara real-time
              </p>
            </div>

            {/* Filter Tabs matching Civic aesthetic */}
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
              {(['semua', 'menunggu', 'diproses', 'selesai'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3.5 py-1.5 capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReports.slice(0, 6).map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onUpvoted={() => {
                  DataStore.getReports().then(setReports);
                }}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/laporan"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50"
            >
              <span>Jelajahi Semua Laporan Warga</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. ANNOUNCEMENTS & EMERGENCY CONTACTS */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Announcements (8 cols) */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Pengumuman & Agenda Warga</h3>
                  <p className="text-xs text-slate-500">
                    Informasi gotong royong, posyandu, dan agenda sosial kemasyarakatan
                  </p>
                </div>
                <Link
                  href="/pengumuman"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Lihat Semua &rarr;
                </Link>
              </div>

              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    {ann.image_url && (
                      <div className="h-32 w-full sm:w-40 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={ann.image_url}
                          alt={ann.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-blue-600 font-semibold mb-1">
                          <span className="rounded bg-blue-50 px-2 py-0.5 capitalize">
                            {ann.category.replace('_', ' ')}
                          </span>
                          {ann.is_pinned && (
                            <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700 font-bold">
                              📌 Penting
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{ann.title}</h4>
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {ann.content}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{ann.location || 'Wilayah RW'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(ann.event_date || ann.created_at)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contacts (5 cols) */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Kontak Darurat Cepat</h3>
                  <p className="text-xs text-slate-500">Nomor siaga resmi instansi pemerintah</p>
                </div>
                <Link
                  href="/kontak-darurat"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Direktori &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{contact.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{contact.description}</p>
                    </div>
                    <a
                      href={`tel:${contact.phone_number.replace(/\s+/g, '')}`}
                      className="ml-3 shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>{contact.phone_number}</span>
                    </a>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900">
                <p className="font-bold flex items-center gap-1.5 text-blue-800">
                  <ShieldAlert className="h-4 w-4" />
                  Keadaan Darurat Mengancam Jiwa?
                </p>
                <p className="mt-1 text-[11px] text-blue-700 leading-relaxed">
                  Segera hubungi <strong>112 (Panggilan Darurat Bebas Pulsa)</strong> untuk respon
                  terpadu darurat pemadam, medis, dan kepolisian.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Punya Keluhan atau Saran Fasilitas di Lingkungan Anda?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-blue-100 leading-relaxed">
            Laporkan langsung melalui BantuWarga. Laporan Anda tercatat secara resmi dan dapat dipantau
            secara transparan hingga selesai ditangani oleh dinas berwenang.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/laporan/buat"
              className="rounded-xl bg-white px-6 py-3 text-xs font-bold text-blue-700 shadow-md hover:bg-blue-50 transition-all"
            >
              + Buat Laporan Warga Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
