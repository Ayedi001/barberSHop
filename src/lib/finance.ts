export type PaymentLike = { amount: number | string; method?: string; paid_at?: string };
export type AppointmentLike = { starts_at: string; ends_at: string; status: string; price?: number };

export function totalRevenue(payments: PaymentLike[]) {
  return payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
}

export function paymentBreakdown(payments: PaymentLike[]) {
  let cash = 0;
  let card = 0;
  for (const p of payments) {
    const val = Number(p.amount || 0);
    if (p.method === "cash") cash += val;
    else card += val;
  }
  return { cash, card };
}

export function appointmentDurationMinutes(a: Pick<AppointmentLike, "starts_at" | "ends_at">) {
  return Math.max(0, (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60_000);
}

export function splitAppointments(appts: AppointmentLike[], now: Date = new Date()) {
  let completedCount = 0;
  let upcomingCount = 0;
  let totalMinutes = 0;

  for (const a of appts) {
    if (a.status === "cancelled") continue;
    const mins = appointmentDurationMinutes(a);
    if (a.status === "completed" || new Date(a.ends_at) <= now) {
      completedCount++;
      totalMinutes += mins;
    } else {
      upcomingCount++;
    }
  }

  return { completedCount, upcomingCount, totalMinutes };
}

export function revenueByMonth(payments: PaymentLike[], year: number) {
  const months = Array.from({ length: 12 }, () => 0);
  for (const p of payments) {
    if (!p.paid_at) continue;
    const d = new Date(p.paid_at);
    if (d.getFullYear() === year) {
      const m = d.getMonth();
      months[m] = (months[m] ?? 0) + Number(p.amount || 0);
    }
  }
  return months;
}
