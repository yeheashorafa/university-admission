import { StudentGuard } from "@/components/auth/student-guard";
import { SocialResearchPage } from "@/features/social-research/page";

type Props = {
  params: Promise<{ applicationId: string }>;
};

export default async function Page({ params }: Props) {
  const resolvedParams = await params;

  return (
    <StudentGuard>
      <SocialResearchPage applicationId={resolvedParams.applicationId} />
    </StudentGuard>
  );
}
