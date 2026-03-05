import { Suspense } from 'react';
import { getTimeGreeting } from '@/lib/utils';
import { DashboardContent } from '@/features/dashboard/components/DashboardContent';
import { DashboardRealtimeProvider } from '@/features/dashboard/components/DashboardRealtimeProvider';
import { KPISkeleton } from '@/features/dashboard/components/KPISkeleton';
import { ForecastSkeleton } from '@/features/dashboard/components/ForecastSkeleton';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <KPISkeleton />
      <ForecastSkeleton />
    </div>
  );
}

export default function DashboardPage() {
  const greeting = getTimeGreeting();

  return (
    <DashboardRealtimeProvider>
      <main className="p-6 lg:p-8">
        <h1
          className="mb-6 text-2xl font-medium"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}
        >
          {greeting} 👋
        </h1>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>
    </DashboardRealtimeProvider>
  );
}
