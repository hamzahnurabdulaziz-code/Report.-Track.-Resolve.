import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Building2,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Bantu<span className="text-blue-400">Warga</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Platform layanan aspirasi dan pengaduan fasilitas lingkungan warga secara terbuka,
              transparan, dan terintegrasi langsung dengan aparat serta dinas terkait.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Indonesia Bersatu & Berkelanjutan</span>
            </div>
          </div>

          {/* Navigasi Cepat */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Navigasi Cepat
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/laporan" className="hover:text-blue-400 transition-colors">
                  Daftar Laporan Publik
                </Link>
              </li>
              <li>
                <Link href="/laporan/buat" className="hover:text-blue-400 transition-colors">
                  Buat Laporan Baru
                </Link>
              </li>
              <li>
                <Link href="/peta" className="hover:text-blue-400 transition-colors">
                  Peta Laporan (GIS)
                </Link>
              </li>
              <li>
                <Link href="/pengumuman" className="hover:text-blue-400 transition-colors">
                  Pengumuman & Gotong Royong
                </Link>
              </li>
              <li>
                <Link href="/kontak-darurat" className="hover:text-blue-400 transition-colors">
                  Direktori Kontak Darurat
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategori Laporan */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Kategori Layanan
            </h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/laporan?kategori=jalan-rusak" className="hover:text-blue-400 transition-colors">
                  Jalan Rusak & Trotoar
                </Link>
              </li>
              <li>
                <Link href="/laporan?kategori=sampah-lingkungan" className="hover:text-blue-400 transition-colors">
                  Sampah & Kebersihan
                </Link>
              </li>
              <li>
                <Link href="/laporan?kategori=lampu-jalan" className="hover:text-blue-400 transition-colors">
                  Penerangan Jalan Umum (PJU)
                </Link>
              </li>
              <li>
                <Link href="/laporan?kategori=saluran-air" className="hover:text-blue-400 transition-colors">
                  Saluran Air & Drainase
                </Link>
              </li>
              <li>
                <Link href="/laporan?kategori=keamanan-ketertiban" className="hover:text-blue-400 transition-colors">
                  Keamanan & Ketertiban
                </Link>
              </li>
              <li>
                <Link href="/laporan?kategori=fasilitas-umum" className="hover:text-blue-400 transition-colors">
                  Fasilitas & Taman Kota
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak Darurat Cepat */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Nomor Siaga Darurat
            </h3>
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-800/80 p-2.5 border border-slate-700/60">
                <div>
                  <p className="font-semibold text-white">Darurat Nasional</p>
                  <p className="text-[11px] text-slate-400">Bebas Pulsa 24 Jam</p>
                </div>
                <a
                  href="tel:112"
                  className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-500"
                >
                  112
                </a>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-800/80 p-2.5 border border-slate-700/60">
                <div>
                  <p className="font-semibold text-white">Polisi RI</p>
                  <p className="text-[11px] text-slate-400">Pusat Bantuan Polri</p>
                </div>
                <a
                  href="tel:110"
                  className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-500"
                >
                  110
                </a>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-800/80 p-2.5 border border-slate-700/60">
                <div>
                  <p className="font-semibold text-white">Damkar & Penyelamatan</p>
                  <p className="text-[11px] text-slate-400">Siaga Kebakaran</p>
                </div>
                <a
                  href="tel:113"
                  className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500"
                >
                  113
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BantuWarga. Platform Layanan dan Informasi Masyarakat.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Dibangun untuk kemaslahatan warga <Heart className="h-3.5 w-3.5 text-rose-500 inline fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
