import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  CheckCircle2,
  Clock,
  Utensils,
  Receipt,
  AlertOctagon,
  Printer,
  XCircle,
  HelpCircle
} from 'lucide-react';
import type { TableStatus, PrintJobStatus } from '@huarique/domain';

export interface TableStatusPillProps {
  status: TableStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TableStatusPill: React.FC<TableStatusPillProps> = ({
  status,
  size = 'md',
  className
}) => {
  const config = {
    free: {
      label: 'Libre',
      icon: CheckCircle2,
      styles: 'bg-[#EBF5EE] text-success border border-success/30'
    },
    occupied: {
      label: 'Ocupada',
      icon: Utensils,
      styles: 'bg-[#E8F3F8] text-brand-coastal border border-brand-coastal/30'
    },
    waiting_kitchen: {
      label: 'En cocina',
      icon: Clock,
      styles: 'bg-[#FEF5E7] text-warning border border-warning/30'
    },
    served: {
      label: 'Servida',
      icon: CheckCircle2,
      styles: 'bg-[#F2F7FA] text-brand-navy border border-brand-navy/30'
    },
    waiting_payment: {
      label: 'Cuenta solicitada',
      icon: Receipt,
      styles: 'bg-[#FBF6E9] text-[#9A6B0A] border border-[#C3A55F]/50 font-bold'
    },
    blocked: {
      label: 'Fuera de servicio',
      icon: AlertOctagon,
      styles: 'bg-[#FDF0F0] text-danger border border-danger/30'
    }
  }[status];

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-bold'
  }[size];

  const Icon = config.icon;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full font-sans font-semibold tracking-wide select-none',
          sizeStyles,
          config.styles,
          className
        )
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};

export interface PrintJobStatusPillProps {
  status: PrintJobStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const PrintJobStatusPill: React.FC<PrintJobStatusPillProps> = ({
  status,
  size = 'md',
  className
}) => {
  const config = {
    pending: {
      label: 'Pendiente',
      icon: Clock,
      styles: 'bg-[#FEF5E7] text-warning border border-warning/30'
    },
    claimed: {
      label: 'En cola',
      icon: Printer,
      styles: 'bg-[#E8F3F8] text-brand-coastal border border-brand-coastal/30'
    },
    sent_unconfirmed: {
      label: 'Enviada TCP',
      icon: Printer,
      styles: 'bg-[#F0F7F4] text-[#1E5E3A] border border-[#287A4B]/30'
    },
    printed_assumed: {
      label: 'Impresa',
      icon: CheckCircle2,
      styles: 'bg-[#EBF5EE] text-success border border-success/30'
    },
    printed_confirmed: {
      label: 'Confirmada',
      icon: CheckCircle2,
      styles: 'bg-[#EBF5EE] text-success border border-success/50 font-bold'
    },
    failed: {
      label: 'Fallo de impresión',
      icon: XCircle,
      styles: 'bg-[#FDF0F0] text-danger border border-danger/40 font-bold'
    },
    cancelled: {
      label: 'Anulada',
      icon: HelpCircle,
      styles: 'bg-neutral-200 text-neutral-600 border border-neutral-600/30'
    }
  }[status];

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2'
  }[size];

  const Icon = config.icon;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full font-sans font-semibold tracking-wide select-none',
          sizeStyles,
          config.styles,
          className
        )
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
