'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { ForecastPoint } from '../types/dashboard.types';

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{
        backgroundColor: 'var(--color-surface-card)',
        boxShadow: 'var(--shadow-md)',
        fontFamily: 'var(--font-body)',
        direction: 'rtl',
      }}
    >
      <p className="text-xs" style={{ color: 'var(--color-sand-500)' }}>
        {label ? formatDateShort(label) : ''}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="text-sm font-medium"
          style={{
            color: entry.dataKey === 'projected' ? 'var(--color-primary)' : 'var(--color-sand-700)',
            fontFamily: 'var(--font-mono)',
            direction: 'ltr',
            textAlign: 'right',
          }}
        >
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function ForecastChart({ data }: { data: ForecastPoint[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3
          className="mb-4 text-base font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
        >
          תחזית תזרים מזומנים
        </h3>
        <div className="h-[240px] w-full" style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-sand-100)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 11, fill: 'var(--color-sand-400)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: 'var(--color-sand-400)' }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#forecastGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
