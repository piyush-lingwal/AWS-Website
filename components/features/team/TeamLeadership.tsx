import { Reveal } from "@/components/design/Reveal";
import type { PublicTeamMember } from "@/lib/team/roster";
import { TeamAvatar } from "./TeamAvatar";

const TINTS = ["var(--card-lilac)", "var(--card-peach)", "var(--card-rose)", "var(--card-sky)", "var(--card-mint)", "var(--card-blush)"];

/** Desktop grid (6 columns): rows of three; the first two are featured wide when the rest fill rows of three (e.g. 5). */
const featured = (i: number, n: number) => i < 2 && n > 3 && (n - 2) % 3 === 0;
const span = (i: number, n: number) => (featured(i, n) ? "lg:col-span-3" : "lg:col-span-2");

const detail = (m: PublicTeamMember) => [m.course, m.branch].filter(Boolean).join(" · ");

/** The leadership titles (see LEADERSHIP_ROLES in lib/team/roster.ts), in title order. */
export function TeamLeadership({ core }: { core: PublicTeamMember[] }) {
  if (core.length === 0) return null;

  return (
    <section id="leadership" data-tone="clear" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1240px] px-[var(--gutter)] py-24 md:py-32">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center sm:mb-20">
          <p className="t-eyebrow flex items-center justify-center gap-3">
            <span className="t-pixel text-sbg-accent">03</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Student Leadership
          </p>
          <h2 className="t-display mt-5 text-[clamp(34px,5vw,68px)] text-sbg-ink">
            Leading the <span className="t-serif text-sbg-accent">community.</span>
          </h2>
          <p className="t-lead mx-auto mt-5 max-w-md">
            The students who set the direction and keep every wing moving.
          </p>
        </Reveal>

        {(
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6">
            {core.map((m, i) => (
              <li key={m.id} className={span(i, core.length)}>
                <Reveal index={i % 3} className="h-full">
                  <article
                    data-tilt
                    className="surface lift flex h-full flex-col items-center gap-5 rounded-[28px] p-7 text-center"
                    style={{ backgroundImage: `linear-gradient(155deg, ${TINTS[i % TINTS.length]} 0%, var(--wash-80) 58%)` }}
                  >
                    <TeamAvatar
                      src={m.picture_url}
                      name={m.name}
                      className={featured(i, core.length) ? "h-36 w-36 rounded-full" : "h-28 w-28 rounded-full"}
                    />
                    <div>
                      <span
                        className="badge-shimmer relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_6px_16px_-6px_rgba(124,58,237,0.55)]"
                        style={{ backgroundImage: "linear-gradient(135deg, #8b4ff2 0%, var(--lilac-600) 100%)" }}
                      >
                        <span aria-hidden="true" className="relative z-[2] h-1.5 w-1.5 rounded-full bg-white/80" />
                        <span className="relative z-[2]">{m.role}</span>
                      </span>
                      <h3 className="t-display mt-3 text-[24px] text-sbg-ink sm:text-[28px]">{m.name}</h3>
                      {detail(m) && <p className="mt-1.5 text-[13px] text-sbg-ink-3">{detail(m)}</p>}
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
