'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  MapPin,
  UploadCloud,
  X,
} from 'lucide-react';
import InteractiveMap from '@/components/interactive-map';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/data-store';
import { ReportCategory, ReportPriority } from '@/lib/types';

export default function BuatLaporanPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [priority, setPriority] = useState<ReportPriority>('sedang');
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>([-6.2088, 106.8456]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reporterName, setReporterName] = useState(user?.full_name || 'Warga Setempat');
  const [reporterEmail, setReporterEmail] = useState(user?.email || 'warga@bantuwarga.id');

  useEffect(() => {
    async function loadCats() {
      const cats = await DataStore.getCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    }
    loadCats();
  }, []);

  useEffect(() => {
    if (user) {
      setReporterName(user.full_name);
      setReporterEmail(user.email);
    }
  }, [user]);

  // Image upload handling with max 5MB validation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file foto maksimal adalah 5MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Format file harus berupa JPG, PNG, atau WebP.');
      return;
    }

    setErrorMessage(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim() || !categoryId) {
      setErrorMessage('Mohon lengkapi seluruh kolom formulir wajib.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const newReport = await DataStore.createReport({
        title,
        description,
        category_id: categoryId,
        location_name: locationName,
        latitude: selectedCoord ? selectedCoord[0] : undefined,
        longitude: selectedCoord ? selectedCoord[1] : undefined,
        image_url:
          imagePreview ||
          'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
        priority,
        user_id: user?.id,
        reporter_name: reporterName,
        reporter_email: reporterEmail,
      });

      router.push(`/laporan/${newReport.id}?created=true`);
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setErrorMessage(err?.message || 'Gagal mengirimkan laporan. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <Link
          href="/laporan"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Laporan</span>
        </Link>

        {/* Form Container */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 bg-blue-50/40 p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Formulir Laporan Fasilitas Warga
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
              Sampaikan keluhan atau kerusakan fasilitas umum di lingkungan Anda dengan jelas dan
              akurat agar dapat segera ditindaklanjuti oleh petugas.
            </p>
          </div>

          {errorMessage && (
            <div className="mx-6 mt-6 sm:mx-8 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Judul Laporan *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Lampu Jalan PJU Padam di Pertigaan RT 02 / Jalan Berlubang Parah"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Kategori Masalah *
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {categories.map((c) => {
                  const isSelected = categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold">{c.name}</span>
                      <span className="mt-1 text-[10px] text-slate-500 line-clamp-1">
                        {c.department}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Deskripsi Lengkap Masalah *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan kondisi kerusakan secara rinci, sudah berapa lama terjadi, dampaknya terhadap warga, dll..."
                className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Location & Map Picker */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Alamat / Patokan Lokasi Masalah *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Contoh: Jl. Merak No. 12, RT 03/RW 02 (Depan Masjid Al-Falah)"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Interactive map location picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Tentukan Titik Koordinat GPS pada Peta:
                  </span>
                  {selectedCoord && (
                    <span className="text-[10px] font-mono text-blue-600">
                      {selectedCoord[0].toFixed(5)}, {selectedCoord[1].toFixed(5)}
                    </span>
                  )}
                </div>
                <InteractiveMap
                  isPicker
                  selectedCoord={selectedCoord}
                  onSelectCoord={(lat, lng) => setSelectedCoord([lat, lng])}
                  height="260px"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Foto Bukti Masalah (Maks. 5MB, format JPG/PNG/WebP)
              </label>

              {imagePreview ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 max-w-sm">
                  <img
                    src={imagePreview}
                    alt="Preview Laporan"
                    className="h-48 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900"
                    title="Hapus foto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                  <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Klik untuk memilih foto atau seret foto ke sini
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">JPG, PNG, atau WebP hingga 5MB</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Reporter details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Pelapor
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Tingkat Urgensi / Prioritas
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ReportPriority)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="rendah">Rendah (Dapat ditunda)</option>
                  <option value="sedang">Sedang (Perlu penanganan reguler)</option>
                  <option value="tinggi">Tinggi (Mendesak / Mengganggu warga)</option>
                  <option value="darurat">Darurat (Berbahaya bagi keselamatan jiwa)</option>
                </select>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
              <Link
                href="/laporan"
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-7 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirimkan Laporan...' : 'Kirim Laporan Sekarang'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
