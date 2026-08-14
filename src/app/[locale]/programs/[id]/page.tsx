import { ProgramDetailsPage } from "@/features/programs/details/page";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <ProgramDetailsPage programId={id} />;
}