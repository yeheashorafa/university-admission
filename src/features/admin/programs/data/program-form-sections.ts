export const programFormSectionIds = [
  "identity",
  "study",
  "fees",
  "thresholds",
  "links",
  "learning",
] as const;

export type ProgramFormSectionId = (typeof programFormSectionIds)[number];

export function getInitialOpenProgramSections(): Set<ProgramFormSectionId> {
  return new Set(programFormSectionIds);
}

export function setProgramFormSectionOpen(
  openSections: ReadonlySet<ProgramFormSectionId>,
  section: ProgramFormSectionId,
  isOpen: boolean,
): Set<ProgramFormSectionId> {
  const next = new Set(openSections);
  if (isOpen) next.add(section);
  else next.delete(section);
  return next;
}

export function openProgramFormErrorSection(
  openSections: ReadonlySet<ProgramFormSectionId>,
  section: ProgramFormSectionId,
): Set<ProgramFormSectionId> {
  return setProgramFormSectionOpen(openSections, section, true);
}
