import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CATEGORIES,
  INITIAL_DASHBOARD_STATS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_REPORTS,
} from './mock-data';
import { createClient, isSupabaseConfigured } from './supabase/client';
import {
  Announcement,
  DashboardStats,
  EmergencyContact,
  Report,
  ReportCategory,
  ReportPriority,
  ReportStatus,
} from './types';
import { generateTrackingCode } from './utils';

const STORAGE_KEYS = {
  REPORTS: 'bantuwarga_reports_v1',
  CATEGORIES: 'bantuwarga_categories_v1',
  ANNOUNCEMENTS: 'bantuwarga_announcements_v1',
  CONTACTS: 'bantuwarga_contacts_v1',
};

function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export const DataStore = {
  // Categories
  async getCategories(): Promise<ReportCategory[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('report_categories')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) return data as ReportCategory[];
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local data', err);
      }
    }
    return getLocalItem<ReportCategory[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  // Reports
  async getReports(filters?: {
    status?: ReportStatus | 'semua';
    categoryId?: string;
    search?: string;
    userId?: string;
  }): Promise<Report[]> {
    let reports: Report[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('reports')
          .select('*, category:report_categories(*), history:report_status_history(*)')
          .order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'semua') {
          query = query.eq('status', filters.status);
        }
        if (filters?.categoryId && filters.categoryId !== 'semua') {
          query = query.eq('category_id', filters.categoryId);
        }
        if (filters?.userId) {
          query = query.eq('user_id', filters.userId);
        }

        const { data, error } = await query;
        if (!error && data) {
          reports = data.map((item: any) => ({
            ...item,
            category_name: item.category?.name || 'Umum',
            category_color: item.category?.color || '#3b82f6',
            department: item.category?.department || 'Dinas Terkait',
          }));
        }
      } catch (err) {
        console.warn('Supabase getReports failed, falling back to local', err);
      }
    }

    if (reports.length === 0) {
      reports = getLocalItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    }

    // Apply memory/local filtering
    let filtered = [...reports];
    if (filters?.status && filters.status !== 'semua') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }
    if (filters?.categoryId && filters.categoryId !== 'semua') {
      filtered = filtered.filter((r) => r.category_id === filters.categoryId);
    }
    if (filters?.userId) {
      filtered = filtered.filter((r) => r.user_id === filters.userId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location_name.toLowerCase().includes(q) ||
          r.tracking_code.toLowerCase().includes(q)
      );
    }

    return filtered;
  },

  async getReportById(id: string): Promise<Report | null> {
    const all = await this.getReports();
    return all.find((r) => r.id === id || r.tracking_code.toLowerCase() === id.toLowerCase()) || null;
  },

  async createReport(input: {
    title: string;
    description: string;
    category_id: string;
    location_name: string;
    latitude?: number;
    longitude?: number;
    image_url?: string;
    priority?: ReportPriority;
    user_id?: string;
    reporter_name: string;
    reporter_email?: string;
  }): Promise<Report> {
    const categories = await this.getCategories();
    const cat = categories.find((c) => c.id === input.category_id) || categories[0];

    const newReport: Report = {
      id: 'rep-' + Date.now(),
      tracking_code: generateTrackingCode(),
      user_id: input.user_id || 'guest',
      reporter_name: input.reporter_name || 'Warga Terdaftar',
      reporter_email: input.reporter_email || 'warga@bantuwarga.id',
      category_id: input.category_id,
      category_name: cat?.name || 'Fasilitas Umum',
      category_color: cat?.color || '#3b82f6',
      department: cat?.department || 'Dinas Terkait',
      title: input.title,
      description: input.description,
      location_name: input.location_name,
      latitude: input.latitude || -6.2088 + (Math.random() - 0.5) * 0.05,
      longitude: input.longitude || 106.8456 + (Math.random() - 0.5) * 0.05,
      image_url: input.image_url || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
      status: 'menunggu',
      priority: input.priority || 'sedang',
      is_public: true,
      upvotes_count: 1,
      assigned_officer_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      history: [
        {
          id: 'hist-' + Date.now(),
          report_id: 'rep-' + Date.now(),
          new_status: 'menunggu',
          notes: 'Laporan berhasil dibuat oleh warga dan menunggu verifikasi admin.',
          created_at: new Date().toISOString(),
        },
      ],
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('reports')
          .insert({
            title: newReport.title,
            description: newReport.description,
            tracking_code: newReport.tracking_code,
            category_id: newReport.category_id,
            location_name: newReport.location_name,
            latitude: newReport.latitude,
            longitude: newReport.longitude,
            image_url: newReport.image_url,
            status: newReport.status,
            priority: newReport.priority,
            user_id: input.user_id || null,
          })
          .select()
          .single();

        if (!error && data) {
          return {
            ...newReport,
            id: data.id,
          };
        }
      } catch (err) {
        console.warn('Supabase insert failed, storing locally', err);
      }
    }

    const currentReports = getLocalItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const updated = [newReport, ...currentReports];
    setLocalItem(STORAGE_KEYS.REPORTS, updated);
    return newReport;
  },

  async updateReportStatus(
    id: string,
    newStatus: ReportStatus,
    notes?: string,
    officerName?: string,
    proofImageUrl?: string
  ): Promise<Report | null> {
    const currentReports = getLocalItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const index = currentReports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const report = currentReports[index];
    const prevStatus = report.status;
    const now = new Date().toISOString();

    const historyItem = {
      id: 'hist-' + Date.now(),
      report_id: report.id,
      previous_status: prevStatus,
      new_status: newStatus,
      notes: notes || `Status diubah menjadi ${newStatus}.`,
      proof_image_url: proofImageUrl,
      created_at: now,
    };

    const updatedReport: Report = {
      ...report,
      status: newStatus,
      assigned_officer_name: officerName !== undefined ? officerName : report.assigned_officer_name,
      resolved_at: newStatus === 'selesai' ? now : report.resolved_at,
      updated_at: now,
      history: [historyItem, ...(report.history || [])],
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase
          .from('reports')
          .update({
            status: newStatus,
            assigned_officer_name: updatedReport.assigned_officer_name,
            resolved_at: updatedReport.resolved_at,
            updated_at: now,
          })
          .eq('id', id);

        await supabase.from('report_status_history').insert({
          report_id: id,
          previous_status: prevStatus,
          new_status: newStatus,
          notes: historyItem.notes,
          proof_image_url: proofImageUrl || null,
        });
      } catch (err) {
        console.warn('Supabase update failed, saving locally', err);
      }
    }

    currentReports[index] = updatedReport;
    setLocalItem(STORAGE_KEYS.REPORTS, currentReports);
    return updatedReport;
  },

  async deleteReport(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('reports').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete failed', err);
      }
    }
    const currentReports = getLocalItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const filtered = currentReports.filter((r) => r.id !== id);
    setLocalItem(STORAGE_KEYS.REPORTS, filtered);
    return true;
  },

  async upvoteReport(id: string): Promise<number> {
    const currentReports = getLocalItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const report = currentReports.find((r) => r.id === id);
    if (!report) return 0;
    report.upvotes_count = (report.upvotes_count || 0) + 1;
    setLocalItem(STORAGE_KEYS.REPORTS, currentReports);
    return report.upvotes_count;
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Announcement[];
      } catch (err) {
        console.warn('Supabase getAnnouncements failed', err);
      }
    }
    return getLocalItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },

  async createAnnouncement(data: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement> {
    const newAnn: Announcement = {
      ...data,
      id: 'ann-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = getLocalItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const updated = [newAnn, ...current];
    setLocalItem(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return newAnn;
  },

  // Emergency Contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('emergency_contacts')
          .select('*')
          .order('order_index', { ascending: true });
        if (!error && data && data.length > 0) return data as EmergencyContact[];
      } catch (err) {
        console.warn('Supabase getEmergencyContacts failed', err);
      }
    }
    return getLocalItem<EmergencyContact[]>(STORAGE_KEYS.CONTACTS, INITIAL_EMERGENCY_CONTACTS);
  },

  async createEmergencyContact(data: Omit<EmergencyContact, 'id' | 'created_at'>): Promise<EmergencyContact> {
    const newContact: EmergencyContact = {
      ...data,
      id: 'em-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    const current = getLocalItem<EmergencyContact[]>(STORAGE_KEYS.CONTACTS, INITIAL_EMERGENCY_CONTACTS);
    const updated = [...current, newContact];
    setLocalItem(STORAGE_KEYS.CONTACTS, updated);
    return newContact;
  },

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const reports = await this.getReports();
    const open = reports.filter((r) => r.status === 'menunggu').length;
    const inProgress = reports.filter((r) => r.status === 'diproses').length;
    const resolved = reports.filter((r) => r.status === 'selesai').length;

    return {
      openIssues: open,
      openDeltaPercent: 12,
      inProgressIssues: inProgress,
      inProgressDeltaPercent: 8,
      resolvedIssues: resolved,
      resolvedDeltaPercent: 23,
      avgResolutionDays: 3.8,
      totalCitizens: 3567,
      activeOfficers: 12,
      coverageAreas: 8,
    };
  },
};
