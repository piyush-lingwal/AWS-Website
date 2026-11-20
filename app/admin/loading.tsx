import { AdminPageSkeleton } from "@/components/admin/Skeletons";

// Shown while an admin page is being prepared on the server (after the admin check).
export default function AdminLoading() {
  return (
    <div className="w-full min-w-0">
      <AdminPageSkeleton />
    </div>
  );
}
