'use client';

import { Zap } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRouter } from 'next/navigation';

export function DashboardEmptyState() {
  const router = useRouter();

  return (
    <EmptyState
      icon={<Zap size={32} strokeWidth={1.5} />}
      title="הדשבורד שלך ריק"
      description="הוסיפו את החוב הראשון כדי להתחיל לעקוב אחרי התזרים"
      ctaLabel="+ חוב חדש"
      onCta={() => router.push('/dashboard' as never)}
    />
  );
}
