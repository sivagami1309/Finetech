import React from 'react';
import { Clock, RefreshCw, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status?.toUpperCase() || 'UNKNOWN';

  const configs: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
    DRAFT: {
      label: 'Draft Request',
      bg: 'bg-slate-800/80',
      text: 'text-slate-300',
      border: 'border-slate-700',
      icon: FileText,
    },
    QUOTED: {
      label: 'Quote Locked',
      bg: 'bg-teal-950/70',
      text: 'text-teal-300',
      border: 'border-teal-700/60',
      icon: Clock,
    },
    PENDING: {
      label: 'Pending Settlement',
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-700/60',
      icon: Clock,
    },
    PROCESSING: {
      label: 'Processing Wire',
      bg: 'bg-blue-950/70',
      text: 'text-blue-300',
      border: 'border-blue-700/60',
      icon: RefreshCw,
    },
    COMPLETED: {
      label: 'Settled & Verified',
      bg: 'bg-emerald-950/80',
      text: 'text-emerald-300',
      border: 'border-emerald-600/60',
      icon: CheckCircle2,
    },
    FAILED: {
      label: 'Failed / Returned',
      bg: 'bg-rose-950/80',
      text: 'text-rose-300',
      border: 'border-rose-600/60',
      icon: XCircle,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-slate-900',
      text: 'text-slate-400',
      border: 'border-slate-800',
      icon: AlertCircle,
    },
  };

  const current = configs[norm] || {
    label: norm,
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
    icon: Clock,
  };

  const IconComponent = current.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : size === 'lg' ? 'px-3.5 py-1.5 text-sm gap-2' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border shadow-sm ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}>
      <IconComponent className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${norm === 'PROCESSING' ? 'animate-spin' : ''}`} />
      <span>{current.label}</span>
    </span>
  );
};
