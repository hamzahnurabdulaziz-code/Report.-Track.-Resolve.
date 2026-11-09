'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Megaphone,
  Radio,
  Search,
  Tag,
  User,
} from 'lucide-react';
import { DataStore } from '@/lib/data-store';
import { Announcement } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function PengumumanPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await DataStore.getAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const categories = [
    { id: 'semua', label: 'Semua' },
    { id: 'gotong_royong', label: 'Gotong Royong' },
    { id: 'kegiatan_sosial', label: 'Kegiatan Sosial' },
    { id: 'kebersihan', label: 'Kebersihan' },
    { id: 'keamanan', label: 'Keamanan' },
    { id: 'informasi_penting', label: 'Informasi Penting' },
  ];

  const filtered = announcements.filter((a) => {
    if (selectedCategory !== 'semua' && a.category !== selectedCategory) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        (a.location && a.location.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 text-center max-w-3xl mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-3">
            <Radio className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Pengumuman & Agenda Kegiatan Warga
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Dapatkan informasi terkini terkait kerja bakti, gotong royong, posyandu, jadwal ronda,
            dan pengumuman penting lingkungan warga
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedCategory === c.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pengumuman..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="mt-12 flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-xs font-medium">Memuat pengumuman...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((ann) => (
              <div
                key={ann.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:border-slate-300 hover:shadow-md flex flex-col justify-between"
              >
                {ann.image_url && (
                  <div className="h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={ann.image_url}
                      alt={ann.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 capitalize">
                        {ann.category.replace('_', ' ')}
                      </span>
                      {ann.is_pinned && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                          📌 PENTING
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{ann.title}</h3>
                    <p className="mt-3 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-3 space-y-1.5 text-[11px] text-slate-500">
                    {ann.event_date && (
                      <div className="flex items-center gap-2 text-blue-700 font-semibold">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Pelaksanaan: {formatDate(ann.event_date)}</span>
                      </div>
                    )}
                    {ann.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>Lokasi: {ann.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Oleh: {ann.author_name || 'Pengurus RW/Desa'}</span>
                      </span>
                      <span>Diterbitkan: {formatDate(ann.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Megaphone className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">Belum ada pengumuman</h3>
            <p className="mt-1 text-xs text-slate-500">
              Belum ada informasi dalam kategori atau kata kunci ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
