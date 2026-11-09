'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertCircle,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  LayoutGrid,
  LogOut,
  MapPin,
  Megaphone,
  PhoneCall,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface AdminSidebarProps {
  counts?: {
    open: number;
    inProgress: number;
    resolved: number;
  };
}

export function AdminSidebar({
  counts = { open: 23, inProgress: 15, resolved: 234 },
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutGrid },
    { name: 'Issues Map', href: '/admin/peta', icon: MapPin, badge: counts.open + counts.inProgress },
    { name: 'Daftar Laporan', href: '/admin/laporan', icon: Layers },
    { name: 'Pengumuman', href: '/admin/pengumuman', icon: Megaphone },
    { name: 'Kontak Darurat', href: '/admin/kontak', icon: PhoneCall },
    { name: 'Kategori & Dinas', href: '/admin/kategori', icon: Building2, badge: 7 },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between min-h-screen">
      {/* Top brand header */}
      <div>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Zap className="h-5 w-5 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">CivicConnect</h1>
            <p className="text-xs font-medium text-slate-500">Admin Dashboard</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Quick Stats & User Profile */}
      <div className="p-4 border-t border-slate-100 space-y-4">
        {/* Quick Stats section matching screenshot 2 */}
        <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-2">
          <p className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
            Quick Stats
          </p>
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              <span>Open</span>
            </span>
            <span className="font-bold">{counts.open}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>In Progress</span>
            </span>
            <span className="font-bold">{counts.inProgress}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Resolved</span>
            </span>
            <span className="font-bold">{counts.resolved}</span>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
              {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {user?.full_name || 'Budi Santoso'}
              </p>
              <p className="text-[10px] text-slate-500">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Back to Citizen Portal */}
        <Link
          href="/"
          className="block text-center rounded-lg border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          &larr; Lihat Tampilan Warga
        </Link>
      </div>
    </aside>
  );
}
