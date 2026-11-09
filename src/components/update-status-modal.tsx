'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, X, XCircle } from 'lucide-react';
import { DataStore } from '@/lib/data-store';
import { Report, ReportStatus } from '@/lib/types';
import { StatusBadge } from './status-badge';

interface UpdateStatusModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated: Report) => void;
}

export function UpdateStatusModal({
  report,
  isOpen,
  onClose,
  onUpdated,
}: UpdateStatusModalProps) {
  const [status, setStatus] = useState<ReportStatus>(report?.status || 'menunggu');
  const [officerName, setOfficerName] = useState<string>(report?.assigned_officer_name || '');
  const [notes, setNotes] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when report changes
  React.useEffect(() => {
    if (report) {
      setStatus(report.status);
      setOfficerName(report.assigned_officer_name || '');
      setNotes('');
      setProofUrl('');
    }
  }, [report]);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updated = await DataStore.updateReportStatus(
        report.id,
        status,
        notes || `Status diperbarui menjadi ${status}.`,
        officerName || undefined,
        proofUrl || undefined
      );

      if (updated) {
        onUpdated(updated);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600">
                {report.tracking_code}
              </span>
              <StatusBadge status={report.status} size="sm" />
            </div>
            <h3 className="mt-1 text-base font-bold text-slate-900 line-clamp-1">
              Tindak Lanjut & Ubah Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Status Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pilih Status Baru *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['menunggu', 'diproses', 'selesai', 'ditolak'] as ReportStatus[]).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-semibold capitalize transition-all ${
                    status === s
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <StatusBadge status={s} size="sm" showIcon={false} />
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Officer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Petugas / Tim Penanggung Jawab
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              placeholder="Contoh: Budi Santoso (Dinas Bina Marga) / Tim Satgas Biru"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Notes / Catatan Tindak Lanjut */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Tindak Lanjut & Keterangan Progres *
            </label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jelaskan tindakan yang sudah atau sedang dilakukan, koordinasi dinas, estimasi penyelesaian, dll..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Optional Proof Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Foto Bukti Pengerjaan (Opsional)
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://... URL foto hasil perbaikan di lapangan"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
