import { Clock, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { UpcomingEvent } from '../types/dashboard.types';

function TimelineItem({ event }: { event: UpcomingEvent }) {
  const isDueToday = event.type === 'due_today';

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: isDueToday
            ? 'var(--color-warning)' + '20'
            : 'var(--color-primary)' + '15',
          color: isDueToday ? 'var(--color-warning)' : 'var(--color-primary)',
        }}
      >
        {isDueToday ? (
          <Clock size={16} strokeWidth={1.5} />
        ) : (
          <CalendarClock size={16} strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1">
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}
        >
          {event.clientName}
        </p>
        <p
          className="text-xs"
          style={{
            color: isDueToday ? 'var(--color-warning)' : 'var(--color-sand-400)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {event.daysUntil === 0 ? 'היום' : event.daysUntil === 1 ? 'מחר' : `בעוד ${event.daysUntil} ימים`}
        </p>
      </div>
      <span
        className="text-sm font-medium"
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-ink)',
          direction: 'ltr',
        }}
      >
        {formatCurrency(event.amountOutstanding)}
      </span>
    </div>
  );
}

export function UpcomingTimeline({ events }: { events: UpcomingEvent[] }) {
  if (events.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-5">
        <h3
          className="mb-3 text-base font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
        >
          7 הימים הקרובים
        </h3>
        <div>
          {events.map((event) => (
            <TimelineItem key={event.id} event={event} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
