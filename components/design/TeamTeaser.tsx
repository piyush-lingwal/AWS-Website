import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAdminClient } from "@/lib/supabase/admin";
import { arrangeRoster, PUBLIC_TEAM_COLUMNS, type PublicTeamMember } from "@/lib/team/roster";
import { TeamAvatar } from "@/components/features/team/TeamAvatar";
import { Reveal } from "./Reveal";

const TINTS = ["var(--card-lilac)", "var(--card-peach)", "var(--card-rose)", "var(--card-sky)", "var(--card-mint)", "var(--card-blush)"];

/** The Leadership tier from team_members, read the same way the Team page reads it. */
async function loadLeadership(): Promise<PublicTeamMember[]> {
  // team_members is admin-only under RLS, so read it with the service role.
  const db = getAdminClient();
  if (!db) return [];
  const { data, error } = await db.from("team_members").select(PUBLIC_TEAM_COLUMNS).order("name", { ascending: true });
  if (error) {
    console.error("[home] team preview load error:", error.message);
    return [];
  }
  return arrangeRoster((data ?? []) as PublicTeamMember[]).core;
}

/** Section 06. A preview of the student leadership, linking to the full Team page. */
export async function TeamTeaser() {
  const core = await loadLeadership();
  return (
    <section id="team" data-tone="bloom" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-[var(--gutter)]">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
          <p className="t-eyebrow mb-5 flex items-center justify-center gap-3">
            <span className="t-pixel text-sbg-accent">06</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Our team · Cohort 2026
          </p>
          <h2 className="t-display text-[clamp(38px,6vw,84px)] text-sbg-ink">
            Meet the people behind <span className="t-serif text-sbg-accent">the Builder Group.</span>
          </h2>
          <p className="t-lead mx-auto mt-6 max-w-xl">
            The students who set the direction and keep every wing moving.
          </p>
        </Reveal>
        {core.length > 0 && (
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {core.map((m, i) => (
              <li key={m.id}>
                <Reveal index={i % 3} className="h-full">
                  <article
                    data-tilt
                    className="surface lift flex h-full flex-col items-center gap-4 rounded-[28px] p-5 text-center sm:p-7"
                    style={{ backgroundImage: `linear-gradient(155deg, ${TINTS[i % TINTS.length]} 0%, var(--wash-80) 58%)` }}
                  >
                    <TeamAvatar src={m.picture_url} name={m.name} className="h-24 w-24 rounded-full sm:h-28 sm:w-28" />
                    <div>
                      <span className="inline-flex items-center rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sbg-accent-strong">
                        {m.role}
                      </span>
                      <h3 className="t-display mt-3 text-[20px] text-sbg-ink sm:text-[26px]">{m.name}</h3>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
        <Reveal className="mt-12 flex items-center justify-center">
          <Link href="/team" className="btn btn-primary w-full sm:w-auto">
            Meet the full team <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
