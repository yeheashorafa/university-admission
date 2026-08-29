"use client";

import { useTranslations } from "next-intl";
import { Building2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FacultyViewModel } from "../types";

type FacultiesSidebarProps = {
  faculties: FacultyViewModel[];
  activeFacultyId: string;
  facultySearch: string;
  onFacultySearchChange: (value: string) => void;
  onFacultySelect: (facultyId: string) => void;
};

export function FacultiesSidebar({
  faculties,
  activeFacultyId,
  facultySearch,
  onFacultySearchChange,
  onFacultySelect,
}: FacultiesSidebarProps) {
  const t = useTranslations("programsPage");
  const safeFaculties = Array.isArray(faculties) ? faculties : [];

  return (
    <aside className="h-max rounded-[28px] border border-border bg-card p-5 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
          <Building2 className="size-5 text-secondary" />
          {t("facultiesTitle")}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("facultiesDescription")}
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

        <input
          id="facultySearch"
          name="facultySearch"
          type="text"
          value={facultySearch}
          onChange={(event) => onFacultySearchChange(event.target.value)}
          placeholder={t("facultySearchPlaceholder")}
          className="h-11 w-full rounded-[16px] border border-input bg-background px-4 ps-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="max-h-[430px] space-y-3 overflow-y-auto pe-1">
        {safeFaculties.map((faculty) => {
          const isActive = faculty.id === activeFacultyId;

          return (
            <button
              key={faculty.id}
              type="button"
              onClick={() => onFacultySelect(faculty.id)}
              className={cn(
                "w-full rounded-[20px] border p-4 text-start transition",
                isActive
                  ? "border-primary bg-primary/10 shadow-[0px_8px_24px_rgba(118,188,33,0.10)]"
                  : "border-border bg-background hover:border-primary/30 hover:bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={cn(
                      "font-bold",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {faculty.name}
                  </p>

                  {faculty.description && (
                    <p className="mt-2 max-h-12 overflow-hidden text-sm leading-6 text-muted-foreground">
                      {faculty.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {safeFaculties.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
            {t("noFacultiesFound")}
          </div>
        )}
      </div>
    </aside>
  );
}