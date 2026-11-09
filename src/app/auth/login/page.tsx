'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, switchDemoRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await signIn(email, password);
    if (res.success) {
      if (email.toLowerCase().includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/laporan');
      }
    } else {
      setErrorMsg(res.error || 'Email atau kata sandi tidak valid.');
    }
    setIsLoading(false);
  };

  const handleQuickDemo = (role: 'warga' | 'admin') => {
    switchDemoRole(role);
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/laporan');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Bantu<span className="text-blue-600">Warga</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900">Masuk ke Akun Anda</h2>
          <p className="mt-1 text-xs text-slate-500">
            Akses layanan pelaporan warga dan pantau perkembangan fasilitas
          </p>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
          <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span>Pilihan Akses Demo Cepat (1-Klik):</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('warga')}
              className="rounded-xl border border-blue-200 bg-white p-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-blue-50 transition-colors shadow-2xs"
            >
              <span className="block font-bold text-blue-700">Warga</span>
              <span className="text-[10px] text-slate-500">Ahmad Fauzi</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="rounded-xl border border-blue-200 bg-white p-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-blue-50 transition-colors shadow-2xs"
            >
              <span className="block font-bold text-indigo-700">Super Admin</span>
              <span className="text-[10px] text-slate-500">Budi Santoso</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Standard Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Masuk ke Akun'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="font-bold text-blue-600 hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
