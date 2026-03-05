import { Suspense } from 'react';
import { KPICards } from './KPICards';
import { KPISkeleton } from './KPISkeleton';
import { ForecastChart } from './ForecastChart';
import { ForecastSkeleton } from './ForecastSkeleton';
import { OverdueMiniList } from './OverdueMiniList';
import { UpcomingTimeline } from './UpcomingTimeline';
import { QuickActions } from './QuickActions';
import { DashboardEmptyState } from './DashboardEmptyState';
import {
  fetchKPIData,
  fetchForecastData,
  fetchOverdueDebts,
  fetchUpcomingEvents,
  hasAnyDebts,
} from '../api/queries';

async function KPISection() {
  const data = await fetchKPIData();
  return <KPICards data={data} />;
}

async function ForecastSection() {
  const data = await fetchForecastData();
  return <ForecastChart data={data} />;
}

async function OverdueSection() {
  const debts = await fetchOverdueDebts();
  return <OverdueMiniList debts={debts} />;
}

async function UpcomingSection() {
  const events = await fetchUpcomingEvents();
  return <UpcomingTimeline events={events} />;
}

export async function DashboardContent() {
  const hasDebts = await hasAnyDebts();

  if (!hasDebts) {
    return <DashboardEmptyState />;
  }

  return (
    <div className="space-y-6">
      <QuickActions />

      <Suspense fallback={<KPISkeleton />}>
        <KPISection />
      </Suspense>

      <Suspense fallback={<ForecastSkeleton />}>
        <ForecastSection />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={null}>
          <OverdueSection />
        </Suspense>

        <Suspense fallback={null}>
          <UpcomingSection />
        </Suspense>
      </div>
    </div>
  );
}
