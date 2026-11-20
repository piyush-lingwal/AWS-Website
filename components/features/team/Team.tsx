import { arrangeRoster, type PublicTeamMember } from "@/lib/team/roster";
import { TeamHero } from "./TeamHero";
import { TeamFaculty } from "./TeamFaculty";
import { TeamLeadership } from "./TeamLeadership";
import { TeamMembersDirectory } from "./TeamMembersDirectory";

// The page background (ScrollAtmosphere) lives in app/(light)/team/page.tsx.
// Each section declares its own data-tone, so this wrapper stays transparent.
// Order: HOD → Faculty → Leadership → Wings. The recruitment sections
// (selection roadmap, wings hiring, FAQ, CTA) are no longer rendered here.
export function Team({ members }: { members: PublicTeamMember[] }) {
  const { core, wings } = arrangeRoster(members);

  return (
    <div className="relative">
      <TeamHero memberCount={new Set([...core, ...wings.flatMap((w) => w.members)].map((m) => m.id)).size} wingCount={wings.length} />
      <TeamFaculty />
      <TeamLeadership core={core} />
      <TeamMembersDirectory wings={wings} />
      {members.length === 0 && (
        <section data-tone="bloom" className="px-[var(--gutter)] pb-24">
          <p className="surface mx-auto max-w-md rounded-[24px] p-8 text-center text-sm text-sbg-ink-2">
            The student roster is being updated. Check back soon.
          </p>
        </section>
      )}
    </div>
  );
}
