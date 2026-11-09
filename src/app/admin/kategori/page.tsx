'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Construction, Layers, ShieldCheck } from 'lucide-react';
import { AdminTopbar } from '@/components/admin-topbar';
import { DataStore } from '@/lib/data-store';
import { ReportCategory } from '@/lib/types';

export default function AdminKategoriPage() {
  const [categories, setCategories] = useState<ReportCategory[]>([]);

  useEffect(() => {
    async function load() {
      const data = await DataStore.getCategories();
      setCategories(data);
    }
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      <AdminTopbar
        title="Kategori & Dinas Terkait"
        subtitle="Struktur klasifikasi laporan masalah fasilitas dan pemetaan ke instansi dinas kota"
      />

      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${c.color}15`, color: c.color }}
                  >
                    <Construction className="h-5 w-5" />
                  </div>
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                    title={`Warna Identitas: ${c.color}`}
                  />
                </div>

                <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-3">
                <span className="block text-[10px] font-semibold uppercase text-slate-400">
                  Dinas Penanggung Jawab:
                </span>
                <span className="text-xs font-bold text-blue-700">{c.department}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
