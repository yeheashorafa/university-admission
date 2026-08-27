"use client";

import type { ReactNode } from "react";

export function ReportPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-bold text-primary">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function BarRowList({
  items,
}: {
  items: { label: string; count: number }[];
}) {
  const maxValue = Math.max(1, ...items.map((item) => item.count));

  if (items.length === 0) return <EmptyState />;

  return (
    <div className="space-y-5">
      {items.map((item) => {
        const percentage = Math.round((item.count / maxValue) * 100);

        return (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <p className="font-semibold text-foreground">{item.label}</p>
              <span className="font-bold text-primary">{item.count}</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function KeyValueList({
  items,
}: {
  items: { label: string; value: string | number }[];
}) {
  if (items.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-muted/40 p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ReportTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
}) {
  if (rows.length === 0) return <EmptyState />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-3 py-2 text-left font-semibold text-muted-foreground"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border/60">
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-2 text-foreground">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ message = "No data available." }: { message?: string }) {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>
  );
}

export function LoadingState() {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
  );
}

export function ErrorState({
  message = "Failed to load report data.",
}: {
  message?: string;
}) {
  return (
    <p className="py-8 text-center text-sm font-semibold text-destructive">
      {message}
    </p>
  );
}
