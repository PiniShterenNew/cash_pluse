import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function ForecastSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="h-[240px] w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}
