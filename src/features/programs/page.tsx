"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CardsGridSkeleton } from "@/components/common/loading/cards-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { normalizeSearchText } from "./utils/program-search";
import { ProgramsHero } from "./components/programs-hero";
import { FacultiesSidebar } from "./components/faculties-sidebar";
import { ProgramsContent } from "./components/programs-content";
import { PortalNavbar } from "@/components/layouts/portal-navbar";
import { routes } from "@/constants/routes";
import { PortalFooter } from "@/components/layouts/portal-footer";
import {
  useFacultyProgramsQuery,
  usePublicFacultiesQuery,
} from "@/hooks/queries/use-public-catalog-queries";
import {
  mapFacultyToViewModel,
  mapProgramToViewModel,
  type FacultyViewModel,
  type ProgramViewModel,
} from "./types";

export function ProgramsPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [facultySearch, setFacultySearch] = useState("");
  const [programSearch, setProgramSearch] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);

  const {
    data: publicFaculties,
    isLoading: isLoadingFaculties,
    isError: isErrorFaculties,

    refetch: refetchFaculties,
  } = usePublicFacultiesQuery();

  const facultiesList: FacultyViewModel[] = useMemo(() => {
    const safePublicFaculties = Array.isArray(publicFaculties)
      ? publicFaculties
      : [];
    return safePublicFaculties.map((f) => mapFacultyToViewModel(f, locale));
  }, [publicFaculties, locale]);

  // Derive active faculty ID without calling setState in an effect
  const activeFacultyId = useMemo(() => {
    const safeList = Array.isArray(facultiesList) ? facultiesList : [];
    if (selectedFacultyId) return selectedFacultyId;
    const urlFaculty = searchParams.get("faculty");
    if (urlFaculty) {
      const matched = safeList.find(
        (f) => String(f.id).toLowerCase() === String(urlFaculty).toLowerCase()
      );
      if (matched) return matched.id;
    }
    return safeList[0]?.id ?? "";
  }, [selectedFacultyId, searchParams, facultiesList]);

  const activeFaculty = useMemo(() => {
    const safeList = Array.isArray(facultiesList) ? facultiesList : [];
    return (
      safeList.find((f) => f.id === activeFacultyId) ??
      safeList[0] ??
      null
    );
  }, [facultiesList, activeFacultyId]);

  const {
    data: facultyProgramsData,
    isError: isErrorPrograms,

    refetch: refetchPrograms,
  } = useFacultyProgramsQuery(activeFaculty?.id);

  const safeDepartments = Array.isArray(facultyProgramsData?.departments)
    ? facultyProgramsData.departments
    : [];



  const mappedPrograms: ProgramViewModel[] = useMemo(() => {
    const safePrograms = Array.isArray(facultyProgramsData?.programs)
      ? facultyProgramsData.programs
      : [];
    return safePrograms.map((p) => mapProgramToViewModel(p, locale));
  }, [facultyProgramsData, locale]);

  const filteredFaculties = useMemo(() => {
    const safeList = Array.isArray(facultiesList) ? facultiesList : [];
    const searchValue = normalizeSearchText(facultySearch);
    if (!searchValue) return safeList;

    return safeList.filter((faculty) => {
      const searchableText = normalizeSearchText(
        [faculty.id, faculty.name, faculty.description].join(" ")
      );
      return searchableText.includes(searchValue);
    });
  }, [facultySearch, facultiesList]);

  const filteredPrograms = useMemo(() => {
    const safeList = Array.isArray(mappedPrograms) ? mappedPrograms : [];
    const searchValue = normalizeSearchText(programSearch);
    if (!searchValue) return safeList;

    return safeList.filter((program) => {
      const branchesArr = Array.isArray(program.branches) ? program.branches : [];
      const searchableText = normalizeSearchText(
        [
          program.id,
          program.name,
          program.description,
          program.degree,
          program.minimumAverage,
          ...branchesArr,
        ].join(" ")
      );
      return searchableText.includes(searchValue);
    });
  }, [mappedPrograms, programSearch]);

  function handleFacultySelect(facultyId: string) {
    setSelectedFacultyId(facultyId);
    setProgramSearch("");
  }

  const isError = isErrorFaculties || isErrorPrograms;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortalNavbar activePath={routes.faculties} />

      <main className="app-container space-y-8 py-8 md:py-12">
        <ProgramsHero />

        {isLoadingFaculties ? (
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
            <CardsGridSkeleton count={6} />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center space-y-3">
            <AlertTriangle className="size-8 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-red-800">
              {locale === "ar"
                ? "تعذر تحميل الكليات حاليًا. يرجى المحاولة لاحقًا."
                : "Unable to load faculties right now. Please try again later."}
            </h3>
            <button
              type="button"
              onClick={() => {
                refetchFaculties();
                refetchPrograms();
              }}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700"
            >
              {locale === "ar" ? "إعادة المحاولة" : "Retry Connection"}
            </button>
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <FacultiesSidebar
              faculties={filteredFaculties}
              activeFacultyId={activeFaculty?.id ?? ""}
              facultySearch={facultySearch}
              onFacultySearchChange={setFacultySearch}
              onFacultySelect={handleFacultySelect}
            />

            <ProgramsContent
              activeFaculty={activeFaculty}
              programs={filteredPrograms}
              departments={safeDepartments}
              search={programSearch}
              locale={locale}
              onSearchChange={setProgramSearch}
            />
          </section>
        )}
      </main>
      <PortalFooter />
    </div>
  );
}
