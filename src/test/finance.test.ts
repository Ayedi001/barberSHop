import { describe, expect, it } from "vitest";
import {
  totalRevenue,
  paymentBreakdown,
  splitAppointments,
  revenueByMonth,
  appointmentDurationMinutes,
} from "@/lib/finance";

const payments = [
  { amount: 25, method: "cash", paid_at: "2026-11-05" },
  { amount: 40, method: "card", paid_at: "2026-11-12" },
  { amount: 18, method: "cash", paid_at: "2026-11-19" },
];

describe("finances barbershop", () => {
  it("calcule les recettes totales : 25 + 40 + 18 = 83 DT", () => {
    expect(totalRevenue(payments)).toBe(83);
  });

  it("répartit correctement les encaissements espèces vs carte", () => {
    const { cash, card } = paymentBreakdown(payments);
    expect(cash).toBe(43);
    expect(card).toBe(40);
  });

  it("regroupe le chiffre d'affaires par mois", () => {
    expect(revenueByMonth(payments, 2026)[10]).toBe(83);
  });
});

describe("rendez-vous et durées de prestation", () => {
  const now = new Date("2026-11-20T12:00:00");

  it("calcule la durée exacte d'un rendez-vous en minutes", () => {
    expect(
      appointmentDurationMinutes({
        starts_at: "2026-11-20T10:00:00",
        ends_at: "2026-11-20T10:45:00",
      }),
    ).toBe(45);
  });

  it("sépare les prestations effectuées et à venir en excluant les annulations", () => {
    const { completedCount, upcomingCount, totalMinutes } = splitAppointments(
      [
        { starts_at: "2026-11-19T09:00:00", ends_at: "2026-11-19T09:30:00", status: "completed" },
        { starts_at: "2026-11-21T14:00:00", ends_at: "2026-11-21T14:45:00", status: "confirmed" },
        { starts_at: "2026-11-22T10:00:00", ends_at: "2026-11-22T10:30:00", status: "cancelled" },
      ],
      now,
    );
    expect(completedCount).toBe(1);
    expect(upcomingCount).toBe(1);
    expect(totalMinutes).toBe(30);
  });
});
