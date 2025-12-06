'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface MetricCardProps {
  icon: string;
  value: number | string;
  labelKey: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function MetricCard({ icon, value, labelKey, color }: MetricCardProps) {
  const { t } = useI18n();
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200/50">
      <div className="flex items-center gap-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-xs text-slate-600 font-medium">{t(labelKey)}</div>
        </div>
      </div>
    </div>
  );
}

interface DashboardMetricsProps {
  total: number;
  planned: number;
  operated: number;
  followup: number;
}

export function DashboardMetrics({ total, planned, operated, followup }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <MetricCard
        icon="📋"
        value={total}
        labelKey="stats.total"
        color="blue"
      />
      <MetricCard
        icon="📅"
        value={planned}
        labelKey="stats.planned"
        color="purple"
      />
      <MetricCard
        icon="✅"
        value={operated}
        labelKey="stats.operated"
        color="green"
      />
      <MetricCard
        icon="👁️"
        value={followup}
        labelKey="stats.followup"
        color="yellow"
      />
    </div>
  );
}
