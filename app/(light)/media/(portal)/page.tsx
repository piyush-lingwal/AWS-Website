import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requirePortalPage } from "@/lib/auth/require-portal-page";
import { getAdminClient } from "@/lib/supabase/admin";

// Always fresh: this lists live data and sits behind sign-in.
export const dynamic = "force-dynamic";

interface EventRow {
  id: string;
  name: string;
  event_date: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Date to be announced";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "Date to be announced";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function MediaHomePage() {
  // Layouts are not re-run on client navigation, so check the role here too.
  await requirePortalPage();
  const db = getAdminClient();
  let events: EventRow[] = [];
  let loadFailed = false;

  if (!db) {
    loadFailed = true;
  } else {
    const { data, error } = await db
      .from("events")
      .select("id, name, event_date")
      .order("event_date", { ascending: false, nullsFirst: true });

    if (error) {
      console.error("[media] events load error:", error.message);
      loadFailed = true;
    } else {
      events = (data ?? []) as EventRow[];
    }
  }

  return (
    <section aria-labelledby="events-heading" className="space-y-4">
      <div>
        <h2 id="events-heading" className="text-lg font-semibold text-sbg-ink">Events</h2>
        <p className="mt-1 text-sm text-sbg-ink-2">
          Events created by the super admin appear here. Pick one to upload its
          photos and videos.
        </p>
      </div>

      {loadFailed ? (
        <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          Could not load events. Please try again shortly.
        </p>
      ) : events.length === 0 ? (
        <p className="surface rounded-[28px] p-6 text-sm text-sbg-ink-2">
          No events yet. Ask a super admin to create one.
        </p>
      ) : (
        <ul className="surface divide-y divide-sbg-ink/10 overflow-hidden rounded-[28px]">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/media/events/${event.id}`}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-sbg-lilac-50 focus-visible:bg-sbg-lilac-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sbg-lilac-600"
              >
                <span className="font-medium text-sbg-ink">{event.name}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs font-mono text-sbg-ink-2">
                  {formatDate(event.event_date)}
                  <ChevronRight className="h-4 w-4 text-sbg-lilac-600" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
