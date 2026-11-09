'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  Check,
  Copy,
  ExternalLink,
  PhoneCall,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { DataStore } from '@/lib/data-store';
import { EmergencyContact } from '@/lib/types';

export default function KontakDaruratPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await DataStore.getEmergencyContacts();
        setContacts(data);
      } catch (err) {
        console.error('Failed to load emergency contacts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleCopy = (id: string, phone: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(phone);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filtered = contacts.filter((c) => {
    if (searchTerm.trim() === '') return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone_number.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 text-center max-w-2xl mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-3">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Direktori Kontak Darurat Resmi
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Nomor telepon tanggap darurat resmi instansi pemerintah untuk pertolongan medis, bencana,
            keamanan, dan gangguan infrastruktur publik.
          </p>
        </div>

        {/* Big Alert Notice */}
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-xs text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertOctagon className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-sm text-rose-800">
                Layanan Panggilan Darurat Terpadu: 112
              </p>
              <p className="text-rose-700 mt-0.5">
                Bebas pulsa dari seluruh operator ponsel dan telepon rumah selama 24 jam non-stop.
              </p>
            </div>
          </div>
          <a
            href="tel:112"
            className="shrink-0 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
          >
            Panggil 112 Sekarang
          </a>
        </div>

        {/* Search Input */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari instansi, nomor telepon (contoh: 110, pemadam, polisi)..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
            />
          </div>
        </div>

        {/* Contacts Grid */}
        {isLoading ? (
          <div className="mt-12 flex flex-col items-center justify-center py-12 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-xs font-medium">Memuat kontak darurat...</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif 24 Jam
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    {item.description || 'Layanan bantuan tanggap darurat warga.'}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-blue-600">
                      {item.phone_number}
                    </span>
                    <button
                      onClick={() => handleCopy(item.id, item.phone_number)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      title="Salin nomor"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <a
                    href={`tel:${item.phone_number.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Hubungi</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
