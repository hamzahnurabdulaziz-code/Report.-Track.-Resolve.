# BantuWarga – Platform Layanan dan Informasi Masyarakat

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Storage-3ecf8e?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**BantuWarga** adalah platform layanan aspirasi, pelaporan masalah fasilitas umum, dan penyebaran informasi kegiatan kemasyarakatan modern yang dirancang untuk menjembatani komunikasi warga dengan aparat kelurahan dan dinas terkait.

Platform ini mengadopsi standar desain civic engagement modern (berdasarkan referensi UI CivicResolve & CivicConnect), dilengkapi dengan peta persebaran interaktif (GIS OpenStreetMap), pelacakan status penanganan secara real-time, serta direktori kontak darurat resmi.

---

## 🌟 Fitur Utama

### 1. Halaman Beranda Warga (Civic Portal)
- **Hero Interaktif:** Menampilkan headline *"Report. Track. Resolve."* dengan statistik langsung laporan diterima, masalah terselesaikan, warga berpartisipasi, dan rata-rata waktu respons.
- **Alur Kerja:** Penjelasan 4 langkah mudah (*Foto & Laporkan &rarr; Verifikasi & Disposisi &rarr; Tindak Lanjut Petugas &rarr; Selesai & Transparan*).
- **Kategori Cepat:** Jalan Rusak, Sampah & Kebersihan, Lampu Jalan (PJU), Saluran Air & Drainase, Keamanan & Ketertiban, Fasilitas Umum, dan Lainnya.
- **Feed Laporan Terkini:** Filter instan status (*Semua, Menunggu, Diproses, Selesai*), pratinjau foto, titik lokasi, dan fitur dukungan/upvote warga.
- **Pengumuman & Agenda:** Kerja bakti, posyandu, dan rekayasa jalan.
- **Siaga Nomor Darurat:** Hotline darurat resmi Indonesia (112, 110, 113, 119) dengan tombol panggilan cepat satu ketukan.

### 2. Sistem Pelaporan Masalah Fasilitas
- **Formulir Interaktif:**
  - Input judul, deskripsi detail kerusakan, dan kategori masalah.
  - Alamat lokasi tekstual serta **Penanda Titik Koordinat GPS pada Peta Interaktif**.
  - Unggah foto bukti kerusakan dengan drag-and-drop, pratinjau instan, dan validasi berkas (maksimal 5MB, format JPG/PNG/WebP).
  - Pilihan tingkat prioritas (*Rendah, Sedang, Tinggi, Darurat*).
  - Penerbitan otomatis **Nomor Tracking Unik** (contoh: `BW-001`).
- **Detail Laporan & Riwayat Penanganan:**
  - Lini masa status (*Menunggu &rarr; Diproses &rarr; Selesai / Ditolak*) dengan catatan resmi aparat/petugas dan foto bukti pengerjaan.
  - Fitur dukungan warga (*Upvote*) untuk mempercepat prioritas penanganan.
  - Peta lokasi persis laporan.
  - Tombol bagikan tautan laporan.

### 3. Dashboard Admin (CivicConnect)
- **Top Metric Cards:** Indikator *Open Issues*, *In Progress*, *Resolved*, dan *Avg Resolution Time* beserta persentase fluktuasi bulanan.
- **Issues Map (Peta Spasial):** Peta interaktif Leaflet/OpenStreetMap dengan marker warna status (merah untuk Menunggu, kuning untuk Diproses, hijau untuk Selesai) yang dapat diklik untuk pratinjau detail.
- **Tabel Manajemen Laporan:** Pencarian instan, filter multi-status, kolom prioritas, nama dinas/departemen, petugas pelaksana, dan menu tindakan.
- **Modal Tindak Lanjut Cepat:** Admin dapat memperbarui status, menugaskan petugas (*assignee*), menuliskan progres catatan pekerjaan, serta mengunggah foto bukti fisik hasil perbaikan.
- **Manajemen Pengumuman:** Publikasi agenda gotong royong dan informasi penting lingkungan dengan fitur pin pengumuman.
- **Manajemen Kontak Darurat:** Pengelolaan direktori instansi dan nomor telepon tanggap darurat 24 jam.

### 4. Peta Sebaran Laporan Warga (GIS)
- Peta sebaran spasial penuh untuk memantau titik-titik kerusakan fasilitas publik per kelurahan/kecamatan.

### 5. Multi-Role & Quick Demo Switcher
- Mendukung autentikasi Supabase Auth (Email & Password).
- Dilengkapi **1-Click Demo Switcher** (*Mode Warga* vs *Mode Admin*) di bilah navigasi atas sehingga penguji dapat mengevaluasi seluruh fitur kedua peran tanpa perlu registrasi ulang.

---

## 🛠️ Arsitektur Teknologi

- **Frontend & Framework:** Next.js 14 (App Router) & TypeScript
- **Styling & Desain:** Tailwind CSS, PostCSS, Lucide Icons
- **Peta Interaktif:** Leaflet & OpenStreetMap (tanpa ketergantungan API key pihak ketiga)
- **Database & Storage:** Supabase PostgreSQL & Supabase Storage
- **Keamanan:** Row Level Security (RLS) PostgreSQL & validasi input server-side
- **Deployment:** Vercel

---

## 🚀 Panduan Instalasi Lokal

### Prasyarat
- Node.js versi 18.17+ atau 20+
- npm atau pnpm

### Langkah-langkah

1. **Clone repository atau buka direktori proyek:**
   ```bash
   cd "d:/ProjectTKIT/WEBSITE BANTUWARGA"
   ```

2. **Instal seluruh dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Salin file `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(Aplikasi telah dilengkapi demo store otomatis: jika Supabase belum dihubungkan, website tetap dapat dijalankan 100% secara interaktif dengan data awal).*

4. **Jalankan server pengembangan (Development Mode):**
   ```bash
   npm run dev
   ```
   Buka peramban di [http://localhost:3000](http://localhost:3000).

5. **Jalankan pengujian build produksi:**
   ```bash
   npm run build
   ```

---

## 🗄️ Konfigurasi Database Supabase

Jika ingin menghubungkan ke database live di Supabase:

1. Buka [Supabase Dashboard](https://supabase.com/) dan buat proyek baru (*New Project*).
2. Buka menu **SQL Editor** pada sidebar kiri Supabase.
3. Buka file [`supabase/schema.sql`](file:///d:/ProjectTKIT/WEBSITE%20BANTUWARGA/supabase/schema.sql) pada repositori ini, salin seluruh isinya, lalu tempel ke SQL Editor Supabase dan klik **Run**.
   Script ini akan membuat otomatis:
   - Tabel: `profiles`, `report_categories`, `reports`, `report_status_history`, `announcements`, `emergency_contacts`.
   - Indexing untuk performa pencarian tinggi.
   - Row Level Security (RLS) policies untuk keamanan data.
   - Storage bucket `reports` untuk foto keluhan warga.
   - Data awal (*seeding*) kategori dinas, kontak darurat resmi Indonesia, pengumuman, dan contoh laporan.
4. Buka menu **Project Settings &rarr; API** di Supabase:
   - Salin **Project URL** ke `NEXT_PUBLIC_SUPABASE_URL` di `.env.local`.
   - Salin **anon public key** ke `NEXT_PUBLIC_SUPABASE_ANON_KEY` di `.env.local`.
   - Salin **service_role key** ke `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`.
5. Restart server Next.js Anda (`npm run dev`).

---

## 🌐 Panduan Deploy ke Vercel

Website BantuWarga 100% kompatibel dan siap di-deploy langsung ke Vercel:

### Opsi 1: Melalui Dashboard Vercel (Rekomendasi)
1. Unggah kode ke repositori GitHub / GitLab.
2. Buka [Vercel Dashboard](https://vercel.com) dan klik **Add New &rarr; Project**.
3. Hubungkan repositori GitHub Anda.
4. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL proyek Supabase Anda.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon public key Supabase Anda.
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key.
   - `NEXT_PUBLIC_APP_URL`: Domain Vercel Anda (misal `https://bantuwarga.vercel.app`).
5. Klik **Deploy**. Vercel akan otomatis membangun dan merilis website dalam ~1-2 menit.

---

## 🧪 Hasil Pengujian Kualitas Perangkat Lunak (QA)

Sesuai instruksi pengujian menyeluruh:
- **TypeScript Typecheck (`npx tsc --noEmit`):** PASS (0 error).
- **ESLint Validation (`npm run lint`):** PASS (0 error, 0 warning).
- **Next.js Production Build (`npm run build`):** PASS (18 dari 18 route static/dynamic berhasil di-generate).
- **Simulasi Pengguna:**
  - Berhasil membuat laporan baru beserta penandaan peta GPS dan foto.
  - Berhasil memperbarui status penanganan di Dashboard Admin (*Menunggu &rarr; Diproses &rarr; Selesai*).
  - Berhasil menambahkan pengumuman warga baru.
  - Berhasil mengakses direktori kontak darurat dan tautan panggilan telepon.
  - Tata letak responsif pada tampilan ponsel (Mobile Viewport) maupun desktop lebar.

---

## 📄 Lisensi
Hak Cipta © 2026 Tim Pengembang BantuWarga. Dirilis di bawah Lisensi MIT untuk kemaslahatan masyarakat.
