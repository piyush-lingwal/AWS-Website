import { AdminPageSkeleton } from "@/components/admin/Skeletons";

// Shown while an admin page is being prepared on the server (after the admin check).
export default function AdminLoading() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 pt-24 sm:pt-28 pb-24">
      <AdminPageSkeleton />
    </div>
  );
}
