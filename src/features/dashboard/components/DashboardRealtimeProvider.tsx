'use client';

import { useRealtimePayments } from '../hooks/useRealtimePayments';

export function DashboardRealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtimePayments();
  return <>{children}</>;
}
