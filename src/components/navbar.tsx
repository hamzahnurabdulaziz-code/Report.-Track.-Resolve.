'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  ChevronDown,
  Compass,
  FileText,
  Home,
  LogOut,
  MapPin,
  Menu,
  PhoneCall,
  PlusCircle,
  Radio,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut, switchDemoRole, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // If in admin dashboard, we can either hide the citizen navbar or show a simplified top link
  const isInsideAdmin = pathname.startsWith('/admin');

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Laporan', href: '/laporan', icon: FileText },
    { label: 'Peta Laporan', href: '/peta', icon: MapPin },
    { label: '+ Buat Laporan', href: '/laporan/buat', icon: PlusCircle, highlight: true },
    { label: 'Pengumuman', href: '/pengumuman', icon: Radio },
    { label: 'Kontak Darurat', href: '/kontak-darurat', icon: PhoneCall },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - Civic style */}
        <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              Bantu<span className="text-blue-600">Warga</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">
              Layanan Warga
            </span>
          </div>
        </Link>

        {/* Center Navigation Pills - Exactly like CivicResolve Reference */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/70 p-1 shadow-sm">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Quick link to Admin if user has admin role */}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                isInsideAdmin
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Role Switcher & Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Quick Role Tester Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-xs">
            <button
              onClick={() => switchDemoRole('warga')}
              className={`rounded-md px-2 py-1 font-medium transition-all ${
                !isAdmin
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Ganti mode simulasi ke Warga"
            >
              Mode Warga
            </button>
            <button
              onClick={() => switchDemoRole('admin')}
              className={`rounded-md px-2 py-1 font-medium transition-all ${
                isAdmin
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Ganti mode simulasi ke Admin"
            >
              Mode Admin
            </button>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold uppercase text-[11px]">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden xl:block">
                  <p className="max-w-[120px] truncate font-semibold text-slate-900 text-xs">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/50 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="mt-1 inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 uppercase">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/riwayat"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span>Riwayat Laporan Saya</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span>Dashboard Admin</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Keluar (Sign Out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/laporan/buat"
            className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Lapor</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                    active
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700"
              >
                <Building2 className="h-4 w-4" />
                <span>Dashboard Admin</span>
              </Link>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Mode Simulasi:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    switchDemoRole('warga');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md ${
                    !isAdmin ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Warga
                </button>
                <button
                  onClick={() => {
                    switchDemoRole('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md ${
                    isAdmin ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {user ? (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                  <p className="text-[11px] text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-medium border border-slate-200 rounded-lg text-slate-700"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
