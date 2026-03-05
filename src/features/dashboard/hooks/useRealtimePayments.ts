'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

export function useRealtimePayments() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('dashboard-payments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payments',
          filter: 'status=eq.completed',
        },
        (payload) => {
          const amount = (payload.new as { amount?: number }).amount;
          toast.success(`תשלום התקבל! ${amount ? formatCurrency(amount) : ''}`, {
            duration: 5000,
          });
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);
}
