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
    <section aria-labelledby="events-heading" className="space-y-5">
      <div>
        <h2 id="events-heading" className="t-display text-2xl text-sbg-ink sm:text-3xl">
          Pick an <span className="t-serif text-sbg-accent">event.</span>
        </h2>
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
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {events.map((event) => {
            const d = event.event_date ? new Date(event.event_date + "T00:00:00") : null;
            const valid = d && !Number.isNaN(d.getTime());
            return (
              <li key={event.id}>
                <Link
                  href={`/media/events/${event.id}`}
                  className="surface lift group flex h-full items-center gap-4 rounded-[22px] p-4 transition-colors hover:bg-sbg-lilac-50 focus-visible:bg-sbg-lilac-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sbg-lilac-600"
                >
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sbg-lilac-100 text-center leading-tight text-sbg-lilac-700">
                    {valid ? (
                      <span>
                        <span className="block text-lg font-bold">{d!.getDate()}</span>
                        <span className="block text-[10px] font-semibold uppercase tracking-wide">
                          {d!.toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wide">TBA</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-sbg-ink">{event.name}</p>
                    <p className="truncate text-xs text-sbg-ink-2">{formatDate(event.event_date)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-sbg-lilac-600 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
