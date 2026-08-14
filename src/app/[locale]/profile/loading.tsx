import { ProfileSkeleton } from "@/components/common/loading/profile-skeleton";

export default function ProfileLoading() {
  return (
    <div className="app-container py-10">
      <ProfileSkeleton />
    </div>
  );
}
