export type KPIData = {
  balance: number;
  totalOverdue: number;
  overdueCount: number;
  incomeForecast30d: number;
  totalDebts: number;
};

export type ForecastPoint = {
  date: string;
  projected: number;
  actual: number | null;
};

export type OverdueDebt = {
  id: string;
  clientName: string;
  clientPhone: string;
  amountOutstanding: number;
  dueDate: string;
  overdueDays: number;
};

export type UpcomingEvent = {
  id: string;
  clientName: string;
  amountOutstanding: number;
  dueDate: string;
  daysUntil: number;
  type: 'due_today' | 'upcoming';
};
