export type UserRole = 'warga' | 'admin' | 'petugas';

export type ReportStatus = 'menunggu' | 'diproses' | 'selesai' | 'ditolak';

export type ReportPriority = 'rendah' | 'sedang' | 'tinggi' | 'darurat';

export type AnnouncementCategory =
  | 'kegiatan_sosial'
  | 'gotong_royong'
  | 'kebersihan'
  | 'keamanan'
  | 'informasi_penting'
  | 'pengumuman_umum';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  role: UserRole;
  created_at: string;
}

export interface ReportCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  department: string;
  created_at?: string;
}

export interface ReportStatusHistoryItem {
  id: string;
  report_id: string;
  changed_by?: string;
  changed_by_name?: string;
  previous_status?: ReportStatus | null;
  new_status: ReportStatus;
  notes?: string;
  proof_image_url?: string;
  created_at: string;
}

export interface Report {
  id: string;
  tracking_code: string;
  user_id?: string | null;
  reporter_name: string;
  reporter_email?: string;
  reporter_phone?: string;
  category_id: string;
  category_name?: string;
  category_color?: string;
  department?: string;
  title: string;
  description: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  status: ReportStatus;
  priority: ReportPriority;
  is_public: boolean;
  upvotes_count: number;
  assigned_officer_name?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  history?: ReportStatusHistoryItem[];
}

export interface Announcement {
  id: string;
  author_id?: string;
  author_name?: string;
  title: string;
  slug: string;
  content: string;
  category: AnnouncementCategory;
  event_date?: string | null;
  location?: string | null;
  image_url?: string | null;
  is_published: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  category: string;
  description?: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface DashboardStats {
  openIssues: number;
  openDeltaPercent: number;
  inProgressIssues: number;
  inProgressDeltaPercent: number;
  resolvedIssues: number;
  resolvedDeltaPercent: number;
  avgResolutionDays: number;
  totalCitizens: number;
  activeOfficers: number;
  coverageAreas: number;
}
