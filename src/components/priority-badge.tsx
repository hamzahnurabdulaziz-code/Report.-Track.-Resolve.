import React from 'react';
import { ReportPriority } from '@/lib/types';
import { getPriorityBadgeClasses, getPriorityLabel } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: ReportPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const badgeClass = getPriorityBadgeClasses(priority);
  const label = getPriorityLabel(priority);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${badgeClass}`}
    >
      {label}
    </span>
  );
}
