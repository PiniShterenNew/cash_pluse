import { createClient } from '@/lib/supabase/server';
import type { KPIData, ForecastPoint, OverdueDebt, UpcomingEvent } from '../types/dashboard.types';

type AmountRow = { amount_outstanding: number };

export async function fetchKPIData(): Promise<KPIData> {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0]!;
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]!;

  const [openDebtsResult, overdueResult, forecastResult] = await Promise.all([
    supabase
      .from('debts')
      .select('amount_outstanding')
      .or('status.eq.open,status.eq.due_today,status.eq.overdue,status.eq.partially_paid'),
    supabase
      .from('debts')
      .select('amount_outstanding')
      .filter('status', 'eq', 'overdue'),
    supabase
      .from('debts')
      .select('amount_outstanding')
      .or('status.eq.open,status.eq.due_today,status.eq.partially_paid')
      .lte('due_date', thirtyDaysFromNow)
      .gte('due_date', today),
  ]);

  const openDebts = (openDebtsResult.data ?? []) as AmountRow[];
  const overdueDebts = (overdueResult.data ?? []) as AmountRow[];
  const forecastDebts = (forecastResult.data ?? []) as AmountRow[];

  const balance = openDebts.reduce((sum, d) => sum + d.amount_outstanding, 0);
  const totalOverdue = overdueDebts.reduce((sum, d) => sum + d.amount_outstanding, 0);
  const incomeForecast30d = forecastDebts.reduce((sum, d) => sum + d.amount_outstanding, 0);

  return {
    balance,
    totalOverdue,
    overdueCount: overdueDebts.length,
    incomeForecast30d,
    totalDebts: openDebts.length,
  };
}

export async function fetchForecastData(): Promise<ForecastPoint[]> {
  const supabase = await createClient();

  const today = new Date();
  const points: ForecastPoint[] = [];

  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [debtsResult, paymentsResult, allOpenResult] = await Promise.all([
    supabase
      .from('debts')
      .select('amount_outstanding, due_date')
      .or('status.eq.open,status.eq.due_today,status.eq.overdue,status.eq.partially_paid')
      .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0]!)
      .order('due_date', { ascending: true }),
    supabase
      .from('payments')
      .select('amount, paid_at')
      .filter('status', 'eq', 'completed')
      .gte('paid_at', new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('debts')
      .select('amount_outstanding')
      .or('status.eq.open,status.eq.due_today,status.eq.overdue,status.eq.partially_paid'),
  ]);

  const debts = (debtsResult.data ?? []) as Array<{ amount_outstanding: number; due_date: string }>;
  const payments = (paymentsResult.data ?? []) as Array<{ amount: number; paid_at: string | null }>;
  const allOpen = (allOpenResult.data ?? []) as AmountRow[];

  let runningBalance = allOpen.reduce((sum, d) => sum + d.amount_outstanding, 0);

  // Group debts by due date
  const debtsByDate = new Map<string, number>();
  for (const debt of debts) {
    const dateKey = debt.due_date;
    debtsByDate.set(dateKey, (debtsByDate.get(dateKey) ?? 0) + debt.amount_outstanding);
  }

  // Group payments by date
  const paymentsByDate = new Map<string, number>();
  for (const payment of payments) {
    if (payment.paid_at) {
      const dateKey = payment.paid_at.split('T')[0]!;
      paymentsByDate.set(dateKey, (paymentsByDate.get(dateKey) ?? 0) + payment.amount);
    }
  }

  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0]!;

    const expectedPayment = debtsByDate.get(dateStr) ?? 0;
    runningBalance -= expectedPayment;

    const actualPayment = paymentsByDate.get(dateStr) ?? null;

    points.push({
      date: dateStr,
      projected: Math.max(0, runningBalance),
      actual: actualPayment,
    });
  }

  return points;
}

export async function fetchOverdueDebts(): Promise<OverdueDebt[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('debts')
    .select('id, amount_outstanding, due_date, overdue_days, clients(name, phone_e164)')
    .filter('status', 'eq', 'overdue')
    .order('overdue_days', { ascending: false })
    .limit(5);

  type DebtWithClient = {
    id: string;
    amount_outstanding: number;
    due_date: string;
    overdue_days: number;
    clients: { name: string; phone_e164: string } | null;
  };

  return ((data ?? []) as DebtWithClient[]).map((debt) => ({
    id: debt.id,
    clientName: debt.clients?.name ?? '',
    clientPhone: debt.clients?.phone_e164 ?? '',
    amountOutstanding: debt.amount_outstanding,
    dueDate: debt.due_date,
    overdueDays: debt.overdue_days,
  }));
}

export async function fetchUpcomingEvents(): Promise<UpcomingEvent[]> {
  const supabase = await createClient();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]!;
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]!;

  const { data } = await supabase
    .from('debts')
    .select('id, amount_outstanding, due_date, clients(name)')
    .or('status.eq.open,status.eq.due_today')
    .gte('due_date', todayStr)
    .lte('due_date', sevenDaysFromNow)
    .order('due_date', { ascending: true })
    .limit(7);

  type DebtWithClient = {
    id: string;
    amount_outstanding: number;
    due_date: string;
    clients: { name: string } | null;
  };

  return ((data ?? []) as DebtWithClient[]).map((debt) => {
    const dueDate = new Date(debt.due_date);
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

    return {
      id: debt.id,
      clientName: debt.clients?.name ?? '',
      amountOutstanding: debt.amount_outstanding,
      dueDate: debt.due_date,
      daysUntil,
      type: daysUntil === 0 ? 'due_today' as const : 'upcoming' as const,
    };
  });
}

export async function hasAnyDebts(): Promise<boolean> {
  const supabase = await createClient();

  const { count } = await supabase
    .from('debts')
    .select('id', { count: 'exact', head: true });

  return (count ?? 0) > 0;
}
