import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReportPriority, ReportStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusLabel(status: ReportStatus): string {
  switch (status) {
    case 'menunggu':
      return 'Menunggu';
    case 'diproses':
      return 'Diproses';
    case 'selesai':
      return 'Selesai';
    case 'ditolak':
      return 'Ditolak';
    default:
      return status;
  }
}

export function getStatusBadgeClasses(status: ReportStatus): {
  container: string;
  badge: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case 'menunggu':
      return {
        container: 'bg-rose-50 text-rose-700 border-rose-200',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        text: 'text-rose-600',
        dot: 'bg-rose-500',
      };
    case 'diproses':
      return {
        container: 'bg-amber-50 text-amber-700 border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        text: 'text-amber-600',
        dot: 'bg-amber-500',
      };
    case 'selesai':
      return {
        container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        text: 'text-emerald-600',
        dot: 'bg-emerald-500',
      };
    case 'ditolak':
      return {
        container: 'bg-slate-100 text-slate-700 border-slate-300',
        badge: 'bg-slate-200 text-slate-800 border-slate-300',
        text: 'text-slate-600',
        dot: 'bg-slate-500',
      };
  }
}

export function getPriorityLabel(priority: ReportPriority): string {
  switch (priority) {
    case 'rendah':
      return 'Rendah';
    case 'sedang':
      return 'Sedang';
    case 'tinggi':
      return 'Tinggi';
    case 'darurat':
      return 'Darurat';
    default:
      return priority;
  }
}

export function getPriorityBadgeClasses(priority: ReportPriority): string {
  switch (priority) {
    case 'darurat':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'tinggi':
      return 'bg-rose-50 text-rose-600 border-rose-200';
    case 'sedang':
      return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'rendah':
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function generateTrackingCode(): string {
  const prefix = 'BW';
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${randomNum}`;
}
