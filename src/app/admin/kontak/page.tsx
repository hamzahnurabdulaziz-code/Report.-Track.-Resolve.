'use client';

import React, { useEffect, useState } from 'react';
import {
  Check,
  Edit,
  Phone,
  PhoneCall,
  Plus,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { AdminTopbar } from '@/components/admin-topbar';
import { DataStore } from '@/lib/data-store';
import { EmergencyContact } from '@/lib/types';

export default function AdminKontakPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Pusat');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const data = await DataStore.getEmergencyContacts();
    setContacts(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await DataStore.createEmergencyContact({
        name,
        phone_number: phone,
        category,
        description,
        is_active: true,
        order_index: contacts.length + 1,
      });
      setIsModalOpen(false);
      setName('');
      setPhone('');
      setDescription('');
      loadData();
    } catch (err) {
      console.error('Error creating contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = contacts.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone_number.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      <AdminTopbar
        title="Manajemen Kontak Darurat"
        subtitle="Kelola nomor telepon instansi dan saluran pertolongan darurat resmi"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={loadData}
      />

      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Total {contacts.length} kontak darurat aktif
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Kontak Darurat</span>
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
              <tr>
                <th className="py-3.5 pl-6 pr-3">Instansi / Layanan</th>
                <th className="px-3 py-3.5">Nomor Darurat</th>
                <th className="px-3 py-3.5">Kategori</th>
                <th className="px-3 py-3.5">Keterangan</th>
                <th className="px-3 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 pl-6 pr-3 font-bold text-slate-900">{item.name}</td>
                  <td className="px-3 py-4 font-mono font-bold text-blue-600 text-sm">
                    {item.phone_number}
                  </td>
                  <td className="px-3 py-4 text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-slate-500 max-w-xs">{item.description}</td>
                  <td className="px-3 py-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Aktif 24 Jam
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Add Contact */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tambah Kontak Darurat</h3>
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
                  Nama Instansi / Layanan *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Puskesmas Siaga 24 Jam"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Telepon Darurat *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 119 atau 021-12345678"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Contoh: Medis / Keamanan / Bencana"
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Singkat
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat jenis bantuan darurat yang diberikan..."
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Nomor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
