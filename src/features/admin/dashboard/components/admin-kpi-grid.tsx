"use client";

import { useMemo } from "react";

import { AdminKpiCard } from "./admin-kpi-card";
import type { AdminKpiCard as KpiCardType } from "../data/admin-dashboard.data";

export function AdminKpiGrid() {
  const cards: KpiCardType[] = useMemo(() => {
    return [
      { id: "total", label: "Total Applications", value: "Pending API" },
      { id: "review", label: "Under Review", value: "Pending API", variant: "warning" },
      { id: "missing", label: "Returned / Revision", value: "Pending API" },
      { id: "accepted", label: "Accepted", value: "Pending API", variant: "success" },
      { id: "rejected", label: "Rejected", value: "Pending API", variant: "danger" },
    ];
  }, []);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <AdminKpiCard key={card.id} card={card} />
      ))}
    </section>
  );
}