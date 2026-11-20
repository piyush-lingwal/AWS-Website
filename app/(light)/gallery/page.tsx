import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { Gallery } from "@/components/features/gallery/Gallery";
import { getAdminClient } from "@/lib/supabase/admin";
import { getGalleryGroups } from "@/lib/media/public-data";

export const metadata: Metadata = buildPageMetadata({
  path: "/gallery",
  title: "Gallery",
  description:
    "Photos and videos from AWS Student Builder Group workshops, hackathons, and community events at Tulas University.",
});

// Media is moderated by admins/media members; stay fresh rather than caching
// a hidden/deleted item. The item API also explicitly revalidates this path.
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const db = getAdminClient();
  let groups: Awaited<ReturnType<typeof getGalleryGroups>> = [];

  if (db) {
    const { data, error } = await db
      .from("events")
      .select("id, name, event_date")
      .order("event_date", { ascending: false, nullsFirst: true });
    if (error) {
      console.error("[gallery] events load error:", error.message);
    } else {
      groups = await getGalleryGroups(data ?? []);
    }
  }

  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <main id="main-content">
          <Gallery groups={groups} />
        </main>
        <DesignFooter />
      </div>
    </>
  );
}
