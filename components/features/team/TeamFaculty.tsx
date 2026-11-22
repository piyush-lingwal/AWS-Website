import { Reveal } from "@/components/design/Reveal";
import { TeamAvatar } from "./TeamAvatar";
import { FACULTY_COORDINATORS, HOD } from "@/lib/team/faculty";

export function TeamFaculty() {
  return (
    <section id="faculty" data-tone="bloom" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1240px] px-[var(--gutter)] py-24 md:py-28">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <p className="t-eyebrow flex items-center justify-center gap-3">
            <span className="t-pixel text-sbg-accent">02</span>
            <span className="h-px w-10 bg-sbg-lilac-300" />
            Faculty
          </p>
          <h2 className="t-display mt-5 text-[clamp(34px,5vw,64px)] text-sbg-ink">
            Guided by our <span className="t-serif text-sbg-accent">mentors.</span>
          </h2>
        </Reveal>

        {/* HOD */}
        <Reveal className="mx-auto max-w-3xl">
          <article
            className="surface relative flex flex-col items-center gap-6 overflow-hidden rounded-[32px] p-7 text-center sm:flex-row sm:gap-9 sm:p-10 sm:text-left"
            style={{ backgroundImage: "linear-gradient(155deg, var(--card-lilac) 0%, var(--wash-80) 58%)" }}
          >
            <TeamAvatar src={HOD.picture} name={HOD.name} className="h-32 w-32 rounded-full sm:h-40 sm:w-40" />
            <div>
              <span className="badge-shimmer relative inline-flex items-center gap-1.5 rounded-full bg-[#FF9900] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_6px_16px_-6px_rgba(234,138,0,0.55)]">
                <span aria-hidden="true" className="relative z-[2] h-1.5 w-1.5 rounded-full bg-white/80" />
                <span className="relative z-[2]">{HOD.title}</span>
              </span>
              <h3 className="t-display mt-3 text-[clamp(28px,3.6vw,42px)] text-sbg-ink">{HOD.name}</h3>
            </div>
          </article>
        </Reveal>

        {/* Faculty Coordinators */}
        <div className="mx-auto mt-5 grid max-w-3xl grid-cols-1 gap-5 sm:mt-6 sm:grid-cols-2 sm:gap-6">
          {FACULTY_COORDINATORS.map((f, i) => (
            <Reveal key={f.name} index={i + 1}>
              <article
                className="surface lift flex h-full items-center gap-5 rounded-[28px] p-6"
                style={{
                  backgroundImage: `linear-gradient(155deg, ${i === 0 ? "var(--card-peach)" : "var(--card-sky)"} 0%, var(--wash-80) 58%)`,
                }}
              >
                <TeamAvatar src={f.picture} name={f.name} className="h-20 w-20 rounded-full sm:h-24 sm:w-24" />
                <div className="min-w-0">
                  <span className="badge-shimmer relative inline-flex items-center gap-1.5 rounded-full bg-[#FF9900] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_6px_16px_-6px_rgba(234,138,0,0.5)]">
                    <span aria-hidden="true" className="relative z-[2] h-1.5 w-1.5 rounded-full bg-white/80" />
                    <span className="relative z-[2]">{f.title}</span>
                  </span>
                  <h3 className="t-display mt-1.5 text-[24px] text-sbg-ink sm:text-[26px]">{f.name}</h3>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
