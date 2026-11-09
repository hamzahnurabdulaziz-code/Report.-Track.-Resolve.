'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import { useAuth } from '@/lib/auth-context';
import { DataStore } from '@/lib/data-store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [counts, setCounts] = useState({ open: 23, inProgress: 15, resolved: 234 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await DataStore.getDashboardStats();
        setCounts({
          open: stats.openIssues,
          inProgress: stats.inProgressIssues,
          resolved: stats.resolvedIssues,
        });
      } catch (err) {
        console.error('Failed to fetch counts:', err);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Memeriksa hak akses admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar matching CivicConnect */}
      <div className="hidden lg:block">
        <AdminSidebar counts={counts} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
