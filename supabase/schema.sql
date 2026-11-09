-- ==============================================================================
-- BANTUWARGA - PLATFORM LAYANAN DAN INFORMASI MASYARAKAT
-- Database Schema & Migrations (PostgreSQL Supabase)
-- ==============================================================================

-- 1. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('warga', 'admin', 'petugas');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('menunggu', 'diproses', 'selesai', 'ditolak');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_priority AS ENUM ('rendah', 'sedang', 'tinggi', 'darurat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE announcement_category AS ENUM (
        'kegiatan_sosial',
        'gotong_royong',
        'kebersihan',
        'keamanan',
        'informasi_penting',
        'pengumuman_umum'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABEL: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone_number TEXT,
    role user_role NOT NULL DEFAULT 'warga',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABEL: REPORT_CATEGORIES
CREATE TABLE IF NOT EXISTS public.report_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'AlertTriangle',
    color TEXT NOT NULL DEFAULT '#3b82f6',
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABEL: REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES public.report_categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image_url TEXT,
    status report_status NOT NULL DEFAULT 'menunggu',
    priority report_priority NOT NULL DEFAULT 'sedang',
    is_public BOOLEAN NOT NULL DEFAULT true,
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    assigned_officer_name TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABEL: REPORT_STATUS_HISTORY
CREATE TABLE IF NOT EXISTS public.report_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    previous_status report_status,
    new_status report_status NOT NULL,
    notes TEXT,
    proof_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABEL: ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    category announcement_category NOT NULL DEFAULT 'pengumuman_umum',
    event_date TIMESTAMPTZ,
    location TEXT,
    image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABEL: EMERGENCY_CONTACTS
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. INDEXES UNTUK PERFORMA
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_category_id ON public.reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_tracking_code ON public.reports(tracking_code);
CREATE INDEX IF NOT EXISTS idx_history_report_id ON public.report_status_history(report_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published, is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_order ON public.emergency_contacts(order_index, name);

-- 10. HELPER FUNCTION & TRIGGER UNTUK UPDATE TIMESTAMP
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_reports_updated ON public.reports;
CREATE TRIGGER on_reports_updated
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_announcements_updated ON public.announcements;
CREATE TRIGGER on_announcements_updated
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 11. TRIGGER UNTUK AUTO-CREATE PROFILE SAAT USER REGISTER DI SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'warga'::user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. HELPER FUNCTIONS UNTUK CEK ROLE ADMIN / PETUGAS
CREATE OR REPLACE FUNCTION public.is_admin_or_officer()
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
BEGIN
    SELECT role INTO user_role_val FROM public.profiles WHERE id = auth.uid();
    RETURN user_role_val IN ('admin', 'petugas');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
BEGIN
    SELECT role INTO user_role_val FROM public.profiles WHERE id = auth.uid();
    RETURN user_role_val = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS: PROFILES
DROP POLICY IF EXISTS "Profiles dapat dilihat oleh publik/pengguna terdaftar" ON public.profiles;
CREATE POLICY "Profiles dapat dilihat oleh publik/pengguna terdaftar"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Pengguna dapat mengedit profil miliknya sendiri" ON public.profiles;
CREATE POLICY "Pengguna dapat mengedit profil miliknya sendiri"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- RLS: REPORT_CATEGORIES
DROP POLICY IF EXISTS "Kategori dapat dibaca oleh siapa saja" ON public.report_categories;
CREATE POLICY "Kategori dapat dibaca oleh siapa saja"
    ON public.report_categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Hanya admin yang dapat mengelola kategori" ON public.report_categories;
CREATE POLICY "Hanya admin yang dapat mengelola kategori"
    ON public.report_categories FOR ALL
    USING (public.is_admin());

-- RLS: REPORTS
DROP POLICY IF EXISTS "Laporan publik dapat dibaca oleh siapa saja" ON public.reports;
CREATE POLICY "Laporan publik dapat dibaca oleh siapa saja"
    ON public.reports FOR SELECT
    USING (is_public = true OR auth.uid() = user_id OR public.is_admin_or_officer());

DROP POLICY IF EXISTS "Pengguna dapat membuat laporan" ON public.reports;
CREATE POLICY "Pengguna dapat membuat laporan"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Pengguna dapat mengupdate laporan miliknya saat status masih menunggu" ON public.reports;
CREATE POLICY "Pengguna dapat mengupdate laporan miliknya saat status masih menunggu"
    ON public.reports FOR UPDATE
    USING (
        (auth.uid() = user_id AND status = 'menunggu')
        OR public.is_admin_or_officer()
    );

DROP POLICY IF EXISTS "Hanya admin yang dapat menghapus laporan" ON public.reports;
CREATE POLICY "Hanya admin yang dapat menghapus laporan"
    ON public.reports FOR DELETE
    USING (public.is_admin());

-- RLS: REPORT_STATUS_HISTORY
DROP POLICY IF EXISTS "Riwayat status dapat dibaca oleh siapa saja" ON public.report_status_history;
CREATE POLICY "Riwayat status dapat dibaca oleh siapa saja"
    ON public.report_status_history FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admin dan petugas dapat menambahkan riwayat status" ON public.report_status_history;
CREATE POLICY "Admin dan petugas dapat menambahkan riwayat status"
    ON public.report_status_history FOR INSERT
    WITH CHECK (public.is_admin_or_officer());

-- RLS: ANNOUNCEMENTS
DROP POLICY IF EXISTS "Pengumuman publik dapat dibaca siapa saja" ON public.announcements;
CREATE POLICY "Pengumuman publik dapat dibaca siapa saja"
    ON public.announcements FOR SELECT
    USING (is_published = true OR public.is_admin_or_officer());

DROP POLICY IF EXISTS "Hanya admin yang dapat membuat atau mengedit pengumuman" ON public.announcements;
CREATE POLICY "Hanya admin yang dapat membuat atau mengedit pengumuman"
    ON public.announcements FOR ALL
    USING (public.is_admin());

-- RLS: EMERGENCY_CONTACTS
DROP POLICY IF EXISTS "Kontak darurat dapat dibaca siapa saja" ON public.emergency_contacts;
CREATE POLICY "Kontak darurat dapat dibaca siapa saja"
    ON public.emergency_contacts FOR SELECT
    USING (is_active = true OR public.is_admin_or_officer());

DROP POLICY IF EXISTS "Hanya admin yang dapat mengelola kontak darurat" ON public.emergency_contacts;
CREATE POLICY "Hanya admin yang dapat mengelola kontak darurat"
    ON public.emergency_contacts FOR ALL
    USING (public.is_admin());

-- 14. DATA SEEDING (KATEGORI RESMI, KONTAK DARURAT RESMI INDONESIA, PENGUMUMAN & CONTOH LAPORAN)
INSERT INTO public.report_categories (name, slug, description, icon, color, department)
VALUES
    ('Jalan Rusak', 'jalan-rusak', 'Laporan jalan berlubang, aspal terkelupas, trotoar rusak, atau jembatan amblas.', 'Construction', '#ef4444', 'Dinas Bina Marga & Tata Ruang'),
    ('Sampah & Lingkungan', 'sampah-lingkungan', 'Penumpukan sampah liar, TPS meluap, ranting pohon tumbang, atau pencemaran.', 'Trash2', '#10b981', 'Dinas Lingkungan Hidup'),
    ('Lampu Jalan & Listrik', 'lampu-jalan', 'Penerangan Jalan Umum (PJU) mati, tiang miring, atau kabel menjuntai berbahaya.', 'Lightbulb', '#f59e0b', 'Dinas Perhubungan (PJU)'),
    ('Saluran Air & Banjir', 'saluran-air', 'Drainase tersumbat, tanggul retak, genangan air, atau sedimentasi sungai.', 'Droplets', '#06b6d4', 'Dinas Sumber Daya Air'),
    ('Keamanan & Ketertiban', 'keamanan-ketertiban', 'Gangguan kamtibmas, balap liar, kerumunan miras, parkir liar, atau kebisingan.', 'ShieldAlert', '#8b5cf6', 'Satpol PP & Linmas'),
    ('Fasilitas Umum', 'fasilitas-umum', 'Kerusakan taman kota, halte bis, rambu lalu lintas, toilet umum, atau pos ronda.', 'Building2', '#3b82f6', 'Dinas Perumahan & Fasilitas Umum'),
    ('Lainnya', 'lainnya', 'Masalah kemasyarakatan atau fasilitas lainnya yang belum terakomodir di atas.', 'HelpCircle', '#64748b', 'Pemerintah Kelurahan / Desa')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.emergency_contacts (name, phone_number, category, description, order_index)
VALUES
    ('Panggilan Darurat Terpadu Nasional', '112', 'Pusat', 'Layanan darurat terpadu bebas pulsa seluruh Indonesia (Polisi, Damkar, Ambulans, SAR)', 1),
    ('Kepolisian Republik Indonesia', '110', 'Keamanan', 'Pusat pengaduan polisi, tindak kejahatan, dan laka lantas', 2),
    ('Pemadam Kebakaran & Penyelamatan', '113', 'Bencana', 'Posko siaga kebakaran, evakuasi sarang tawon/ular, dan penyelamatan darurat', 3),
    ('Ambulans & Gawat Darurat Medis (Kemenkes)', '119', 'Kesehatan', 'Sistem Penanggulangan Gawat Darurat Terpadu (SPGDT) dan ambulans medis', 4),
    ('Basarnas (Pencarian & Pertolongan)', '115', 'Penyelamatan', 'Operasi SAR bencana alam, pencarian korban hilang di perairan/darat', 5),
    ('PLN - Gangguan Listrik & Kabel', '123', 'Infrastruktur', 'Pengaduan tiang listrik roboh, kabel putus tegangan tinggi, korsleting publik', 6),
    ('BPBD (Badan Penanggulangan Bencana Daerah)', '021-12345678', 'Bencana', 'Pusdalops penanganan evakuasi banjir, tanah longsor, dan gempa bumi', 7)
ON CONFLICT DO NOTHING;

INSERT INTO public.announcements (title, slug, content, category, event_date, location, is_published, is_pinned)
VALUES
    (
        'Aksi Gotong Royong Kebersihan Saluran Air & Fogging Serentak',
        'aksi-gotong-royong-kebersihan-saluran-air',
        'Dalam rangka menyambut musim penghujan dan pencegahan DBD, seluruh warga diimbau ikut serta dalam kerja bakti membersihkan drainase lingkungan dan got bersama. Mohon membawa peralatan kerja bakti masing-masing. Konsumsi disediakan oleh panitia RW.',
        'gotong_royong',
        timezone('utc'::text, now() + interval '3 days'),
        'Area Fasum & Lingkungan RT 01 - RT 08 RW 05',
        true,
        true
    ),
    (
        'Jadwal Posyandu Balita & Pemeriksaan Kesehatan Lansia Gratis',
        'jadwal-posyandu-balita-dan-lansia',
        'Puskesmas bekerjasama dengan Kader PKK menyelenggarakan penimbangan berat badan, imunisasi balita, cek gula darah, tensi darah, dan kolesterol untuk bapak/ibu lansia tanpa dipungut biaya. Harap membawa buku KIA dan KTP.',
        'kegiatan_sosial',
        timezone('utc'::text, now() + interval '5 days'),
        'Balai Warga RW 05',
        true,
        false
    ),
    (
        'Pemberitahuan Rekayasa Arus Jalan Terkait Pengerjaan Saluran Pipa PDAM',
        'pemberitahuan-rekayasa-arus-jalan-pdam',
        'Akan dilakukan pengerjaan pipa distribusi utama air bersih mulai hari Senin pukul 08:00 hingga Rabu. Akses Jl. Mawar Indah akan dialihkan sebagian ke Jl. Melati. Pengguna jalan diimbau mengurangi kecepatan dan memperhatikan rambu.',
        'informasi_penting',
        timezone('utc'::text, now() + interval '1 day'),
        'Jl. Mawar Indah Raya KM 2',
        true,
        false
    )
ON CONFLICT DO NOTHING;

-- 15. STORAGE BUCKET CONFIGURATION (Untuk Eksekusi di Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Siapa saja dapat melihat foto laporan
DROP POLICY IF EXISTS "Public can view report photos" ON storage.objects;
CREATE POLICY "Public can view report photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports');

-- Storage Policy: Siapa saja yang terautentikasi / public form dapat upload foto laporan
DROP POLICY IF EXISTS "Anyone can upload report photos" ON storage.objects;
CREATE POLICY "Anyone can upload report photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports');
