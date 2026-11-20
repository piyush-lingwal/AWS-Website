import { Reveal } from "@/components/design/Reveal";
import type { WingGroup } from "@/lib/team/roster";
import { TeamAvatar } from "./TeamAvatar";

const TINTS = ["var(--card-lilac)", "var(--card-peach)", "var(--card-rose)", "var(--card-sky)", "var(--card-mint)", "var(--card-blush)"];

const LEAD_TINT = "var(--card-lilac)";

const wingTitle = (wing: string) => (/wing|team$/i.test(wing) ? wing : `${wing} Wing`);

/** Display title for a plain member (role = NULL): "Tech Member", "PR Member", ... Display only; the data is unchanged. */
const memberLabel = (wing: string) => `${wing.replace(/\s+wing$/i, "")} Member`;

/** Everyone with a wing set, grouped by it. Titled people (wing leads) get a larger highlighted card; plain members show "<Wing> Member". Photos fall back to the shared placeholder. */
export function TeamMembersDirectory({ wings }: { wings: WingGroup[] }) {
  if (wings.length === 0) return null;

  return (
    <section id="wings" data-tone="bloom" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1240px] px-[var(--gutter)] py-24 md:py-32">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
          <p className="t-eyebrow flex items-center justify-center gap-3">
            <span className="t-pixel text-sbg-accent">04</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Builder Wings
          </p>
          <h2 className="t-display mt-5 text-[clamp(34px,5vw,68px)] text-sbg-ink">
            Every wing, <span className="t-serif text-sbg-accent">every builder.</span>
          </h2>
        </Reveal>

        <div className="space-y-16 sm:space-y-20">
          {wings.map((group, gi) => (
            <div key={group.wing}>
              <Reveal className="mb-6 flex items-center gap-4 sm:mb-8">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0 rounded-[3px]"
                  style={{ background: gi === 0 ? "#FF9900" : "#AF8CFF" }}
                />
                <h3 className="t-display text-[clamp(24px,3vw,36px)] text-sbg-ink">{wingTitle(group.wing)}</h3>
                <span className="h-px flex-1 bg-[color:var(--line)]" />
                <span className="t-eyebrow">{group.members.length}</span>
              </Reveal>

              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.members.map((m, i) => {
                  const lead = Boolean(m.role?.trim());
                  const detail = [m.course, m.branch].filter(Boolean).join(" · ");
                  return (
                    <li key={m.id} className={lead ? "sm:col-span-2" : undefined}>
                      <Reveal index={i % 4} className="h-full">
                        {lead ? (
                          // Wing lead: the Leadership card treatment (role chip, bigger avatar, rounder card), plus a lilac border.
                          <article
                            data-tilt
                            className="surface lift flex h-full items-center gap-5 rounded-[28px] border-2 border-sbg-lilac-300 p-5 sm:p-6"
                            style={{ backgroundImage: `linear-gradient(155deg, ${LEAD_TINT} 0%, var(--wash-80) 58%)` }}
                          >
                            <TeamAvatar src={m.picture_url} name={m.name} className="h-24 w-24 shrink-0 rounded-full" />
                            <div className="min-w-0">
                              <span className="inline-flex max-w-full items-center truncate rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sbg-accent-strong">
                                {m.role}
                              </span>
                              <h4 className="t-display mt-2 truncate text-[22px] text-sbg-ink sm:text-[24px]">{m.name}</h4>
                              {detail && <p className="mt-1 truncate text-[13px] text-sbg-ink-3">{detail}</p>}
                            </div>
                          </article>
                        ) : (
                          <article
                            className="surface lift flex h-full items-center gap-4 rounded-[24px] p-4"
                            style={{
                              backgroundImage: `linear-gradient(155deg, ${TINTS[(gi + i) % TINTS.length]} 0%, var(--wash-80) 58%)`,
                            }}
                          >
                            <TeamAvatar src={m.picture_url} name={m.name} className="h-16 w-16 shrink-0 rounded-2xl border-2" />
                            <div className="min-w-0">
                              <p className="t-eyebrow truncate text-sbg-accent-strong">{memberLabel(group.wing)}</p>
                              <h4 className="t-display truncate text-[18px] text-sbg-ink">{m.name}</h4>
                              {detail && <p className="mt-1 truncate text-[12px] text-sbg-ink-3">{detail}</p>}
                            </div>
                          </article>
                        )}
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
