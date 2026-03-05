import { TrendingUp, AlertTriangle, Calendar, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { KPIData } from '../types/dashboard.types';

type KPICardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  subtitle?: string;
};

function KPICard({ label, value, icon, accent, subtitle }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-sand-500)', fontFamily: 'var(--font-body)' }}
            >
              {label}
            </p>
            <p
              className="mt-2 text-2xl font-semibold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink)', direction: 'ltr', textAlign: 'right' }}
            >
              {value}
            </p>
            {subtitle && (
              <p
                className="mt-1 text-xs"
                style={{ color: 'var(--color-sand-400)', fontFamily: 'var(--font-body)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: accent + '15', color: accent }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KPICards({ data }: { data: KPIData }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KPICard
        label="יתרה פתוחה"
        value={formatCurrency(data.balance)}
        icon={<Layers size={20} strokeWidth={1.5} />}
        accent="var(--color-primary)"
        subtitle={`${data.totalDebts} חובות פתוחים`}
      />
      <KPICard
        label="סה״כ באיחור"
        value={formatCurrency(data.totalOverdue)}
        icon={<AlertTriangle size={20} strokeWidth={1.5} />}
        accent="var(--color-danger)"
        subtitle={`${data.overdueCount} חובות`}
      />
      <KPICard
        label="תחזית הכנסה 30 יום"
        value={formatCurrency(data.incomeForecast30d)}
        icon={<TrendingUp size={20} strokeWidth={1.5} />}
        accent="var(--color-primary)"
      />
      <KPICard
        label="חובות באיחור"
        value={String(data.overdueCount)}
        icon={<Calendar size={20} strokeWidth={1.5} />}
        accent="var(--color-warning)"
      />
    </div>
  );
}
