'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Plus, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';

interface AdminTopbarProps {
  title?: string;
  subtitle?: string;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onRefresh?: () => void;
  onOpenFilter?: () => void;
  isRefreshing?: boolean;
}

export function AdminTopbar({
  title = 'Dashboard Overview',
  subtitle = 'Manage civic issues and track city maintenance',
  searchTerm = '',
  onSearchChange,
  onRefresh,
  onOpenFilter,
  isRefreshing = false,
}: AdminTopbarProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Title & subtitle */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      {/* Action controls matching Screenshot 2 */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search input */}
        <div className="relative min-w-[240px] sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search issues, locations..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters button */}
        {onOpenFilter && (
          <button
            onClick={onOpenFilter}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <span>Filters</span>
          </button>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}

        {/* New Issue CTA button */}
        <Link
          href="/laporan/buat"
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ New Issue</span>
        </Link>

        {/* Notification Bell */}
        <button
          className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
          title="Notifikasi Masuk"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
