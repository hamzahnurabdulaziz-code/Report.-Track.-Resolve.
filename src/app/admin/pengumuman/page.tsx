'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Edit,
  MapPin,
  Megaphone,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { AdminTopbar } from '@/components/admin-topbar';
import { DataStore } from '@/lib/data-store';
import { Announcement, AnnouncementCategory } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminPengumumanPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('pengumuman_umum');
  const [content, setContent] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const data = await DataStore.getAnnouncements();
    setAnnouncements(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await DataStore.createAnnouncement({
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        content,
        event_date: eventDate || null,
        location: location || null,
        image_url: imageUrl || null,
        is_published: true,
        is_pinned: isPinned,
        author_name: 'Pengurus Lingkungan / Admin',
      });
      setIsModalOpen(false);
      // Reset
      setTitle('');
      setContent('');
      setEventDate('');
      setLocation('');
      setImageUrl('');
      setIsPinned(false);
      loadData();
    } catch (err) {
      console.error('Error creating announcement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = announcements.filter((a) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      <AdminTopbar
        title="Manajemen Pengumuman Warga"
        subtitle="Kelola agenda kegiatan sosial, kerja bakti, dan informasi resmi lingkungan"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={loadData}
      />

      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Total {announcements.length} pengumuman terdaftar
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Pengumuman Baru</span>
          </button>
        </div>

        {/* Announcements List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 capitalize">
                    {item.category.replace('_', ' ')}
                  </span>
                  {item.is_pinned && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      📌 Pinned
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] text-slate-400 space-y-1">
                {item.event_date && (
                  <p className="text-blue-600 font-medium">
                    📅 Tanggal Acara: {formatDate(item.event_date)}
                  </p>
                )}
                <p>📍 {item.location || 'Wilayah RW / Kelurahan'}</p>
                <p>Oleh: {item.author_name || 'Admin'}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Add Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Buat Pengumuman Baru</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Kerja Bakti Massal Hari Minggu Pukul 07:00"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="kegiatan_sosial">Kegiatan Sosial</option>
                    <option value="gotong_royong">Gotong Royong</option>
                    <option value="kebersihan">Kebersihan</option>
                    <option value="keamanan">Keamanan</option>
                    <option value="informasi_penting">Informasi Penting</option>
                    <option value="pengumuman_umum">Pengumuman Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi / Titik Kumpul
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Balai RW 05 / Lapangan Utama"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isi Pesan Pengumuman *
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan detail jadwal, perlengkapan yang perlu dibawa, dll..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="pinCheck" className="text-xs font-semibold text-slate-700">
                  Sematkan di bagian atas (Pin Announcement)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Terbitkan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
