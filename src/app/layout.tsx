import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  title: 'BantuWarga – Platform Layanan dan Informasi Masyarakat',
  description:
    'Laporkan masalah fasilitas umum, pantau tindak lanjut petugas, dan dapatkan pengumuman serta kontak darurat lingkungan secara transparan.',
  keywords: [
    'BantuWarga',
    'laporan warga',
    'keluhan masyarakat',
    'jalan rusak',
    'sampah',
    'fasilitas umum',
    'kontak darurat',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
