import { KPISkeleton } from '@/features/dashboard/components/KPISkeleton';
import { ForecastSkeleton } from '@/features/dashboard/components/ForecastSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <main className="p-6 lg:p-8">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="space-y-6">
        <KPISkeleton />
        <ForecastSkeleton />
      </div>
    </main>
  );
}
