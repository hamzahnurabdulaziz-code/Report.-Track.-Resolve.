'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquare,
  ThumbsUp,
  User,
} from 'lucide-react';
import { DataStore } from '@/lib/data-store';
import { Report } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { PriorityBadge } from './priority-badge';
import { StatusBadge } from './status-badge';

interface ReportCardProps {
  report: Report;
  onUpvoted?: () => void;
}

export function ReportCard({ report, onUpvoted }: ReportCardProps) {
  const [upvotes, setUpvotes] = useState(report.upvotes_count || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUpvoted) return;

    setHasUpvoted(true);
    setUpvotes((prev) => prev + 1);
    await DataStore.upvoteReport(report.id);
    if (onUpvoted) onUpvoted();
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
      {/* Photo header if available */}
      {report.image_url && (
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={report.image_url}
            alt={report.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <StatusBadge status={report.status} size="sm" />
          </div>
          <div className="absolute top-3 right-3">
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs backdrop-blur-xs"
              style={{ backgroundColor: report.category_color || '#3b82f6' }}
            >
              {report.category_name}
            </span>
          </div>
        </div>
      )}

      {/* Content body */}
      <div className="flex flex-1 flex-col p-5">
        {!report.image_url && (
          <div className="mb-3 flex items-center justify-between">
            <StatusBadge status={report.status} size="sm" />
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: report.category_color || '#3b82f6' }}
            >
              {report.category_name}
            </span>
          </div>
        )}

        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono font-bold text-blue-600">{report.tracking_code}</span>
          <PriorityBadge priority={report.priority} />
        </div>

        <Link href={`/laporan/${report.id}`}>
          <h3 className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {report.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-xs text-slate-600 leading-relaxed">
          {report.description}
        </p>

        {/* Location & Reporter meta */}
        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{report.location_name}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 truncate">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{report.reporter_name}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(report.created_at)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer / Action */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3">
        <button
          onClick={handleUpvote}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            hasUpvoted
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
          title="Dukung penanganan laporan ini"
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${hasUpvoted ? 'fill-rose-600 text-rose-600' : ''}`} />
          <span>{upvotes} Dukungan</span>
        </button>

        <Link
          href={`/laporan/${report.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <span>Detail</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
