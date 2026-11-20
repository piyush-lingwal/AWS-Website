<a name="readme-top"></a>
<div align="center">

<img src="./.github/assets/banner.svg" alt="AWS Student Builder Group — Tulas University, Dehradun" width="100%" />

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-EF008F?logo=framer&logoColor=white)](https://www.framer.com/motion/)

**The home for AWS Student Builder Group at Tulas University — events, certificates, the team, and a light into the cloud.**

</div>

---

## About

This is the public site and internal tooling for **AWS SBG**: a Next.js 16 App Router project on Supabase. It covers the group's marketing pages, a live events and certificate pipeline (attendance → auto-issued, verifiable certificates), a photo/video gallery, a student roster, and an admin panel for running all of it.

The public pages use **Daylight Cloud** — a light, purple-and-orange theme with a scroll-reactive background, built from scratch for this project and documented in [`DESIGN.md`](./DESIGN.md). It supports dark mode on its core pages, though the toggle is currently hidden pending a final pass.

## Pages

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About — mission, pillars, the builder journey |
| `/events` | Events — upcoming and past sessions |
| `/team` | Team — leadership, faculty, wings (pulled live from Supabase) |
| `/learning-hub` | Learning Hub — AWS certifications and starter resources |
| `/gallery` | Gallery — photos and videos per event |
| `/register` | Join / registration |
| `/attendance` | Attendance check-in, issues a certificate on submit |
| `/verify/[certificateId]` | Public certificate verification |
| `/community` | Community channels (Meetup, WhatsApp, LinkedIn, Instagram) |
| `/admin` | Staff dashboard — events, certificates, team roster, media |
| `/media` | Media team portal — upload event photos/videos |

## Tech Stack

<table>
<tr>
<td valign="top" width="33%">

**Core**
- Next.js 16 (App Router)
- React 19 / TypeScript
- Supabase (Postgres, Auth, Storage)

</td>
<td valign="top" width="33%">

**Styling & Motion**
- Tailwind CSS
- Framer Motion
- `next-themes` (dark mode)

</td>
<td valign="top" width="33%">

**Everything else**
- Lucide icons
- `sonner` toasts
- Node's built-in test runner

</td>
</tr>
</table>

## Design System

The public theme — colors, type, spacing, dark-mode tokens, and the scroll-reactive background — is fully documented in **[`DESIGN.md`](./DESIGN.md)**. The short version:

- **Display:** Bricolage Grotesque · **Accent serif:** Instrument Serif · **Body:** Figtree
- **Palette:** soft paper whites and lilac, with AWS orange (`#FF9900`) as the one hot accent
- Each page section declares a `data-tone` (`dawn`, `bloom`, `violet`, `clear`...) that the background blends through as you scroll

## Project Structure

<details>
<summary><strong>Click to expand</strong></summary>

```
app/
├── (light)/              # Every Daylight Cloud public page (App Router group, no URL segment)
│   ├── layout.tsx          # Fonts + theme scope for this group
│   ├── page.tsx             # Home
│   ├── about/, events/, team/, learning-hub/, gallery/
│   ├── register/, verify/, attendance/, certificate/, community/
├── admin/                 # Staff dashboard (its own shell, not Daylight Cloud's public nav)
├── media/                 # Media team upload portal
├── api/                   # Route handlers: certificates, attendance, team, media, email
└── layout.tsx             # Root layout; renders the legacy dark Navbar/Footer on pages above

components/
├── design/                # Daylight Cloud: DesignNav, DesignFooter, ScrollAtmosphere, SectionDivider...
├── features/              # Per-page content: about/, events/, team/, gallery/, learning-hub/, register/
├── admin/                 # Admin dashboard components (certificates, team tab, media)
└── ui/                    # Shared primitives (icons, inputs, etc.)

lib/
├── design/                # Pure theme logic: atmosphere.ts, dark-palette.ts, pixel-cloud.ts, theme.ts
├── team/                  # Roster types + arrangement logic for the Team page and admin
├── certificates/, media/, email/, supabase/, admin/
└── utils.ts

supabase/
└── migrations/            # Postgres schema, applied manually against the live project

tests/                     # Mirrors the structure above; run with `npm test`
```

</details>

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + keys
npm run dev
```

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm test` | Run the test suite |
| `npm run lint` | Lint |

Database migrations under `supabase/migrations/` are **not** applied automatically — run new ones yourself against your Supabase project via the SQL editor, in order.

## Accessibility

- Visible focus rings throughout, `prefers-reduced-motion` respected on every animated component
- Semantic landmarks with proper `aria-label`/`aria-expanded`/`aria-current` on interactive nav elements
- Per-page SEO metadata (title, description, canonical, Open Graph) via the Next.js Metadata API

## Contributing

Maintained by the AWS SBG core team at Tulas University. Keep new sections self-contained, reuse the existing `components/design/*` building blocks and `daylight.css` tokens rather than hardcoding colors, and check `DESIGN.md` before adding a new visual pattern.

## License

No explicit license yet. Ask a maintainer before reusing code outside the AWS SBG community.

---

<div align="center">

Built by the **AWS Student Builder Group**, Tulas University, Dehradun.

[⬆ Back to top](#readme-top)

</div>
