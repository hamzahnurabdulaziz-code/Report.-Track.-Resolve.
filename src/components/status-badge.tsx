import React from 'react';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { ReportStatus } from '@/lib/types';
import { getStatusBadgeClasses, getStatusLabel } from '@/lib/utils';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const classes = getStatusBadgeClasses(status);
  const label = getStatusLabel(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const renderIcon = () => {
    switch (status) {
      case 'menunggu':
        return <AlertCircle size={iconSize[size]} className="shrink-0 text-rose-500" />;
      case 'diproses':
        return <Clock size={iconSize[size]} className="shrink-0 text-amber-500" />;
      case 'selesai':
        return <CheckCircle2 size={iconSize[size]} className="shrink-0 text-emerald-500" />;
      case 'ditolak':
        return <XCircle size={iconSize[size]} className="shrink-0 text-slate-500" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${classes.badge} ${sizeClasses[size]}`}
    >
      {showIcon && renderIcon()}
      <span>{label}</span>
    </span>
  );
}
