"use client";

import { useLocale } from "next-intl";
import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus, School, Loader2 } from "lucide-react";
import {
  useFacultyProgramsQuery,
  usePublicFacultiesQuery,
} from "@/hooks/queries/use-public-catalog-queries";
import {
  mapFacultyToViewModel,
  mapProgramToViewModel,
  type FacultyViewModel,
  type ProgramViewModel,
} from "@/features/programs/types";

import { DESIRED_STUDY_LEVELS } from "../../constants/qualification.constants";

type PreferencesStepProps = {
  selectedIds: (string | number)[];
  onChange: (updatedIds: (string | number)[]) => void;
  desiredStudyLevel?: string;
};

export function PreferencesStep({
  selectedIds,
  onChange,
  desiredStudyLevel,
}: PreferencesStepProps) {
  const locale = useLocale();
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");

  const { data: publicFaculties, isLoading: isLoadingFaculties } = usePublicFacultiesQuery();

  const facultiesList: FacultyViewModel[] = useMemo(() => {
    const safePublicFaculties = Array.isArray(publicFaculties) ? publicFaculties : [];
    return safePublicFaculties.map((f) => mapFacultyToViewModel(f, locale));
  }, [publicFaculties, locale]);

  const activeFacultyId = selectedFacultyId || facultiesList[0]?.id || "";

  const { data: facultyProgramsData, isLoading: isLoadingPrograms } =
    useFacultyProgramsQuery(activeFacultyId);

  const availablePrograms: ProgramViewModel[] = useMemo(() => {
    const safePrograms = Array.isArray(facultyProgramsData?.programs)
      ? facultyProgramsData.programs
      : [];
    return safePrograms.map((p) => mapProgramToViewModel(p, locale));
  }, [facultyProgramsData, locale]);

  const normalizedSelectedIds = useMemo(() => {
    const safeSelectedIds = Array.isArray(selectedIds) ? selectedIds : [];
    return safeSelectedIds.map((id) => String(id));
  }, [selectedIds]);

  const safeSelectedIds = Array.isArray(selectedIds) ? selectedIds : [];

  const handleAdd = (programId: string) => {
    if (normalizedSelectedIds.includes(String(programId))) return;
    if (normalizedSelectedIds.length >= 3) return;
    onChange([...safeSelectedIds, programId]);
  };

  const handleRemove = (programId: string | number) => {
    onChange(safeSelectedIds.filter((id) => String(id) !== String(programId)));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= safeSelectedIds.length) return;

    const copy = [...safeSelectedIds];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  const safeFacultiesList = Array.isArray(facultiesList) ? facultiesList : [];
  const safeAvailablePrograms = Array.isArray(availablePrograms) ? availablePrograms : [];

  const desiredLevelLabel = useMemo(() => {
    if (!desiredStudyLevel) return null;
    const match = DESIRED_STUDY_LEVELS.find((l) => l.id === desiredStudyLevel);
    return match ? (locale === "ar" ? match.labelAr : match.labelEn) : desiredStudyLevel;
  }, [desiredStudyLevel, locale]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {locale === "ar" ? "7. رغبات القبول والتخصصات" : "7. Admission Preferences"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "ar"
              ? "اختر الكلية أولاً لرؤية البرامج المتاحة، ثم أضف حتى 3 رغبات مرتبة حسب الأولوية."
              : "Select a faculty first to browse programs, then add up to 3 preferences sorted by priority."}
          </p>
        </div>

        {desiredLevelLabel && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3.5 py-2 text-xs font-extrabold text-primary shrink-0 self-start md:self-auto">
            <span className="text-muted-foreground">
              {locale === "ar" ? "درجة الدراسة المطلوبة:" : "Desired Degree:"}
            </span>
            <span>{desiredLevelLabel}</span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Side: Select Faculty and Programs */}
        <div className="space-y-6 lg:col-span-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground block">
              {locale === "ar" ? "اختر الكلية *" : "Select Faculty *"}
            </label>

            {isLoadingFaculties ? (
              <div className="flex items-center justify-center p-6 space-y-2">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {safeFacultiesList.map((fac) => {
                  const isSelected = activeFacultyId === fac.id;

                  return (
                    <button
                      key={fac.id}
                      type="button"
                      onClick={() => setSelectedFacultyId(fac.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-start transition ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/20 hover:bg-muted/50"
                      }`}
                    >
                      <School className="size-5 text-primary shrink-0" />
                      <span className="text-sm font-bold text-foreground">
                        {fac.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {activeFacultyId && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground block border-b pb-2">
                {locale === "ar" ? "البرامج الأكاديمية المتاحة" : "Available Academic Programs"}
              </label>

              {isLoadingPrograms ? (
                <div className="flex items-center justify-center p-6 space-y-2">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : safeAvailablePrograms.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                  {locale === "ar"
                    ? "لا توجد برامج متاحة في هذه الكلية حالياً"
                    : "No available programs in this faculty"}
                </div>
              ) : (
                <div className="grid gap-3">
                  {safeAvailablePrograms.map((program) => {
                    const isSelected = normalizedSelectedIds.includes(String(program.id));
                    const isLimitReached = normalizedSelectedIds.length >= 3;
                    const canAdd = !isSelected && !isLimitReached && program.isActive;

                    return (
                      <div
                        key={program.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Plus className="size-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground">
                              {program.name}
                            </h4>
                            {program.facultyName && (
                              <span className="text-xs text-muted-foreground block mt-0.5">
                                {program.facultyName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {program.minimumAverage > 0 && (
                            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                              {locale === "ar"
                                ? `الحد الأدنى: ${program.minimumAverage}%`
                                : `Min: ${program.minimumAverage}%`}
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={!canAdd}
                            onClick={() => handleAdd(program.id)}
                            className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-bold transition ${
                              isSelected
                                ? "bg-muted text-muted-foreground cursor-default"
                                : !program.isActive
                                ? "bg-red-50 text-red-500 border border-red-200 cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:bg-primary/95"
                            }`}
                          >
                            {isSelected
                              ? locale === "ar"
                                ? "مضاف"
                                : "Added"
                              : !program.isActive
                              ? locale === "ar"
                                ? "غير متاح"
                                : "Not Available"
                              : locale === "ar"
                              ? "إضافة للرغبات"
                              : "Add to Preference"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Selected Preferences List */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div>
              <h4 className="font-bold text-foreground">
                {locale === "ar" ? "رغباتي المختارة" : "My Selected Preferences"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "ar"
                  ? "يمكنك ترتيب الرغبات (بحد أقصى 3) باستخدام الأسهم."
                  : "Arrange preferences (max 3) using arrow buttons."}
              </p>
            </div>

            {safeSelectedIds.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                {locale === "ar" ? "لم تقم بإضافة رغبات بعد." : "No preferences added yet."}
              </div>
            ) : (
              <div className="space-y-3">
                {safeSelectedIds.map((id, idx) => (
                  <div
                    key={String(id)}
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-foreground truncate">
                          {safeAvailablePrograms.find((p) => String(p.id) === String(id))?.name || `${locale === "ar" ? "برنامج رقم" : "Program ID"} #${id}`}
                        </h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title={locale === "ar" ? "نقل لأعلى" : "Move Up"}
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === safeSelectedIds.length - 1}
                        onClick={() => handleMove(idx, "down")}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
                        title={locale === "ar" ? "نقل لأسفل" : "Move Down"}
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(id)}
                        className="p-1 rounded hover:bg-red-50 text-red-500 transition"
                        title={locale === "ar" ? "إزالة" : "Remove"}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
