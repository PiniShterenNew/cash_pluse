import { MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import type { OverdueDebt } from '../types/dashboard.types';

function OverdueRow({ debt }: { debt: OverdueDebt }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid var(--color-sand-100)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-danger)' + '15',
            color: 'var(--color-danger)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {debt.clientName.charAt(0)}
        </div>
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}
          >
            {debt.clientName}
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-body)' }}
          >
            {debt.overdueDays > 0 ? `לפני ${debt.overdueDays} ימים` : 'היום'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-medium"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-danger)',
            direction: 'ltr',
          }}
        >
          {formatCurrency(debt.amountOutstanding)}
        </span>
        <Button
          variant="whatsapp"
          size="sm"
          leftIcon={<MessageCircle size={14} strokeWidth={1.5} />}
          aria-label={`שלח תזכורת ל${debt.clientName}`}
        >
          תזכורת
        </Button>
      </div>
    </div>
  );
}

export function OverdueMiniList({ debts }: { debts: OverdueDebt[] }) {
  if (debts.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-5">
        <h3
          className="mb-3 text-base font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
        >
          חובות באיחור
        </h3>
        <div>
          {debts.map((debt) => (
            <OverdueRow key={debt.id} debt={debt} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
