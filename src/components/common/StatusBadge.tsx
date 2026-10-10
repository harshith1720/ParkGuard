import React from 'react';
import { ViolationStatus, SeverityLevel } from '../../types';

interface StatusBadgeProps {
  status: ViolationStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config: Record<ViolationStatus, { label: string; textClass: string; bgClass: string; borderClass: string }> = {
    'Reported': {
      label: 'Reported',
      textClass: 'text-amber-700',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
    },
    'Under Review': {
      label: 'Under Review',
      textClass: 'text-blue-700',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
    },
    'Confirmed': {
      label: 'Confirmed',
      textClass: 'text-rose-700',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-200',
    },
    'Fine Pending': {
      label: 'Fine Pending',
      textClass: 'text-orange-700',
      bgClass: 'bg-orange-50',
      borderClass: 'border-orange-200',
    },
    'Paid': {
      label: 'Paid',
      textClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
    },
    'Appealed': {
      label: 'Appealed',
      textClass: 'text-purple-700',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-200',
    },
    'Resolved': {
      label: 'Resolved',
      textClass: 'text-slate-600',
      bgClass: 'bg-slate-100',
      borderClass: 'border-slate-200',
    },
  };

  const current = config[status] || {
    label: status,
    textClass: 'text-slate-700',
    bgClass: 'bg-slate-50',
    borderClass: 'border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${current.bgClass} ${current.textClass} ${current.borderClass}`}>
      {current.label}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: SeverityLevel }> = ({ severity }) => {
  const config: Record<SeverityLevel, { textClass: string; bgClass: string }> = {
    'Low': { textClass: 'text-slate-600', bgClass: 'bg-slate-100' },
    'Medium': { textClass: 'text-amber-700', bgClass: 'bg-amber-50' },
    'High': { textClass: 'text-orange-700', bgClass: 'bg-orange-50' },
    'Critical': { textClass: 'text-rose-700', bgClass: 'bg-rose-50' },
  };

  const current = config[severity] || config.Low;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${current.bgClass} ${current.textClass}`}>
      {severity} Severity
    </span>
  );
};
