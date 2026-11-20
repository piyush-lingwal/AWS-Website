import type { Metadata } from "next";
import { ScrollAtmosphere } from "@/components/design/ScrollAtmosphere";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { Team } from "@/components/features/team/Team";
import { getAdminClient } from "@/lib/supabase/admin";
import { PUBLIC_TEAM_COLUMNS, type PublicTeamMember } from "@/lib/team/roster";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Meet the faculty, student leaders, and wing members of the AWS Student Builder Group at Tulas University, Dehradun.",
  alternates: {
    canonical: "/team",
  },
};

// The roster is edited in the admin panel; show changes without a redeploy.
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  // team_members is admin-only under RLS, so read it here with the service role.
  const db = getAdminClient();
  let members: PublicTeamMember[] = [];
  if (db) {
    const { data, error } = await db
      .from("team_members")
      .select(PUBLIC_TEAM_COLUMNS)
      .order("name", { ascending: true });
    if (error) {
      console.error("[team] roster load error:", error.message);
    } else {
      members = (data ?? []) as PublicTeamMember[];
    }
  }

  return (
    <>
      <ScrollAtmosphere />
      <DesignNav />
      <div className="relative z-10">
        <Team members={members} />
        <DesignFooter />
      </div>
    </>
  );
}
